import { motion } from "framer-motion";
import preview1 from "@/assets/preview-1.jpg";
import preview2 from "@/assets/preview-2.jpg";
import preview3 from "@/assets/preview-3.jpg";

const items = [
  { img: preview1, title: "The Last Ronin", genre: "Shounen · Action", author: "@kenji" },
  { img: preview2, title: "Petals at Dusk", genre: "Shoujo · Romance", author: "@aiko" },
  { img: preview3, title: "Neo Edo 2099", genre: "Cyberpunk · Sci-Fi", author: "@rei" },
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
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
            View all stories →
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative glass rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-500"
            >
              <div className="aspect-[3/4] overflow-hidden bg-paper">
                <img
                  src={item.img}
                  alt={item.title}
                  width={768}
                  height={1024}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-background via-background/80 to-transparent">
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
