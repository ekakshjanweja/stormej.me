import { FolderCode, Hammer, MapPin } from "lucide-react";
import { TextScramble } from "./ui/text-scramble";
import Link from "next/link";

const items = [
  {
    text: "new delhi, india",
    icon: <MapPin className="h-4 w-4 text-muted-foreground" />,
  },
  {
    text: "mobile engineer",
    icon: <FolderCode className="h-4 w-4 text-muted-foreground" />,
    hrefText: "@digitaldomi",
    href: "https://digitaldomi.com/",
  },
  {
    text: "building",
    icon: <Hammer className="h-4 w-4 text-muted-foreground" />,
    hrefText: "renovatio",
    href: "https://renovatio-design.vercel.app/",
  },
];

export default function Header() {
  return (
    <div>
      <TextScramble className="text-4xl font-semibold">
        ekaksh janweja
      </TextScramble>
      {items.map((item) => (
        <div className="flex text-muted-foreground gap-x-2 items-center mt-2">
          {item.icon}
          <div className="flex gap-x-4 items-center">
            <p> {item.text}</p>
            <Link href={item.href ?? ""} target="_blank">
              <p className="hover:underline hover:text-highlight">
                {item.hrefText}
              </p>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
