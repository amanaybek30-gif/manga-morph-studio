import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type PublicStoryRow = {
  id: string;
  title: string;
  description: string | null;
  story_text?: string | null;
  genre: string | null;
  cover_url: string | null;
  user_id: string;
  created_at?: string;
};

function plotFallback(story: Pick<PublicStoryRow, "description" | "story_text">) {
  const source = (story.description || story.story_text || "").replace(/\s+/g, " ").trim();
  return source.length > 180 ? `${source.slice(0, 177)}…` : source || null;
}

export const listPublicStories = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ limit: z.number().int().min(1).max(60).default(12) }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { data: stories, error } = await supabaseAdmin
      .from("stories")
      .select("id,title,description,story_text,genre,cover_url,user_id,created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);

    const rows = (stories ?? []) as PublicStoryRow[];
    const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
    const storyIds = rows.map((r) => r.id);

    const [{ data: profiles }, { data: projects }] = await Promise.all([
      userIds.length
        ? supabaseAdmin.from("profiles").select("id,username,display_name,avatar_url").in("id", userIds)
        : Promise.resolve({ data: [] }),
      storyIds.length
        ? supabaseAdmin
            .from("manga_projects")
            .select("id,story_id,created_at")
            .in("story_id", storyIds)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] }),
    ]);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const firstProjectByStory = new Map<string, string>();
    for (const project of projects ?? []) {
      if (!firstProjectByStory.has(project.story_id)) firstProjectByStory.set(project.story_id, project.id);
    }

    const projectIds = Array.from(firstProjectByStory.values());
    const { data: panels } = projectIds.length
      ? await supabaseAdmin
          .from("generated_panels")
          .select("project_id,image_url,panel_number")
          .in("project_id", projectIds)
          .not("image_url", "is", null)
          .order("panel_number", { ascending: true })
      : { data: [] };
    const coverByProject = new Map<string, string>();
    for (const panel of panels ?? []) {
      if (panel.image_url && !coverByProject.has(panel.project_id)) coverByProject.set(panel.project_id, panel.image_url);
    }

    return rows.map((story) => {
      const profile = profileMap.get(story.user_id);
      const projectId = firstProjectByStory.get(story.id);
      return {
        id: story.id,
        title: story.title,
        description: plotFallback(story),
        genre: story.genre,
        cover: story.cover_url ?? (projectId ? coverByProject.get(projectId) ?? null : null),
        author: profile?.username ?? profile?.display_name ?? "creator",
        avatar: profile?.avatar_url ?? null,
      };
    });
  });

export const getPublicStoryManga = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ storyId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: story, error } = await supabaseAdmin
      .from("stories")
      .select("id,title,description,story_text,genre,user_id,is_public,status")
      .eq("id", data.storyId)
      .eq("is_public", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!story) return { story: null, author: null, projectStatus: null, panels: [] };

    const [{ data: profile }, { data: projects }] = await Promise.all([
      supabaseAdmin.from("profiles").select("username,display_name,avatar_url").eq("id", story.user_id).maybeSingle(),
      supabaseAdmin
        .from("manga_projects")
        .select("id,status,created_at")
        .eq("story_id", data.storyId)
        .order("created_at", { ascending: false }),
    ]);

    const projectIds = (projects ?? []).map((p) => p.id);
    const { data: panelRows } = projectIds.length
      ? await supabaseAdmin
          .from("generated_panels")
          .select("id,project_id,panel_number,image_url,dialogue")
          .in("project_id", projectIds)
          .order("panel_number", { ascending: true })
      : { data: [] };

    const panelsByProject = new Map<string, typeof panelRows>();
    for (const project of projects ?? []) panelsByProject.set(project.id, []);
    for (const panel of panelRows ?? []) panelsByProject.get(panel.project_id)?.push(panel);

    const selectedProject = (projects ?? []).find((p) => (panelsByProject.get(p.id)?.length ?? 0) > 0) ?? projects?.[0] ?? null;
    const panels = selectedProject ? panelsByProject.get(selectedProject.id) ?? [] : [];

    return {
      story: {
        id: story.id,
        title: story.title,
        genre: story.genre,
        description: plotFallback(story),
        status: story.status,
      },
      author: {
        name: profile?.username ?? profile?.display_name ?? "creator",
        avatar: profile?.avatar_url ?? null,
      },
      projectStatus: selectedProject?.status ?? null,
      panels: panels.map((panel) => ({
        id: panel.id,
        panel_number: panel.panel_number,
        image_url: panel.image_url,
        dialogue: panel.dialogue,
      })),
    };
  });