import * as React from "react";

export function Chapter({
  id,
  label,
  title,
  pullQuote,
  index,
  children,
}: {
  id: string;
  label: string;
  title: string;
  pullQuote?: string;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 space-y-5">
      <div className="flex items-baseline gap-3">
        <span className="meta-tag tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="meta-tag text-foreground tracking-[0.18em]">
          {label}
        </span>
      </div>
      <h2 className="headline text-[clamp(22px,2.4vw,28px)] max-w-[40ch]">
        {title}
      </h2>
      <div className="max-w-[60ch] space-y-4 [&_p]:text-[15px] [&_p]:font-light [&_p]:leading-[1.7] [&_p]:text-foreground [&_strong]:font-medium [&_strong]:text-foreground">
        {children}
      </div>
      {pullQuote && (
        <blockquote className="mt-6 border-l-2 border-foreground/30 pl-5 text-[17px] font-light italic leading-[1.55] text-foreground max-w-[55ch]">
          {pullQuote}
        </blockquote>
      )}
    </section>
  );
}
