import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative pt-24 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="glass rounded-3xl p-10 sm:p-14 relative overflow-hidden mb-12">
          <div className="absolute inset-0 halftone opacity-30" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/30 blur-3xl rounded-full" />
          <div className="relative text-center max-w-2xl mx-auto">
            <h3 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
              Your story deserves <span className="text-gradient">panels.</span>
            </h3>
            <p className="mt-4 text-muted-foreground">Join 12,400+ creators turning prose into manga.</p>
            <button className="mt-8 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-7 py-3 rounded-xl font-semibold shadow-glow transition">
              Create your first story
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-display font-bold text-foreground">MangaMorph</span>
            <span>© 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition">Privacy</a>
            <a href="#" className="hover:text-foreground transition">Terms</a>
            <a href="#" className="hover:text-foreground transition">Discord</a>
            <a href="#" className="hover:text-foreground transition">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
