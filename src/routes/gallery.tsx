import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Heart, Sparkles, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import preview1 from "@/assets/preview-1.jpg";
import preview2 from "@/assets/preview-2.jpg";
import preview3 from "@/assets/preview-3.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Gallery — Habesha Manga" }, { name: "description", content: "Browse manga stories created by the Habesha Manga community." }] }),
  component: GalleryPage,
});

const demo = [
  { id: "d1", title: "The Last Warrior of Lalibela", genre: "Shounen", author: "kenji", cover: preview1 },
  { id: "d2", title: "Petals at Dusk", genre: "Shoujo", author: "aida", cover: preview2 },
  { id: "d3", title: "Neo Addis 2099", genre: "Cyberpunk", author: "rey", cover: preview3 },
  { id: "d4", title: "Mountains Remember", genre: "Drama", author: "selam", cover: preview2 },
  { id: "d5", title: "Coffee & Constellations", genre: "Romance", author: "yonas", cover: preview1 },
  { id: "d6", title: "Iron Veil", genre: "Action", author: "marta", cover: preview3 },
];

function GalleryPage() {
  const [query, setQuery] = useState("");
  const [community, setCommunity] = useState<typeof demo>([]);

  useEffect(() => {
    supabase.from("stories").select("id, title, genre, cover_url, user_id").eq("is_public", true).limit(12)
      .then(({ data }) => {
        if (data && data.length) {
          setCommunity(data.map(d => ({
            id: d.id, title: d.title, genre: d.genre ?? "Untagged", author: "creator",
            cover: d.cover_url ?? preview1,
          })));
        }
      });
  }, []);

  const items = community.length ? community : demo;
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
            <h1 className="font-display text-4xl font-bold tracking-tight">Explore the <span className="text-gradient">gallery</span></h1>
            <p className="text-muted-foreground mt-2">Stories made by storytellers, brought to life by AI.</p>
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <article key={s.id} className="group glass-panel rounded-2xl overflow-hidden shadow-soft hover:-translate-y-1 transition">
              <div className="aspect-[3/4] overflow-hidden">
                <img src={s.cover} alt={s.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              </div>
              <div className="p-4">
                <div className="text-xs text-primary font-mono mb-1">{s.genre}</div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold leading-tight">{s.title}</h3>
                  <button className="text-muted-foreground hover:text-primary transition"><Heart className="h-4 w-4" /></button>
                </div>
                <div className="text-sm text-muted-foreground mt-1">@{s.author}</div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
