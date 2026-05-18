const quotes = [
  { q: "I wrote a novel in college that no one ever read. MangaMorph turned chapter one into 30 panels overnight.", a: "Maya Chen", r: "Indie Author" },
  { q: "Character consistency was always the wall. Reference images solved it. My OC finally looks like my OC.", a: "Devon Park", r: "Webtoon Artist" },
  { q: "Our writing class uses MangaMorph as a storyboarding tool. Students stay engaged for hours.", a: "Prof. R. Sato", r: "Creative Writing" },
];

export function Testimonials() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3">// Voices</div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Loved by <span className="text-gradient">storytellers</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {quotes.map((q) => (
            <figure key={q.a} className="glass rounded-2xl p-6 flex flex-col">
              <blockquote className="text-foreground/90 leading-relaxed flex-1">
                <span className="text-primary text-3xl font-display leading-none">"</span>
                {q.q}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent" />
                <div>
                  <div className="font-semibold text-sm">{q.a}</div>
                  <div className="text-xs text-muted-foreground">{q.r}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
