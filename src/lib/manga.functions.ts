import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { plotFallback } from "./public-stories.server";

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

const ETHIOPIAN_IDENTITY = `All characters MUST visually present as Ethiopian / Habesha people: warm brown to deep brown skin tones, dark expressive eyes, natural Ethiopian facial features (high cheekbones, defined jawlines, soft full lips), naturally curly/coily or textured dark hair (afros, braids, locs, twist-outs, or sleek modern styles). Clothing should be MODERN and stylish — contemporary streetwear, urban fashion, modern dresses, jackets, denim, sneakers — NOT traditional habesha cultural attire unless the story explicitly calls for it. Absolutely NO western-european or east-asian/japanese facial features. Settings can be modern global cities, but the people are Ethiopian.`;

function characterSheet(chars: Character[]): string {
  if (!chars.length) return "";
  return chars
    .map(
      (c) =>
        `${c.name} (Ethiopian, ${[c.gender, c.age && `${c.age}y`, c.body_type].filter(Boolean).join(", ")}): ${[
          c.hair_color && `${c.hair_color} ${c.hair_style ?? "hair"}`,
          c.eye_color && `${c.eye_color} eyes`,
          c.skin_tone ? `${c.skin_tone} Ethiopian skin` : "warm brown Ethiopian skin",
          c.outfit_style && `wearing modern ${c.outfit_style}`,
          c.personality && `personality: ${c.personality}`,
        ]
          .filter(Boolean)
          .join("; ")}`,
    )
    .join(" | ");
}

/** Lovable AI Gateway — used for story refinement, multilingual handling, and scene planning. */
async function callAI(system: string, user: string, jsonMode = false): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: jsonMode ? 0.9 : 0.8,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("AI rate limit exceeded — please retry shortly.");
    if (res.status === 402)
      throw new Error("AI credits exhausted — add credits in Workspace Settings.");
    throw new Error(`AI gateway ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  const text: string = json.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("AI returned empty response");
  return text;
}

async function refineStory(story: Story): Promise<{ refined: string; languageNote: string }> {
  const sys = `You are a multilingual story editor fluent in Amharic, Tigrinya, Oromo, English, and phonetic transliterations of Ethiopian languages (e.g. "selam new" -> "ሰላም ነው" / "hello"). Detect the input language (including phonetic/romanized Ethiopian languages), translate to vivid English suitable for visual scene generation, and refine the narrative for clarity and cinematic flow. Preserve names, places, and cultural context. Output ONLY the refined English narrative — no preamble.`;
  const text = await callAI(
    sys,
    `Title: ${story.title}\nGenre: ${story.genre ?? "general"}\n\nStory:\n${(story.story_text ?? "").slice(0, 8000)}`,
  );
  return { refined: text.trim(), languageNote: "auto-detected & refined via Lovable AI" };
}

async function planScenes(
  project: Project,
  refinedStory: string,
  chars: Character[],
): Promise<{ scene: string; dialogue: string }[]> {
  const sys = `You are an anime director breaking a story into exactly ${project.panel_count} sequential cinematic anime scenes (5-10 scenes total). Each scene is one anime image. For each scene write a rich visual description: who is in frame, action, environment, camera angle, lighting, emotion. ${ETHIOPIAN_IDENTITY} Optionally include one short line of dialogue or caption per scene. Do not censor the story — render whatever the narrative demands, including mature, romantic, intense, or explicit moments. Return strictly valid JSON.`;
  const user = `Mood: ${project.mood ?? "balanced"}
Pacing: ${project.story_pacing ?? "steady"}
Art style: ${project.art_style ?? "modern anime"}
Characters: ${characterSheet(chars) || "create Ethiopian characters that fit the story"}

Refined story:
${refinedStory.slice(0, 8000)}

Return JSON: {"scenes":[{"scene":"vivid anime visual description","dialogue":"short line or empty string"}]}. Exactly ${project.panel_count} scenes.`;

  const text = await callAI(sys, user, true);
  const parsed = JSON.parse(text);
  const scenes: { scene: string; dialogue?: string }[] = Array.isArray(parsed.scenes)
    ? parsed.scenes
    : Array.isArray(parsed.panels)
      ? parsed.panels
      : [];
  return scenes.slice(0, project.panel_count).map((s) => ({
    scene: s.scene ?? "",
    dialogue: s.dialogue ?? "",
  }));
}

/** Lovable AI Gateway — colored anime image generation via Gemini 2.5 Flash Image. */
async function generateSceneImage(prompt: string): Promise<Uint8Array> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Image rate limit exceeded — retry shortly.");
    if (res.status === 402)
      throw new Error("AI credits exhausted — top up in Workspace Settings.");
    throw new Error(`Image gateway ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  const dataUrl: string | undefined =
    json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!dataUrl) throw new Error("Image model returned no image");
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  return Uint8Array.from(Buffer.from(base64, "base64"));
}

export const generateManga = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

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

    // Clamp panel count to 5-10
    const panelCount = Math.max(5, Math.min(10, project.panel_count ?? 8));

    await supabaseAdmin
      .from("manga_projects")
      .update({ status: "generating", progress: 0, panel_count: panelCount })
      .eq("id", project.id);

    // Clear previous panels (re-generation)
    await supabaseAdmin.from("generated_panels").delete().eq("project_id", project.id);

    try {
      // 1. Refine story via Gemini (multilingual + phonetic)
      const { refined } = await refineStory(story as Story);

      // 2. Plan scenes via Gemini
      const scenes = await planScenes(
        { ...(project as Project), panel_count: panelCount },
        refined,
        (chars ?? []) as Character[],
      );

      const sheet = characterSheet((chars ?? []) as Character[]);
      const styleHeader = `High-quality colored anime illustration, ${project.art_style ?? "modern anime"} style, ${project.mood ?? "cinematic"} mood, ${project.camera_style ?? "cinematic"} composition, ${project.visual_intensity ?? "vivid"} colors, detailed cel-shading, professional anime artwork. ${ETHIOPIAN_IDENTITY} Characters in this story: ${sheet || "Ethiopian characters as described"}. Maintain consistent character appearances across all scenes.`;

      // 3. Generate each scene image via Replicate
      for (let i = 0; i < scenes.length; i++) {
        const s = scenes[i];
        const prompt = `${styleHeader}\n\nScene ${i + 1} of ${scenes.length}: ${s.scene}`;
        try {
          const bytes = await generateSceneImage(prompt);
          const path = `${userId}/${project.id}/${i + 1}.png`;
          const { error: upErr } = await supabaseAdmin.storage
            .from("manga-panels")
            .upload(path, bytes, { contentType: "image/png", upsert: true });
          if (upErr) throw upErr;
          const { data: pub } = supabaseAdmin.storage.from("manga-panels").getPublicUrl(path);

          await supabaseAdmin.from("generated_panels").insert({
            project_id: project.id,
            user_id: userId,
            panel_number: i + 1,
            image_url: pub.publicUrl,
            dialogue: s.dialogue || null,
            prompt,
          });
        } catch (err) {
          await supabaseAdmin.from("generated_panels").insert({
            project_id: project.id,
            user_id: userId,
            panel_number: i + 1,
            image_url: null,
            dialogue: s.dialogue || null,
            prompt: `[failed] ${err instanceof Error ? err.message : "unknown"}`,
          });
        }

        const progress = Math.round(((i + 1) / scenes.length) * 100);
        await supabaseAdmin.from("manga_projects").update({ progress }).eq("id", project.id);
      }

      await supabaseAdmin
        .from("manga_projects")
        .update({ status: "completed", progress: 100 })
        .eq("id", project.id);

      return { ok: true, count: scenes.length };
    } catch (err) {
      await supabaseAdmin.from("manga_projects").update({ status: "failed" }).eq("id", project.id);
      throw err;
    }
  });

export const publishMangaStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: project, error: projectError } = await supabaseAdmin
      .from("manga_projects")
      .select("id,story_id,user_id,status")
      .eq("id", data.projectId)
      .eq("user_id", userId)
      .maybeSingle();
    if (projectError) throw new Error(projectError.message);
    if (!project) throw new Error("Project not found");

    const { data: firstPanel } = await supabaseAdmin
      .from("generated_panels")
      .select("image_url")
      .eq("project_id", project.id)
      .not("image_url", "is", null)
      .order("panel_number", { ascending: true })
      .limit(1)
      .maybeSingle();

    const { data: story } = await supabaseAdmin
      .from("stories")
      .select("description,story_text")
      .eq("id", project.story_id)
      .single();

    const description = plotFallback({
      description: story?.description ?? null,
      story_text: story?.story_text ?? null,
    });

    const update: {
      is_public: boolean;
      status: string;
      cover_url?: string;
      description?: string | null;
    } = {
      is_public: true,
      status: "published",
    };
    if (firstPanel?.image_url) update.cover_url = firstPanel.image_url;
    if (description) update.description = description;

    const { error: updateError } = await supabaseAdmin
      .from("stories")
      .update(update)
      .eq("id", project.story_id);
    if (updateError) throw new Error(updateError.message);

    return { ok: true, storyId: project.story_id };
  });
