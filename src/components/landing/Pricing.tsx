import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Spark", price: "0", desc: "Try the engine.",
    features: ["3 stories / month", "Up to 6 panels", "Watermarked exports", "Community gallery"],
  },
  {
    name: "Mangaka", price: "19", desc: "For serious creators.", featured: true,
    features: ["Unlimited stories", "Up to 60 panels / chapter", "HD exports, no watermark", "Character reference images", "Priority generation"],
  },
  {
    name: "Studio", price: "49", desc: "For teams & publishers.",
    features: ["Everything in Mangaka", "Collaborative projects", "API access", "Custom style training", "Dedicated support"],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3">// Pricing</div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Start free. <span className="text-gradient">Scale freely.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative glass rounded-2xl p-7 flex flex-col ${
                t.featured ? "border-primary/40 glow-primary scale-[1.02]" : ""
              }`}
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{t.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold">${t.price}</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>

              <ul className="mt-6 space-y-2.5 text-sm flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`mt-7 w-full ${
                  t.featured
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
                    : "glass border border-border hover:bg-white/5"
                }`}
                variant={t.featured ? "default" : "outline"}
              >
                {t.price === "0" ? "Start free" : "Choose " + t.name}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
