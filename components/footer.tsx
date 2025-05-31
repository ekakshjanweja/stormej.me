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
    <footer className="mt-32 border-t border-border/40">
      <div className="pt-12 pb-8 px-4 sm:px-6 lg:px-0">
        <div className="max-w-4xl mx-auto">
          {/* Main footer content */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            {/* Brand/Name */}
            <div className="flex flex-col items-center sm:items-start">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                stormej
              </h3>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center sm:justify-end gap-x-6 gap-y-3">
              {footerItems.map((item, index) => (
                <Link
                  href={item.href}
                  target="_blank"
                  key={index}
                  className="group relative text-sm text-muted-foreground hover:text-highlight transition-all duration-300 ease-in-out"
                >
                  <span className="relative z-10">{item.title}</span>
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-highlight scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
