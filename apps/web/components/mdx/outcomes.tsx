import Link from "next/link";

export function Outcomes({
  items,
  sectionId = "outcomes",
  label = "outcomes",
}: {
  items: { metric: string; label: string; href?: string }[];
  sectionId?: string;
  label?: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <section
      id={sectionId}
      className="scroll-mt-32 mt-16 border-t border-border/70 pt-10"
    >
      <span className="meta-tag mb-6 block">{label}</span>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-3">
        {items.map((o, i) => (
          <div key={i} className="space-y-2">
            <dd className="headline text-[clamp(20px,1.8vw,24px)] leading-[1.15]">
              {o.href ? (
                <Link href={o.href} className="hover:opacity-70 transition-opacity">
                  {o.metric}
                </Link>
              ) : (
                o.metric
              )}
            </dd>
            <dt className="meta-tag">{o.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}