import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, PlusCircle, MoreVertical, Eye, RefreshCw, Trash2, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { deleteStory, generateManga, regenerateStory } from "@/lib/manga.functions";

export const Route = createFileRoute("/_authenticated/dashboard/stories/")({
  component: MyStories,
});

type Story = {
  id: string;
  title: string;
  genre: string | null;
  description: string | null;
  status: string;
  is_public: boolean;
  created_at: string;
};

function MyStories() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const regenFn = useServerFn(regenerateStory);
  const genFn = useServerFn(generateManga);
  const delFn = useServerFn(deleteStory);

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Story | null>(null);

  const load = () => {
    if (!user) return;
    supabase
      .from("stories")
      .select("id,title,genre,description,status,is_public,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setStories((data ?? []) as Story[]);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onRegenerate = async (s: Story) => {
    setBusyId(s.id);
    try {
      const { projectId } = await regenFn({ data: { storyId: s.id } });
      toast.success("Regenerating scenes…");
      navigate({ to: "/dashboard/manga/$projectId", params: { projectId } });
      // fire-and-forget the actual generation in the background
      genFn({ data: { projectId } }).catch((e) =>
        toast.error(e instanceof Error ? e.message : "Generation failed"),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not regenerate");
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (s: Story) => {
    setBusyId(s.id);
    try {
      await delFn({ data: { storyId: s.id } });
      toast.success("Story deleted");
      setStories((prev) => prev.filter((x) => x.id !== s.id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-6xl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">
            // Library
          </div>
          <h1 className="font-display text-3xl font-bold">My Stories</h1>
        </div>
        <Link to="/dashboard/stories/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-emerald">
            <PlusCircle className="h-4 w-4 mr-1" /> New story
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center shadow-soft">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold">No stories yet</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Your library is waiting for its first tale.
          </p>
          <Link to="/dashboard/stories/new">
            <Button className="mt-5 bg-primary hover:bg-primary/90 text-primary-foreground">
              Write your first story
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((s) => (
            <div
              key={s.id}
              className="glass-panel rounded-2xl p-5 shadow-soft hover:-translate-y-1 transition relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs text-primary font-mono mb-2">
                  {s.genre ?? "Untagged"} · {s.status}
                  {s.is_public ? " · public" : ""}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1.5 -mr-1 -mt-1 rounded-md hover:bg-muted text-muted-foreground"
                      aria-label="Options"
                      disabled={busyId === s.id}
                    >
                      {busyId === s.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreVertical className="h-4 w-4" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => navigate({ to: "/story/$storyId", params: { storyId: s.id } })}>
                      <Eye className="h-4 w-4 mr-2" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onRegenerate(s)}>
                      <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        navigate({ to: "/dashboard/stories/new" })
                      }
                    >
                      <Sparkles className="h-4 w-4 mr-2" /> New from scratch
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setConfirmDelete(s)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="font-display text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {s.description ?? "No description."}
              </p>
              <div className="text-xs text-muted-foreground mt-4">
                {new Date(s.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this story?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes "{confirmDelete?.title}" along with all generated scenes
              and characters. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete && onDelete(confirmDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
