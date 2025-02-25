import { Building2, Hammer, MapPin } from "lucide-react";
import { domi, renovatio } from "@/lib/constants/links";
import LoopedSubtitle from "./looped-subtitle";
import HeadlineLarge from "@/components/styles/headline-large";
import Label from "@/components/styles/label";
import X from "@/components/x";
import Github from "@/components/github";
import LinkedIn from "@/components/linkedin";

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
      <div className="mb-2 flex gap-x-4 items-center">
        <p className="text-xs text-muted-foreground">say hi!</p>
        <X />
        <Github />
        <LinkedIn />
      </div>
      <HeadlineLarge text="ekaksh janweja" />
      {items.map((item, index) => (
        <>
          <div key={index} className="mt-2">
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
        hey, i&apos;m ekaksh janweja. i build mobile apps and cool shit on the
        side. been working with startups for about 2 years now—if you're
        building something fire and need a mobile app, hit me up.
      </div>
      <LoopedSubtitle />
    </div>
  );
}
