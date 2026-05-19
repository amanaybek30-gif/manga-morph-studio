import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-manga.jpg";

export function Hero() {
  return (
    <section className="relative pt-36 pb-24 overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-50 pointer-events-none" />
      <div className="absolute -top-32 right-0 w-[700px] h-[700px] rounded-full bg-primary/10 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-40 left-0 w-[500px] h-[500px] rounded-full bg-gold/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 glass-panel rounded-full px-4 py-1.5 text-xs text-muted-foreground mb-6">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            AI-powered manga generation · Inspired by Habesha culture
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            Turn Your <br />
            Stories Into <span className="text-gradient">Manga</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Transform written stories into stunning colored anime panels in seconds.
            Build characters, direct scenes, and bring your imagination to life — frame by cinematic frame.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-emerald group">
                Create Story
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition" />
              </Button>
            </Link>
            <Link to="/gallery">
              <Button size="lg" variant="outline" className="border-border hover:bg-accent">
                <Play className="mr-1 h-4 w-4" />
                Explore Stories
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary to-gold" />
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
          <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 via-gold/20 to-transparent blur-2xl" />
          <div className="relative glass-panel rounded-3xl overflow-hidden shadow-soft">
            <img
              src={hero}
              alt="Habesha anime heroine in emerald regalia"
              width={1536}
              height={1024}
              className="w-full h-auto"
            />
            <div className="absolute bottom-4 left-4 right-4 glass-panel rounded-xl p-3 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <div className="text-xs text-muted-foreground">Generating panel 04 of 12 · Habesha style</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
