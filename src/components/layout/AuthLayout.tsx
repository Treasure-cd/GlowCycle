import type { ReactNode } from "react";

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    // Changed: min-h-[calc(100vh-4rem)] is now min-h-screen
    <div className="flex min-h-screen flex-col justify-center bg-background px-6 py-10 md:items-center md:bg-surface md:px-4">
      <div className="w-full md:max-w-md md:rounded-3xl md:border md:border-border md:bg-background md:p-8 md:shadow-sm">
        <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-foreground/60">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}