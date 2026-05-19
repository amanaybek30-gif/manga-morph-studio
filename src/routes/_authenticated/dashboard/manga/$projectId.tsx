import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/manga/$projectId")({
  component: Viewer,
});

type Panel = { id: string; panel_number: number; image_url: string | null; dialogue: string | null };
type Project = { id: string; status: string; progress: number; story: { title: string; genre: string | null } | null };

function Viewer() {
  const { projectId } = Route.useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [{ data: p }, { data: pn }] = await Promise.all([
      supabase.from("manga_projects").select("id,status,progress,story:stories(title,genre)").eq("id", projectId).single(),
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

  if (loading) {
    return <div className="p-10 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl">
      <Link to="/dashboard/manga"><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button></Link>
      <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">// {project?.story?.genre ?? "Manga"}</div>
      <h1 className="font-display text-3xl font-bold mb-2">{project?.story?.title ?? "Untitled"}</h1>
      <div className="text-sm text-muted-foreground mb-8 capitalize">Status: {project?.status} · {project?.progress}%</div>

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
