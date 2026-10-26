"use client";

import { useCallback, useState } from "react";
import { playSfx } from "@/lib/sfx";

/* "agent" mode: the same page, as the markdown an llm would want. on the
   home it sits inside the sky's frame; on the other pages it floats over
   the page, which goes quiet behind it */

const COPIED_MS = 1600;

interface AgentViewProps {
	markdown: string;
	variant?: "home" | "page";
	visible: boolean;
}

export function AgentView({
	markdown,
	variant = "home",
	visible,
}: AgentViewProps) {
	const [copied, setCopied] = useState(false);

	const copy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(markdown);
			setCopied(true);
			await playSfx("success");
			setTimeout(() => setCopied(false), COPIED_MS);
		} catch {
			/* no clipboard permission; the text is right there to select */
		}
	}, [markdown]);

	return (
		<section
			aria-hidden={!visible}
			aria-label="this page as markdown"
			className="agent"
			data-variant={variant}
			data-visible={visible || undefined}
			inert={!visible}
		>
			<div className="agent-head">
				<p>
					<span aria-hidden className="agent-dot" /> this page, for agents
				</p>
				<button data-sfx="silent" onClick={copy} type="button">
					{copied ? "copied" : "copy markdown"}
				</button>
			</div>
			<pre className="agent-body">{markdown}</pre>
		</section>
	);
}
