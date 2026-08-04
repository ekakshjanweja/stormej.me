import type * as React from "react";

/**
 * Groups lead-in blocks (tldr, notable) above the numbered case study.
 * The rule sits close under the lead it closes; the wrapper's own spacing
 * supplies the gap down to chapter 01.
 */
export function Lead({ children }: { children: React.ReactNode }) {
	return (
		<div className="space-y-10 border-border/70 border-b pb-8">{children}</div>
	);
}
