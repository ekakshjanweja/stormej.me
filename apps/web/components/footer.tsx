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
