"use client";

import { Check, Copy, FileText } from "lucide-react";
import { useCallback, useState } from "react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const SITE = "https://www.stormej.me";

/**
 * Hands the reader a prompt to paste into their coding agent. The prompt points
 * at the entry's llms.txt rather than inlining the source, so the paste stays
 * short and the agent fetches the current version.
 */
export function AgentSetup({ slug, title }: { slug: string; title: string }) {
	const [copied, setCopied] = useState(false);
	const docUrl = `${SITE}/trove/${slug}/llms.txt`;

	// Deliberately thin. The llms.txt carries the actual instructions, so this
	// only has to get the agent to fetch it.
	const prompt = [
		`fetch ${docUrl} and follow the instructions in it to integrate ${title} into this codebase.`,
		"",
		"that file contains the task, the setup steps, the constraints, and the",
		"complete source. do not guess at any of it.",
	].join("\n");

	const copy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(prompt);
		} catch {
			const area = document.createElement("textarea");
			area.value = prompt;
			area.setAttribute("readonly", "");
			area.style.position = "fixed";
			area.style.opacity = "0";
			document.body.appendChild(area);
			area.select();
			document.execCommand("copy");
			document.body.removeChild(area);
		}
		setCopied(true);
		track("trove_agent_prompt_copied", { slug });
		setTimeout(() => setCopied(false), 2000);
	}, [prompt, slug]);

	const runCopy = useCallback(() => {
		copy();
	}, [copy]);

	return (
		<div className="flex flex-wrap items-center gap-2">
			<button
				className={cn(
					"inline-flex items-center gap-2 rounded-md border border-border/60 px-3 py-1.5",
					"font-medium text-[13px] text-foreground transition-colors hover:bg-muted/40",
					"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
				)}
				onClick={runCopy}
				type="button"
			>
				{copied ? (
					<Check aria-hidden className="size-3.5" />
				) : (
					<Copy aria-hidden className="size-3.5" />
				)}
				{copied ? "copied, paste it in" : "copy prompt for your agent"}
			</button>

			<a
				className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 font-light text-[12px] text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
				href={`/trove/${slug}/llms.txt`}
			>
				<FileText aria-hidden className="size-3.5" />
				llms.txt
			</a>
		</div>
	);
}
