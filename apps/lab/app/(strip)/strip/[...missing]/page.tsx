import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
	title: "not found · ekaksh janweja · strip",
};

/* any other url under /strip gets strip's own 404 instead of the lab's */
export default function Missing() {
	notFound();
}
