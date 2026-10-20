import type * as React from "react";

/**
 * Groups lead-in blocks (tldr, notable) above the numbered case study.
 * No rules or boxes: spacing alone separates it from chapter 01.
 */
export function Lead({ children }: { children: React.ReactNode }) {
	return <div className="space-y-12">{children}</div>;
}
