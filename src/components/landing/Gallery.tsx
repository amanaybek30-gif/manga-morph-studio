import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import preview1 from "@/assets/preview-1.jpg";
import preview2 from "@/assets/preview-2.jpg";
import preview3 from "@/assets/preview-3.jpg";

const items = [
  { img: preview1, title: "The Last Warrior", genre: "Shounen · Action", author: "@kenji" },
  { img: preview2, title: "Petals at Dusk", genre: "Shoujo · Romance", author: "@aida" },
  { img: preview3, title: "Neo Addis 2099", genre: "Cyberpunk · Sci-Fi", author: "@rey" },
];

export function Gallery() {
  return (
    <section id="gallery" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div className="max-w-xl">
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3">// Gallery</div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
              Made by the <span className="text-gradient">community</span>
            </h2>
          </div>
          <Link to="/gallery" className="text-sm text-muted-foreground hover:text-foreground transition">
            View all stories →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative glass-panel rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-500 shadow-soft"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={item.img} alt={item.title} width={768} height={1024} loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-background via-background/85 to-transparent">
                <div className="text-xs text-primary font-mono mb-1">{item.genre}</div>
                <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                <div className="text-sm text-muted-foreground mt-1">{item.author}</div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
