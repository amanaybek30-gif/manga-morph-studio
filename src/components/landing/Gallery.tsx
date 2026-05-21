import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ImageIcon, ArrowRight } from "lucide-react";
import { listPublicStories } from "@/lib/public-stories.functions";

type Item = {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  cover: string | null;
  author: string;
  avatar: string | null;
};

export function Gallery() {
  const getStories = useServerFn(listPublicStories);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const list = await getStories({ data: { limit: 6 } });
      setItems(list as Item[]);
      setLoading(false);
    })();
  }, [getStories]);

  return (
    <section id="gallery" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div className="max-w-xl">
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3">
              // Gallery
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
              Made by the <span className="text-gradient">community</span>
            </h2>
          </div>
          <Link
            to="/gallery"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Explore all stories →
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 text-center">
            <ImageIcon className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-display text-xl font-semibold">No published stories yet</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Be the first to publish an Ethiopian anime story.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {items.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative glass-panel rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-500 shadow-soft flex flex-col"
              >
                <div className="aspect-[3/4] overflow-hidden bg-muted">
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col gap-3 flex-1">
                  {item.genre && <div className="text-xs text-primary font-mono">{item.genre}</div>}
                  <h3 className="font-display text-xl font-semibold leading-tight">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.author}
                          className="h-7 w-7 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                          {item.author.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm text-muted-foreground truncate">@{item.author}</span>
                    </div>
                    <Link
                      to="/story/$storyId"
                      params={{ storyId: item.id }}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
                    >
                      View <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
