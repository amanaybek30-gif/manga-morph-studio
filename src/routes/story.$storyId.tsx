import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles, ImageIcon, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getPublicStoryManga } from "@/lib/public-stories.functions";

export const Route = createFileRoute("/story/$storyId")({
  head: () => ({
    meta: [
      { title: "Story — Habesha Manga" },
      { name: "description", content: "Read this Ethiopian AI-generated anime story on Habesha Manga." },
    ],
  }),
  component: PublicStory,
});

type Story = { id: string; title: string; genre: string | null; description: string | null; status: string };
type Panel = { id: string; panel_number: number; image_url: string | null; dialogue: string | null };

function PublicStory() {
  const { storyId } = Route.useParams();
  const getStory = useServerFn(getPublicStoryManga);
  const [story, setStory] = useState<Story | null>(null);
  const [author, setAuthor] = useState<string>("creator");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");

  const load = async () => {
    setLoading(true);
    const data = await getStory({ data: { storyId } });
    setStory(data.story as Story | null);
    setAuthor(data.author?.name ?? "creator");
    setAvatar(data.author?.avatar ?? null);
    setStatus(data.projectStatus ?? "");
    setPanels(data.panels as Panel[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`public_story_${storyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "generated_panels" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [storyId]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">Habesha<span className="text-gradient">Manga</span></span>
          </Link>
          <Link to="/gallery" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Explore stories
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : !story ? (
          <div className="glass-panel rounded-2xl p-12 text-center">
            <h1 className="font-display text-2xl font-bold">Story not found</h1>
            <p className="text-muted-foreground mt-1">It may be private or removed.</p>
            <Link to="/gallery" className="inline-block mt-4 text-primary hover:underline">Back to stories</Link>
          </div>
        ) : (
          <>
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">// {story.genre ?? "Story"}</div>
            <h1 className="font-display text-4xl font-bold tracking-tight">{story.title}</h1>
            <div className="text-sm text-muted-foreground mt-1">by @{author}</div>
            {story.description && <p className="text-muted-foreground mt-3 max-w-2xl">{story.description}</p>}

            <div className="mt-8">
              {panels.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center">
                  <ImageIcon className="h-7 w-7 text-primary mx-auto mb-3" />
                  <div className="text-muted-foreground">
                    {status === "generating" ? "Scenes are being generated…" : "No scenes published yet."}
                  </div>
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
                          <img src={p.image_url} alt={`Scene ${p.panel_number}`} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Scene unavailable</div>
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
          </>
        )}
      </main>
    </div>
  );
}
