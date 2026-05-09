import Link from "next/link";
import { github, xDotCom, linkedin } from "@/lib/constants/links";
import { GithubLight } from "@/components/ui/svgs/githubLight";
import { GithubDark } from "@/components/ui/svgs/githubDark";
import { X } from "@/components/ui/svgs/x";
import { Linkedin } from "@/components/ui/svgs/linkedin";

export default function SocialLinks() {
  return (
    <div className="flex items-center gap-5">
      <Link
        href={github}
        target="_blank"
        rel="noopener noreferrer"
        className="hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
        aria-label="GitHub"
      >
        <GithubLight className="w-4 h-4 dark:hidden text-foreground" />
        <GithubDark className="w-4 h-4 hidden dark:block text-foreground" />
      </Link>
      <Link
        href={xDotCom}
        target="_blank"
        rel="noopener noreferrer"
        className="hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
        aria-label="X (Twitter)"
      >
        <X className="w-4 h-4 text-foreground" />
      </Link>
      <Link
        href={linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="hover-dim focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
        aria-label="LinkedIn"
      >
        <Linkedin className="w-4 h-4 text-foreground" />
      </Link>
    </div>
  );
}
