import HeadlineLarge from "@/components/styles/headline-large";
import HeadlineSmall from "@/components/styles/headline-small";

const gear = [
  { label: "laptop", value: "m4 macbook pro base/g14'21" },
  { label: "keyboard", value: "aula f75 pro" },
  { label: "mouse", value: "logitech g304" },
  { label: "pc", value: "7600-4060-32gb_ddr5" },
  { label: "monitor", value: "gigabyte g24f2" },
  { label: "headphones", value: "soundcore q20i" },
  { label: "mic", value: "fifine at6" },
  { label: "webcam", value: "lenovo 300" },
  { label: "mobile", value: "pixel 6a" },
  { label: "typing 30s", value: "86wpm" },
];

export default function Gear() {
  return (
    <>
      <div>
        <HeadlineLarge text="gear" showAsterisk />

        <div className="grid grid-cols-2 gap-4 text-muted-foreground mt-16">
          {gear.map(({ label, value }) => (
            <>
              <div key={label} className="text-left">
                {label}
              </div>
              <div className="text-left">{value}</div>
            </>
          ))}
        </div>

        <HeadlineSmall text="idk whats left" className="mt-4" />
      </div>
    </>
  );
}
