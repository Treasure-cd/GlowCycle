import { CameraIcon, MoonStarsIcon, CloudSunIcon, SparkleIcon } from "@phosphor-icons/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

function InputCard({
  icon,
  label,
  desc,
  highlight = false,
  className = ""
}: {
  icon: ReactNode;
  label: string;
  desc: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex w-44 flex-col items-center gap-2 rounded-2xl border p-5 text-center ${
        highlight
          ? "border-primary bg-primary text-background"
          : "border-border bg-background text-foreground"
      } ${className}`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          highlight ? "bg-background/15" : "bg-primary-muted text-primary"
        }`}
      >
        {icon}
      </div>
      <p className="font-medium">{label}</p>
      <p className={`text-xs leading-snug ${highlight ? "text-background/75" : "text-foreground/60"}`}>
        {desc}
      </p>
    </div>
  );
}

function Operator({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <span className={`font-mono text-2xl text-foreground/30 ${className}`} aria-hidden="true">
      {children}
    </span>
  );
}

export default function ConceptSection() {
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
    <section ref={sectionRef} className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-24">
        {/* Slide up text */}
        <p className={`font-sm text-xs uppercase tracking-wider text-primary ${isVisible ? "animate-slide-up" : "opacity-0"}`}>The tea</p>
        <h2 className={`mt-4 max-w-xl font-display text-3xl font-bold leading-tight text-foreground md:text-4xl ${isVisible ? "animate-slide-up delay-100" : "opacity-0"}`}>
          Skin doesn't exist in a vacuum.
        </h2>
        <p className={`mt-4 max-w-md text-foreground/70 ${isVisible ? "animate-slide-up delay-200" : "opacity-0"}`}>
          Most skin apps score a photo and stop there. GlowCycle treats that
          score as one variable among three. The same reading means
          something different on day 3 than on day 24, and something
          different again in July than in January.
        </p>

        {/* Staggered fade in cards */}
        <div className="mt-16 flex flex-col items-center justify-center gap-4 md:flex-row md:gap-5">
          <InputCard
            className={isVisible ? "animate-fade-in delay-300" : "opacity-0"}
            icon={<CameraIcon size={20} weight="bold" />}
            label="Your scan"
            desc="Texture, oil, redness, and moisture, read from a photo."
          />
          <Operator className={isVisible ? "animate-fade-in delay-400" : "opacity-0"}>+</Operator>
          <InputCard
            className={isVisible ? "animate-fade-in delay-400" : "opacity-0"}
            icon={<MoonStarsIcon size={20} weight="bold" />}
            label="Your cycle"
            desc="Where you are in a roughly 28-day hormonal rhythm."
          />
          <Operator className={isVisible ? "animate-fade-in delay-500" : "opacity-0"}>+</Operator>
          <InputCard
            className={isVisible ? "animate-fade-in delay-500" : "opacity-0"}
            icon={<CloudSunIcon size={20} weight="bold" />}
            label="Your climate"
            desc="Heat, cold, and humidity shift what's normal."
          />
          <Operator className={isVisible ? "animate-fade-in delay-600" : "opacity-0"}>=</Operator>
          <InputCard
            className={isVisible ? "animate-fade-in delay-700" : "opacity-0"}
            icon={<SparkleIcon size={20} weight="bold" />}
            label="Context"
            desc="Whether today's reading is typical — or worth watching."
            highlight
          />
        </div>
      </div>
    </section>
  );
}