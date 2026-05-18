import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/favorites")({
  component: () => (
    <div className="p-6 sm:p-10 max-w-6xl">
      <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">// Saved</div>
      <h1 className="font-display text-3xl font-bold mb-8">Favorites</h1>
      <div className="glass-panel rounded-2xl p-12 text-center shadow-soft">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Heart className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-display text-xl font-semibold">No favorites yet</h3>
        <p className="text-muted-foreground text-sm mt-1">Heart stories in the gallery to save them here.</p>
      </div>
    </div>
  ),
});
