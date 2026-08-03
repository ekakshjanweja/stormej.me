import type * as React from "react";

/** Groups lead-in blocks (tldr, notable) above the numbered case study. */
export function Lead({ children }: { children: React.ReactNode }) {
	return (
		<div className="space-y-10 border-border/70 border-b pb-16">{children}</div>
	);
}
