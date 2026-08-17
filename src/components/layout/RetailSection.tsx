import { Link } from "react-router-dom";
import { CheckCircle } from "@phosphor-icons/react";

export default function RetailSection() {
  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">For retailers</p>
          <h2 className="mt-4 max-w-md font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
            Meet them at the moment they're deciding.
          </h2>
          <p className="mt-4 max-w-md text-foreground/70">
            Nobody wonders about their skin in the abstract — they wonder standing in front of a shelf, phone in
            hand. Link any product page to a quick scan that tells a shopper, right then, whether it actually fits
            their skin today.
          </p>
          <Link
            to="/check"
            className="mt-8 inline-flex items-center rounded-full bg-primary px-6 py-3 font-medium text-background transition-colors hover:bg-primary-hover"
          >
            Try it
          </Link>
        </div>

        <div className="rounded-3xl border border-border bg-background p-6 md:p-8">
          <p className="font-mono text-xs uppercase tracking-wide text-foreground/50">Checking</p>
          <p className="mt-1 font-display text-lg font-bold text-foreground">10% Niacinamide + Zinc Serum</p>
          <p className="text-sm text-foreground/60">Ordinary Co.</p>

          <div className="mt-6 flex items-center gap-3 rounded-xl bg-primary px-4 py-3.5 text-background">
            <CheckCircle size={22} weight="bold" />
            <span className="font-medium">Good fit right now</span>
          </div>

          <p className="mt-4 text-sm text-foreground/70">
            Niacinamide, Zinc PCA — a good match for your skin right now.
          </p>
        </div>
      </div>
    </section>
  );
}