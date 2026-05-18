import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/stories/")({
  component: MyStories,
});

type Story = { id: string; title: string; genre: string | null; description: string | null; status: string; created_at: string };

function MyStories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("stories").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setStories(data ?? []); setLoading(false); });
  }, [user]);

  return (
    <div className="p-6 sm:p-10 max-w-6xl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">// Library</div>
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
          {[0, 1, 2].map(i => <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : stories.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center shadow-soft">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold">No stories yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Your library is waiting for its first tale.</p>
          <Link to="/dashboard/stories/new">
            <Button className="mt-5 bg-primary hover:bg-primary/90 text-primary-foreground">Write your first story</Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((s) => (
            <div key={s.id} className="glass-panel rounded-2xl p-5 shadow-soft hover:-translate-y-1 transition">
              <div className="text-xs text-primary font-mono mb-2">{s.genre ?? "Untagged"} · {s.status}</div>
              <h3 className="font-display text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.description ?? "No description."}</p>
              <div className="text-xs text-muted-foreground mt-4">
                {new Date(s.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
