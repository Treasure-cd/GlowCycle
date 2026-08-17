import { Check, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";


const SAMPLE = {
  context: "Day 24 · Luteal · Hot & humid",
  try: ["Niacinamide", "Gentle BHA", "Zinc PCA"],
  skip: ["Heavy oils", "Strong retinoids", "New actives"],
};

export default function RoutineSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2">

        <div>
          <p className={`font-sm text-xs uppercase tracking-wider text-primary ${isVisible ? "animate-slide-up" : "opacity-0"}`}>
            From context to routine
          </p>
          <h2 className={`mt-4 max-w-md font-display text-3xl font-bold leading-tight text-foreground md:text-4xl ${isVisible ? "animate-slide-up delay-100" : "opacity-0"}`}>
            It also tells you what to skip.
          </h2>
          <p className={`mt-4 max-w-md text-foreground/70 ${isVisible ? "animate-slide-up delay-200" : "opacity-0"}`}>
            Once GlowCycle knows your context, it maps it to concrete
            guidance — not a universal "best products" list, but what fits
            your skin, your phase, and your climate, today.
          </p>
          <p className={`mt-6 text-xs text-foreground/40 ${isVisible ? "animate-slide-up delay-300" : "opacity-0"}`}>
            General skincare guidance, not medical advice.
          </p>
        </div>

    <div className={`relative ${isVisible ? "animate-fade-in delay-400" : "opacity-0"}`}>

          <div className="absolute top-1/2 left-1/2 -z-10 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[80px]" />
          
          <div className="rounded-3xl border border-border bg-surface/80 p-6 shadow-xl shadow-foreground/5 backdrop-blur-xl md:p-8">
            <p className="font-mono text-xs text-foreground/50">Sample reading</p>
          <p className="mt-1 font-mono text-sm text-primary">{SAMPLE.context}</p>

          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-foreground/60">
                Try
              </p>
              <ul className="space-y-2">
                {SAMPLE.try.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <Check size={14} weight="bold" className="shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-foreground/60">
                Skip
              </p>
              <ul className="space-y-2">
                {SAMPLE.skip.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground/60">
                    <X size={14} weight="bold" className="shrink-0 text-foreground/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}