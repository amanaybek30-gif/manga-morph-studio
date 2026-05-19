import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type Character = {
  name: string;
  gender: string | null;
  age: number | null;
  hair_color: string | null;
  hair_style: string | null;
  eye_color: string | null;
  skin_tone: string | null;
  outfit_style: string | null;
  body_type: string | null;
  personality: string | null;
};

type Project = {
  id: string;
  user_id: string;
  story_id: string;
  panel_count: number;
  art_style: string | null;
  mood: string | null;
  camera_style: string | null;
  visual_intensity: string | null;
  story_pacing: string | null;
};

type Story = { title: string; genre: string | null; story_text: string | null };

function characterSheet(chars: Character[]): string {
  if (!chars.length) return "";
  return chars
    .map(
      (c) =>
        `${c.name} (${[c.gender, c.age && `${c.age}y`, c.body_type].filter(Boolean).join(", ")}): ${[
          c.hair_color && `${c.hair_color} ${c.hair_style ?? "hair"}`,
          c.eye_color && `${c.eye_color} eyes`,
          c.skin_tone && `${c.skin_tone} skin`,
          c.outfit_style && `wearing ${c.outfit_style}`,
          c.personality && `personality: ${c.personality}`,
        ]
          .filter(Boolean)
          .join("; ")}`,
    )
    .join(" | ");
}

async function callGateway(body: unknown, apiKey: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gateway ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function planPanels(project: Project, story: Story, chars: Character[], apiKey: string) {
  const sys = `You are a manga director. Break a story into exactly ${project.panel_count} sequential manga panels. Each panel must contain a visual scene description and optionally one short line of dialogue or caption. Return strictly valid JSON.`;
  const user = `Title: ${story.title}
Genre: ${story.genre ?? "general"}
Mood: ${project.mood ?? "balanced"}
Pacing: ${project.story_pacing ?? "steady"}
Characters: ${characterSheet(chars) || "none specified"}

Story:
${(story.story_text ?? "").slice(0, 6000)}

Return JSON: {"panels":[{"scene":"vivid visual description, who is in the panel, action, environment, camera angle","dialogue":"short line or empty"}]}. Exactly ${project.panel_count} panels.`;

  const json = await callGateway(
    {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    },
    apiKey,
  );
  const content: string = json.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content);
  const panels: { scene: string; dialogue?: string }[] = Array.isArray(parsed.panels) ? parsed.panels : [];
  return panels.slice(0, project.panel_count);
}

async function generatePanelImage(prompt: string, apiKey: string): Promise<string> {
  const json = await callGateway(
    {
      model: "google/gemini-2.5-flash-image",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    },
    apiKey,
  );
  const url: string | undefined =
    json.choices?.[0]?.message?.images?.[0]?.image_url?.url ??
    json.choices?.[0]?.message?.images?.[0]?.url;
  if (!url) throw new Error("No image returned from gateway");
  return url;
}

export const generateManga = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ projectId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const { data: project, error: pe } = await supabaseAdmin
      .from("manga_projects")
      .select("*")
      .eq("id", data.projectId)
      .eq("user_id", userId)
      .single();
    if (pe || !project) throw new Error("Project not found");

    const { data: story } = await supabaseAdmin
      .from("stories")
      .select("title, genre, story_text")
      .eq("id", project.story_id)
      .single();
    if (!story) throw new Error("Story not found");

    const { data: chars } = await supabaseAdmin
      .from("characters")
      .select("*")
      .eq("story_id", project.story_id);

    await supabaseAdmin
      .from("manga_projects")
      .update({ status: "generating", progress: 0 })
      .eq("id", project.id);

    try {
      const panels = await planPanels(
        project as Project,
        story as Story,
        (chars ?? []) as Character[],
        apiKey,
      );

      const sheet = characterSheet((chars ?? []) as Character[]);
      const styleHeader = `High quality colored anime/manga panel, ${project.art_style ?? "habesha-fusion"} style, ${project.mood ?? "cinematic"} mood, ${project.camera_style ?? "cinematic"} composition, ${project.visual_intensity ?? "vivid"} colors. Maintain consistent character appearances. Characters: ${sheet || "as described"}.`;

      for (let i = 0; i < panels.length; i++) {
        const p = panels[i];
        const prompt = `${styleHeader}\n\nPanel ${i + 1}/${panels.length}: ${p.scene}`;
        try {
          const dataUrl = await generatePanelImage(prompt, apiKey);
          // dataUrl is like data:image/png;base64,xxxx
          const [, mime, b64] = /^data:(image\/[a-z]+);base64,(.*)$/.exec(dataUrl) ?? [];
          if (!b64) throw new Error("Bad image data");
          const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          const ext = mime.split("/")[1] ?? "png";
          const path = `${userId}/${project.id}/${i + 1}.${ext}`;
          const { error: upErr } = await supabaseAdmin.storage
            .from("manga-panels")
            .upload(path, bytes, { contentType: mime, upsert: true });
          if (upErr) throw upErr;
          const { data: pub } = supabaseAdmin.storage.from("manga-panels").getPublicUrl(path);

          await supabaseAdmin.from("generated_panels").insert({
            project_id: project.id,
            user_id: userId,
            panel_number: i + 1,
            image_url: pub.publicUrl,
            dialogue: p.dialogue ?? null,
            prompt,
          });
        } catch (err) {
          await supabaseAdmin.from("generated_panels").insert({
            project_id: project.id,
            user_id: userId,
            panel_number: i + 1,
            image_url: null,
            dialogue: p.dialogue ?? null,
            prompt: `[failed] ${err instanceof Error ? err.message : "unknown"}`,
          });
        }

        const progress = Math.round(((i + 1) / panels.length) * 100);
        await supabaseAdmin
          .from("manga_projects")
          .update({ progress })
          .eq("id", project.id);
      }

      await supabaseAdmin
        .from("manga_projects")
        .update({ status: "completed", progress: 100 })
        .eq("id", project.id);

      return { ok: true, count: panels.length };
    } catch (err) {
      await supabaseAdmin
        .from("manga_projects")
        .update({ status: "failed" })
        .eq("id", project.id);
      throw err;
    }
  });
