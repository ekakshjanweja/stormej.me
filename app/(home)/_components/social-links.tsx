import Link from "next/link";
import { github, xDotCom, linkedin } from "@/lib/constants/links";
import { GithubLight } from "@/components/ui/svgs/githubLight";
import { GithubDark } from "@/components/ui/svgs/githubDark";
import { X } from "@/components/ui/svgs/x";
import { Linkedin } from "@/components/ui/svgs/linkedin";

export default function SocialLinks() {
  return (
    <div className="flex items-center gap-8 pt-8">
      <Link
        href={github}
        target="_blank"
        rel="noopener noreferrer"
        className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
        aria-label="Visit my GitHub profile"
      >
        <GithubLight className="w-5 h-5 transition-all duration-300 group-hover:scale-110 dark:hidden text-foreground" />
        <GithubDark className="w-5 h-5 transition-all duration-300 group-hover:scale-110 hidden dark:block text-foreground" />
      </Link>
      <Link
        href={xDotCom}
        target="_blank"
        rel="noopener noreferrer"
        className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
        aria-label="Visit my X (Twitter) profile"
      >
        <X className="w-5 h-5 transition-all duration-300 group-hover:scale-110 text-foreground" />
      </Link>
      <Link
        href={linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
        aria-label="Visit my LinkedIn profile"
      >
        <Linkedin className="w-5 h-5 transition-all duration-300 group-hover:scale-110 text-foreground" />
      </Link>
    </div>
  );
}
