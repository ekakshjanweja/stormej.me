import { Building2, Hammer, MapPin } from "lucide-react";
import { TextScramble } from "../../../components/ui/text-scramble";
import Link from "next/link";
import { domi, renovatio, valorant } from "@/lib/constants/links";
import { TextLoop } from "../../../components/ui/text-loop";
import LoopedSubtitle from "./looped-subtitle";

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
      <TextScramble className="text-4xl font-bold mb-4">
        {"*ekaksh janweja"}
      </TextScramble>

      {items.map((item) => (
        <div className="flex text-muted-foreground gap-x-2 items-center mt-2 text-xs">
          {item.icon}
          <div className="flex gap-x-4 items-center md:text-base">
            <p> {item.text}</p>
            <Link href={item.href ?? ""} target="_blank">
              <p className="hover:underline hover:text-highlight transition-all duration-300 ease-in-out">
                {item.hrefText}
              </p>
            </Link>
          </div>
        </div>
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
