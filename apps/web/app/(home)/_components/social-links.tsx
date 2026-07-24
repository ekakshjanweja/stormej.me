"use client";

import Link from "next/link";
import { GithubDark } from "@/components/ui/svgs/githubDark";
import { GithubLight } from "@/components/ui/svgs/githubLight";
import { Linkedin } from "@/components/ui/svgs/linkedin";
import { X } from "@/components/ui/svgs/x";
import { track } from "@/lib/analytics";
import { github, linkedin, xDotCom } from "@/lib/constants/links";

const trackGithub = () => track("social_link_clicked", { platform: "github" });
const trackX = () => track("social_link_clicked", { platform: "x" });
const trackLinkedin = () =>
	track("social_link_clicked", { platform: "linkedin" });

export default function SocialLinks() {
	return (
		<div className="flex items-center gap-5">
			<Link
				aria-label="GitHub"
				className="hover-dim rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
				href={github}
				onClick={trackGithub}
				rel="noopener noreferrer"
				target="_blank"
			>
				<GithubLight className="h-4 w-4 text-foreground dark:hidden" />
				<GithubDark className="hidden h-4 w-4 text-foreground dark:block" />
			</Link>
			<Link
				aria-label="X (Twitter)"
				className="hover-dim rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
				href={xDotCom}
				onClick={trackX}
				rel="noopener noreferrer"
				target="_blank"
			>
				<X className="h-4 w-4 text-foreground" />
			</Link>
			<Link
				aria-label="LinkedIn"
				className="hover-dim rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
				href={linkedin}
				onClick={trackLinkedin}
				rel="noopener noreferrer"
				target="_blank"
			>
				<Linkedin className="h-4 w-4 text-foreground" />
			</Link>
		</div>
	);
}
