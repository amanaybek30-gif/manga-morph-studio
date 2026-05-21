import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Globe, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { publishMangaStory } from "@/lib/manga.functions";

export const Route = createFileRoute("/_authenticated/dashboard/manga/$projectId")({
  component: Viewer,
});

type Panel = { id: string; panel_number: number; image_url: string | null; dialogue: string | null };
type Project = {
  id: string;
  status: string;
  progress: number;
  story_id: string;
  story: { id: string; title: string; genre: string | null; is_public: boolean; status: string } | null;
};

function Viewer() {
  const { projectId } = Route.useParams();
  const publishStory = useServerFn(publishMangaStory);
  const [project, setProject] = useState<Project | null>(null);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  const load = async () => {
    const [{ data: p }, { data: pn }] = await Promise.all([
      supabase.from("manga_projects").select("id,status,progress,story_id,story:stories(id,title,genre,is_public,status)").eq("id", projectId).single(),
      supabase.from("generated_panels").select("id,panel_number,image_url,dialogue").eq("project_id", projectId).order("panel_number"),
    ]);
    setProject(p as unknown as Project);
    setPanels((pn ?? []) as Panel[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`project_${projectId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "generated_panels", filter: `project_id=eq.${projectId}` }, load)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "manga_projects", filter: `id=eq.${projectId}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const publish = async () => {
    if (!project?.story?.id) return;
    setPublishing(true);
    try {
      await publishStory({ data: { projectId } });
      toast.success("Published! Your story is now live on the home page and Explore Stories.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Publishing failed");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <div className="p-10 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  }

  const isPublished = project?.story?.is_public === true && project?.story?.status === "published";
  const hasPanels = panels.length > 0;

  return (
    <div className="p-6 sm:p-10 max-w-5xl">
      <Link to="/dashboard/manga"><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">// {project?.story?.genre ?? "Manga"}</div>
          <h1 className="font-display text-3xl font-bold mb-2">{project?.story?.title ?? "Untitled"}</h1>
          <div className="text-sm text-muted-foreground capitalize">Status: {project?.status} · {project?.progress}%</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isPublished ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Check className="h-3.5 w-3.5" /> Published
              </span>
              {project?.story?.id && (
                <Link to="/story/$storyId" params={{ storyId: project.story.id }}>
                  <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4 mr-1.5" /> View public page</Button>
                </Link>
              )}
            </>
          ) : (
            <Button onClick={publish} disabled={publishing || !hasPanels} size="sm">
              {publishing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Globe className="h-4 w-4 mr-1.5" />}
              {publishing ? "Publishing…" : hasPanels ? "Publish story" : "Waiting for panels…"}
            </Button>
          )}
        </div>
      </div>

      {panels.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Loader2 className="h-6 w-6 text-primary mx-auto animate-spin mb-3" />
          <div className="text-muted-foreground">Waiting for panels…</div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {panels.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-panel rounded-2xl overflow-hidden shadow-soft"
            >
              <div className="aspect-square bg-muted relative">
                {p.image_url ? (
                  <img src={p.image_url} alt={`Panel ${p.panel_number}`} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Panel failed</div>
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-background/90 text-xs font-mono">#{p.panel_number}</div>
              </div>
              {p.dialogue && (
                <div className="p-4 text-sm border-t border-border italic">"{p.dialogue}"</div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
