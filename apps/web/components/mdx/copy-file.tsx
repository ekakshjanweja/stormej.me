"use client";

import { Check, ChevronRight, Copy } from "lucide-react";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type CopyState = "idle" | "copied" | "failed";

// navigator.clipboard is missing on insecure origins (a phone hitting the dev
// server over http, say) and throws if the document isn't focused.
const writeToClipboard = async (text: string) => {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		const area = document.createElement("textarea");
		area.value = text;
		area.setAttribute("readonly", "");
		area.style.position = "fixed";
		area.style.opacity = "0";
		document.body.appendChild(area);
		area.select();
		const ok = document.execCommand("copy");
		document.body.removeChild(area);
		return ok;
	}
};

const COPY_LABEL = {
	copied: "copied",
	failed: "failed",
	idle: "copy",
} as const;

export function CopyFile({
	name,
	lines,
	className,
	children,
}: {
	name?: string;
	lines?: number;
	className?: string;
	children: ReactNode;
}) {
	const [state, setState] = useState<CopyState>("idle");
	const [open, setOpen] = useState(false);
	const toggleOpen = useCallback(() => setOpen((v) => !v), []);
	const codeRef = useRef<HTMLDivElement>(null);
	const fileName = name ?? "file";

	const copy = useCallback(async () => {
		const source = codeRef.current?.querySelector("pre")?.textContent;
		if (source) {
			const ok = await writeToClipboard(source);
			setState(ok ? "copied" : "failed");
			if (ok) {
				track("trove_file_copied", { file: fileName });
			}
		} else {
			setState("failed");
		}
		setTimeout(() => setState("idle"), 2000);
	}, [fileName]);

	const runCopy = useCallback(() => {
		copy();
	}, [copy]);

	return (
		<div
			className={cn(
				"my-4 overflow-hidden rounded-md border border-border/40",
				className
			)}
		>
			<div className="flex items-center gap-3 px-3 py-1.5">
				<span className="min-w-0 truncate font-mono text-[13px] text-foreground">
					{fileName}
				</span>
				{lines && (
					<span className="meta-tag shrink-0 tabular-nums">{lines} lines</span>
				)}
				<button
					className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border/60 px-2.5 py-1 font-medium text-[12px] text-foreground transition-colors hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
					onClick={runCopy}
					type="button"
				>
					{state === "copied" ? (
						<Check aria-hidden className="size-3.5" />
					) : (
						<Copy aria-hidden className="size-3.5" />
					)}
					{COPY_LABEL[state]}
				</button>
			</div>

			<button
				aria-expanded={open}
				className="flex w-full items-center gap-1.5 border-border/40 border-t px-3 py-1.5 font-light text-[12px] text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-inset"
				onClick={toggleOpen}
				type="button"
			>
				<ChevronRight
					aria-hidden
					className={cn(
						"size-3.5 transition-transform duration-150 ease-out motion-reduce:transition-none",
						open && "rotate-90"
					)}
				/>
				{open ? "hide code" : "show code"}
			</button>

			{/* kept mounted so copy works while collapsed */}
			<div
				className="border-border/40 border-t bg-muted/20 px-3 py-2 [&_figure]:my-0 [&_figure_[role=region]]:py-2"
				hidden={!open}
				ref={codeRef}
			>
				{children}
			</div>
		</div>
	);
}
