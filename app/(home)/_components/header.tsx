import { Building2, Hammer, MapPin } from "lucide-react";
import { domi, renovatio } from "@/lib/constants/links";
import LoopedSubtitle from "./looped-subtitle";
import HeadlineLarge from "@/components/styles/headline-large";
import Label from "@/components/styles/label";

const items = [
  {
    text: "new delhi, india",
    icon: <MapPin className="h-4 w-4 text-muted-foreground" />,
  },
  {
    text: "mobile engineer",
    icon: <Building2 className="h-4 w-4 text-muted-foreground" />,
    hrefText: "@digitaldomi",
    href: domi,
  },
  {
    text: "building",
    icon: <Hammer className="h-4 w-4 text-muted-foreground" />,
    hrefText: "renovatio",
    href: renovatio,
  },
];

export default function Hero() {
  return (
    <div>
      <HeadlineLarge text="ekaksh janweja" />

      {items.map((item, index) => (
        <>
          <div key={index}>
            <Label
              icon={item.icon}
              text={item.text}
              href={item.href}
              hrefText={item.hrefText}
            />
          </div>
        </>
      ))}

      <div className="mt-4 text-base text-foreground font-light leading-6 opacity-90">
        hey, i&apos;m ekaksh janweja, currently in my final year at dtu,
        wrapping up my undergrad. i build mobile apps and work on cool side
        projects.
      </div>
      <LoopedSubtitle />
    </div>
  );
}
