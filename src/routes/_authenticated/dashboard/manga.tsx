import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Image as ImageIcon, Wand2, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { generateManga } from "@/lib/manga.functions";

export const Route = createFileRoute("/_authenticated/dashboard/manga")({
  component: MangaList,
});

type Row = {
  id: string;
  status: string;
  progress: number;
  art_style: string | null;
  panel_count: number;
  created_at: string;
  story: { id: string; title: string; genre: string | null } | null;
};

function MangaList() {
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const runGen = useServerFn(generateManga);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("manga_projects")
      .select("id,status,progress,art_style,panel_count,created_at,story:stories(id,title,genre)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase
      .channel("manga_projects_changes")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "manga_projects", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleGenerate = async (id: string) => {
    setBusy(id);
    toast.info("AI generation started — this may take a few minutes.");
    try {
      await runGen({ data: { projectId: id } });
      toast.success("Manga generated!");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(null);
    }
  };

  if (path !== "/dashboard/manga") return <Outlet />;

  return (
    <div className="p-6 sm:p-10 max-w-6xl">
      <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">// Library</div>
      <h1 className="font-display text-3xl font-bold mb-8">Generated Manga</h1>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[0, 1].map(i => <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center shadow-soft">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold">No manga projects yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Create a story to queue your first generation.</p>
          <Link to="/dashboard/stories/new">
            <Button className="mt-5 bg-primary hover:bg-primary/90 text-primary-foreground">Create a story</Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {rows.map((r) => {
            const StatusIcon = r.status === "completed" ? CheckCircle2 : r.status === "failed" ? AlertTriangle : Loader2;
            return (
              <div key={r.id} className="glass-panel rounded-2xl p-5 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-primary font-mono mb-1">{r.story?.genre ?? "Untagged"} · {r.panel_count} panels</div>
                    <h3 className="font-display text-lg font-semibold truncate">{r.story?.title ?? "Untitled"}</h3>
                    <div className="text-xs text-muted-foreground mt-1 capitalize flex items-center gap-1">
                      <StatusIcon className={`h-3 w-3 ${r.status === "generating" ? "animate-spin" : ""}`} />
                      {r.status}
                    </div>
                  </div>
                  <Link to="/dashboard/manga/$projectId" params={{ projectId: r.id }}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>

                {(r.status === "generating" || r.status === "pending") && (
                  <div className="mt-4">
                    <Progress value={r.progress} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">{r.progress}%</div>
                  </div>
                )}

                {(r.status === "pending" || r.status === "failed") && (
                  <Button
                    onClick={() => handleGenerate(r.id)}
                    disabled={busy === r.id}
                    className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {busy === r.id ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Generating…</> : <><Wand2 className="h-4 w-4 mr-1" /> Generate panels</>}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
