import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-manga.jpg";

export function Hero() {
  return (
    <section className="relative pt-36 pb-24 overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-40 pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/20 blur-3xl pointer-events-none animate-pulse-glow" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-muted-foreground mb-6">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            AI-powered manga generation · Now in beta
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            Turn Your <br />
            Stories Into <span className="text-gradient">Manga</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Transform written stories into stunning manga panels in seconds. Build characters,
            direct scenes, and bring your imagination to life — frame by cinematic frame.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow group">
              Create Story
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition" />
            </Button>
            <Button size="lg" variant="outline" className="glass border-border hover:bg-white/5">
              <Play className="mr-1 h-4 w-4" />
              Explore Gallery
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary to-accent" />
              ))}
            </div>
            <span><span className="text-foreground font-semibold">12,400+</span> creators worldwide</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/40 via-accent/30 to-transparent blur-2xl" />
          <div className="relative glass rounded-3xl overflow-hidden border border-white/10">
            <img
              src={hero}
              alt="Manga heroine surrounded by floating panels"
              width={1536}
              height={1024}
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 glass rounded-xl p-3 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <div className="text-xs text-muted-foreground">Generating panel 04 of 12 · Shoujo style</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
