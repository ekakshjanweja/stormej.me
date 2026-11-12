import { Lock } from "lucide-react";
import Link from "next/link";
import { FooterClock } from "./footer-clock";

export default function Footer() {
	return (
		<footer className="mt-24 flex items-center justify-between px-4 py-8">
			<span className="display-accent font-medium text-[18px] text-foreground">
				stormej
			</span>
			<span className="meta-tag inline-flex flex-wrap items-center justify-end gap-2">
				<span>© {new Date().getFullYear()} · new delhi</span>
				<span aria-hidden className="opacity-40">
					·
				</span>
				<FooterClock />
				{/* the experiments only open on a desktop (a wide screen and a
				    mouse), so anywhere else there's no link to them */}
				<span
					aria-hidden
					className="hidden opacity-40 min-[1200px]:pointer-fine:inline"
				>
					·
				</span>
				{/* the lab is a separate app behind the /experiments/* rewrite, so
				    a plain link and a full page load, not next/link */}
				<a
					className="hidden text-muted-foreground transition-colors hover:text-foreground min-[1200px]:pointer-fine:inline"
					href="/experiments/lab"
				>
					experiments
				</a>
				<span aria-hidden className="opacity-40">
					·
				</span>
				<Link
					aria-label="Open vault"
					className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
					href="/vault"
				>
					<Lock className="size-3.5" />
				</Link>
			</span>
		</footer>
	);
}
