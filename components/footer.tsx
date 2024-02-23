"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import XBlack from "../assets/logos/x_dark.svg";
import XWhite from "../assets/logos/x_light.svg";
import LinkedinWhite from "../assets/logos/linkedin_white.svg";
import LinkedinBlack from "../assets/logos/linkedin_black.svg";
import GithubBlack from "../assets/logos/github_black.svg";
import GithubWhite from "../assets/logos/github_white.svg";
import EmailBlack from "../assets/logos/email_black.svg";
import EmailWhite from "../assets/logos/email_white.svg";
import { SVGIconAlt } from "./svg-icon-alt";
import { Separator } from "./ui/separator";

export const Footer = () => {
  const pathName = usePathname();

  const isHome = pathName === "/";

  return (
    <>
      <Separator className="mt-8" />
      <nav className="w-full my-10 flex items-center justify-between text-muted-foreground">
        <Link href="/">
          <div className="hover:text-foreground text-base">
            {"Ekaksh Janweja"}
          </div>
        </Link>
        <div className="flex justify-center">
          <SVGIconAlt
            href={"mailto:jekaksh@gmail.com"}
            iconDark={EmailWhite}
            iconLight={EmailBlack}
          />
          <SVGIconAlt
            href={"https://www.linkedin.com/in/ekakshjanweja/"}
            iconDark={LinkedinWhite}
            iconLight={LinkedinBlack}
          />
          <SVGIconAlt
            href={"https://twitter.com/ekaksh_janweja"}
            iconDark={XWhite}
            iconLight={XBlack}
          />
          <SVGIconAlt
            href={"https://github.com/ekakshjanweja"}
            iconDark={GithubWhite}
            iconLight={GithubBlack}
          />
        </div>
      </nav>
    </>
  );
};
