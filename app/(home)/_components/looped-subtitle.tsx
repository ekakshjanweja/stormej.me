import { HighlightedText } from "@/components/styles/highlighted-text";
import { TextLoop } from "@/components/ui/text-loop";
import { valorant } from "@/lib/constants/links";

const items = [
  {
    label: "i-use-arch-btw",
    link: "https://github.com/ekakshjanweja/dotfiles",
  },
  {
    label: "valorant",
    link: valorant,
    altText: "(shift + v)",
  },
  {
    label: "music",
    altText: "(seedhe-maut)",
  },
  {
    label: "engineering",
  },
  { label: "keebs" },
];

export default function LoopedSubtitle() {
  return (
    <>
      <div className="flex flex-col justify-start items-start md:justify-start md:items-center md:space-x-4  md:flex-row">
        <p className="opacity-80">{"i am obsessed with"}</p>
        <TextLoop
          className="text-base text-foreground leading-6 font-semibold"
          variants={{
            initial: { y: 10, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            exit: { y: -10, opacity: 0 },
          }}
          interval={3.5}
          transition={{ duration: 0.3 }}
        >
          {items.map((item, index) => (
            <div key={index}>
              {HighlightedText(item.label, item.link, item.altText)}
            </div>
          ))}
        </TextLoop>
      </div>
    </>
  );
}
