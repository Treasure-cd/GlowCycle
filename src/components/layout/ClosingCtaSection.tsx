import { ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function ClosingCtaSection() {
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
    <section ref={sectionRef} className="border-t border-border bg-primary-muted">
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        
        {/* Slide up 1 */}
        <h2 className={`font-display text-3xl font-bold leading-tight text-foreground md:text-4xl ${isVisible ? "animate-slide-up" : "opacity-0"}`}>
          Know your skin like you know your cycle.
        </h2>
        
        {/* Slide up 2 (Delayed) */}
        <p className={`mt-4 text-foreground/70 ${isVisible ? "animate-slide-up delay-100" : "opacity-0"}`}>
          One scan, read in context. Free to start.
        </p>
        
        {/* Slide up 3 (Delayed + upgraded hover styles) */}
        <div className={isVisible ? "animate-slide-up delay-200" : "opacity-0"}>
          <Link
            to="/auth?mode=signup"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-background shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-1 hover:bg-primary-hover hover:shadow-primary/40"
          >
            Get started
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
        
      </div>
    </section>
  );
}