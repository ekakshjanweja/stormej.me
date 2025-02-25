import HeadlineLarge from "@/components/styles/headline-large";

const gear = [
  { label: "typing 30s", value: "86wpm" },
  { label: "keyboard", value: "aula f75 pro" },
  { label: "mouse", value: "logitech g304" },
  { label: "pc", value: "7600-4060-32gbddr5" },
  { label: "monitor", value: "gigabyte g24f2" },
  { label: "mic", value: "fifine at6" },
  { label: "webcam", value: "lenovo 300" },
  { label: "mobile", value: "pixel 6a" },
  { label: "laptop", value: "zephyrus g14 2021" },
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
              <div className="text-right">{value}</div>
            </>
          ))}
        </div>
      </div>
    </>
  );
}
