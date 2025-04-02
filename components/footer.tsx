import { github, linkedin, mailTo, xDotCom } from "@/lib/constants/links";
import Link from "next/link";

const footerItems = [
  {
    title: "github",
    href: github,
  },
  {
    title: "x.com",
    href: xDotCom,
  },
  {
    title: "linkedin",
    href: linkedin,
  },
  {
    title: "email",
    href: mailTo,
  },
];

export default function Footer() {
  return (
    <div>
      <footer className="mt-24 pb-8 flex flex-col">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p className="hidden md:flex hover:text-highlight transition-all duration-300 ease-in-out">
            stormej
          </p>
          <div className="flex gap-x-4">
            {footerItems.map((item, index) => (
              <Link
                href={item.href}
                target="_blank"
                key={index}
                className="hover:text-highlight transition-all duration-300 ease-in-out"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
