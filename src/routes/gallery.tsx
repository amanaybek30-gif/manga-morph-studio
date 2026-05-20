import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Heart, Sparkles, ArrowLeft, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Explore Stories — Habesha Manga" }, { name: "description", content: "Browse Ethiopian anime stories created by the Habesha Manga community." }] }),
  component: GalleryPage,
});

type Item = {
  id: string;
  title: string;
  genre: string;
  author: string;
  cover: string | null;
};

function GalleryPage() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: stories } = await supabase
        .from("stories")
        .select("id, title, genre, cover_url, user_id")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(60);

      const rows = (stories ?? []) as Array<{ id: string; title: string; genre: string | null; cover_url: string | null; user_id: string }>;
      const userIds = Array.from(new Set(rows.map(r => r.user_id)));
      const { data: profs } = userIds.length
        ? await supabase.from("profiles").select("id, username").in("id", userIds)
        : { data: [] as Array<{ id: string; username: string | null }> };
      const profMap = new Map((profs ?? []).map(p => [p.id, p.username ?? "creator"]));

      const list: Item[] = [];
      for (const s of rows) {
        let cover = s.cover_url;
        if (!cover) {
          const { data: panel } = await supabase
            .from("generated_panels")
            .select("image_url, manga_projects!inner(story_id)")
            .eq("manga_projects.story_id", s.id)
            .not("image_url", "is", null)
            .order("panel_number")
            .limit(1)
            .maybeSingle();
          cover = (panel as { image_url: string | null } | null)?.image_url ?? null;
        }
        list.push({
          id: s.id,
          title: s.title,
          genre: s.genre ?? "Untagged",
          author: profMap.get(s.user_id) ?? "creator",
          cover,
        });
      }
      setItems(list);
      setLoading(false);
    })();
  }, []);

  const filtered = items.filter(i => i.title.toLowerCase().includes(query.toLowerCase()) || i.genre.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">Habesha<span className="text-gradient">Manga</span></span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">// Community</div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Explore <span className="text-gradient">stories</span></h1>
            <p className="text-muted-foreground mt-2">Ethiopian anime stories, brought to life by AI.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search stories or genres…" className="pl-9" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {["All", "Action", "Romance", "Fantasy", "Sci-Fi", "Cyberpunk", "Slice of Life", "Historical"].map(t => (
            <button key={t} onClick={() => setQuery(t === "All" ? "" : t)}
              className="px-3 py-1.5 rounded-full text-xs border border-border bg-card hover:bg-accent transition">
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0,1,2,3,4,5].map(i => <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 text-center">
            <ImageIcon className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-display text-xl font-semibold">No stories yet</h3>
            <p className="text-muted-foreground text-sm mt-1">Be the first to publish an Ethiopian anime story.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => (
              <Link key={s.id} to="/story/$storyId" params={{ storyId: s.id }} className="group glass-panel rounded-2xl overflow-hidden shadow-soft hover:-translate-y-1 transition block">
                <div className="aspect-[3/4] overflow-hidden bg-muted">
                  {s.cover ? (
                    <img src={s.cover} alt={s.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs text-primary font-mono mb-1">{s.genre}</div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold leading-tight">{s.title}</h3>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">@{s.author}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
