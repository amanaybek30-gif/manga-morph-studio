import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
        <div className="glass rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 blur-md bg-primary opacity-60 group-hover:opacity-100 transition" />
              <Sparkles className="relative h-6 w-6 text-primary" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              Manga<span className="text-gradient">Morph</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#gallery" className="hover:text-foreground transition">Gallery</a>
            <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
