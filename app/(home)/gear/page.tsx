const gear = [
  { label: "laptop", value: "m4 pro macbook pro base/g14'21" },
  { label: "keyboard", value: "aula f75 pro" },
  { label: "mouse", value: "logitech g304" },
  { label: "pc", value: "7600-4060-32gb_ddr5" },
  { label: "monitor", value: "gigabyte g24f2" },
  { label: "headphones", value: "soundcore q20i" },
  { label: "mic", value: "fifine at6" },
  { label: "webcam", value: "lenovo 300" },
  { label: "mobile", value: "pixel 10" },
  { label: "typing 30s", value: "86wpm" },
];

export default function Gear() {
  return (
    <main>
      <h1 className="section-label mb-8">gear</h1>
      <ul className="flex flex-col gap-3">
        {gear.map(({ label, value }) => (
          <li
            key={label}
            className="flex items-baseline justify-between gap-4 border-b border-border/40 pb-3 last:border-0"
          >
            <span className="meta-tag">{label}</span>
            <span className="text-[13px] font-light text-foreground text-right">
              {value}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
