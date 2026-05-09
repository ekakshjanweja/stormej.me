export function Highlights({
  title,
  items,
  bullet = "•",
}: {
  title?: string;
  items: string[];
  bullet?: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <section className="my-10">
      {title && <h2 className="section-label mb-5">{title}</h2>}
      <ul className="space-y-3 list-none pl-0">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-[14px] font-light leading-[1.6] text-foreground"
          >
            <span className="select-none text-muted-foreground mt-[2px] text-[12px]">
              {bullet}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
