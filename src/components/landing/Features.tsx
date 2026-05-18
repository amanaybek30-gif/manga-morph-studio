import { BookOpen, Users, Wand2, Layers, Palette, Zap } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: BookOpen, title: "Story-First Engine", desc: "Paste your prose. We extract scenes, dialogue and pacing automatically." },
  { icon: Users, title: "Character Consistency", desc: "Build rich character profiles with reference images for visual continuity." },
  { icon: Wand2, title: "Director Controls", desc: "Choose mood, camera angles, dialogue density, and visual intensity." },
  { icon: Palette, title: "Multi-Style Art", desc: "Shoujo, shounen, seinen, cyberpunk — pick a style that fits your tale." },
  { icon: Layers, title: "Panel Composition", desc: "Speech bubbles, gutters and dramatic layouts assembled automatically." },
  { icon: Zap, title: "Lightning Pipeline", desc: "Generate full chapters in minutes with our distributed render pipeline." },
];

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3">// Features</div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            A studio in your <span className="text-gradient">browser</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Everything you need to script, direct, and publish a manga — without lifting a pen.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass rounded-2xl p-6 hover:bg-white/[0.04] transition group relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition" />
              <div className="relative">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
