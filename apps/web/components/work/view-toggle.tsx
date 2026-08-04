"use client";

import { type ReactNode, useCallback, useEffect, useState } from "react";
import { track } from "@/lib/analytics";

type WorkView = "brief" | "full";

const STORAGE_KEY = "work-view";

const isWorkView = (value: string | null): value is WorkView =>
	value === "brief" || value === "full";

const buttonClass = (active: boolean) =>
	[
		"meta-tag rounded-full px-2.5 py-1 transition-colors",
		"focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
		active
			? "bg-foreground/10 text-foreground"
			: "text-muted-foreground hover:text-foreground",
	].join(" ");

/**
 * wraps the server-rendered case study and toggles chapter prose. the text
 * stays in the dom and is hidden with css, so brief mode costs nothing in
 * search indexing and switching back is instant.
 */
export function WorkViewToggle({ children }: { children: ReactNode }) {
	const [view, setView] = useState<WorkView>("full");

	// read after mount so the server and first client render agree
	useEffect(() => {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (isWorkView(stored)) {
			setView(stored);
		}
	}, []);

	const choose = useCallback((next: WorkView) => {
		setView(next);
		window.localStorage.setItem(STORAGE_KEY, next);
		track("work_view_toggled", { view: next });
	}, []);

	const chooseBrief = useCallback(() => choose("brief"), [choose]);
	const chooseFull = useCallback(() => choose("full"), [choose]);

	return (
		<>
			<div className="mb-10 flex items-center justify-end gap-1">
				<span className="meta-tag mr-1 text-muted-foreground">view</span>
				<button
					aria-pressed={view === "brief"}
					className={buttonClass(view === "brief")}
					onClick={chooseBrief}
					type="button"
				>
					brief
				</button>
				<button
					aria-pressed={view === "full"}
					className={buttonClass(view === "full")}
					onClick={chooseFull}
					type="button"
				>
					full
				</button>
			</div>
			<div data-work-view={view}>{children}</div>
		</>
	);
}
