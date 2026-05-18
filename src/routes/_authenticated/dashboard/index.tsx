import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PlusCircle, BookOpen, Image as ImageIcon, Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ stories: 0, panels: 0, favorites: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [s, p, f] = await Promise.all([
        supabase.from("stories").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("generated_panels").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setStats({ stories: s.count ?? 0, panels: p.count ?? 0, favorites: f.count ?? 0 });
    })();
  }, [user]);

  const cards = [
    { label: "Stories", value: stats.stories, icon: BookOpen },
    { label: "Panels generated", value: stats.panels, icon: ImageIcon },
    { label: "Favorites", value: stats.favorites, icon: Heart },
  ];

  return (
    <div className="p-6 sm:p-10 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">// Dashboard</div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            Welcome back, <span className="text-gradient">{user?.user_metadata?.display_name ?? user?.email?.split("@")[0]}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Pick up where you left off, or start something new.</p>
        </div>
        <Link to="/dashboard/stories/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-emerald">
            <PlusCircle className="h-4 w-4 mr-1" /> New story
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="glass-panel rounded-2xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-8 shadow-soft text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-display text-xl font-semibold">Ready to create?</h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
          Write your story, design your characters, and watch the AI bring it to life.
        </p>
        <Link to="/dashboard/stories/new">
          <Button className="mt-5 bg-primary hover:bg-primary/90 text-primary-foreground">Start a new story</Button>
        </Link>
      </div>
    </div>
  );
}
