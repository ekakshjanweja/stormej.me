"use client";

import { useEffect, useRef, useState } from "react";
import type { Chapter } from "@/lib/cases";
import { pad } from "../_lib/format";

/* the long read: chapters as plain editorial sections, with an index that
   sticks beside them on wide screens and marks the one you're in */

/** a chapter is "the one you're in" while it crosses this band */
const SPY_MARGIN = "-30% 0px -60% 0px";

const anchor = (index: number) => `chapter-${index + 1}`;

export function Chapters({ chapters }: { chapters: Chapter[] }) {
	const [active, setActive] = useState(0);
	const listRef = useRef<HTMLDivElement>(null);
	const indexed = chapters.map((chapter, index) => ({ chapter, index }));

	useEffect(() => {
		const list = listRef.current;
		if (!list) {
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActive(Number((entry.target as HTMLElement).dataset.chapter));
					}
				}
			},
			{ rootMargin: SPY_MARGIN }
		);
		for (const el of list.querySelectorAll("[data-chapter]")) {
			observer.observe(el);
		}
		return () => observer.disconnect();
	}, []);

	return (
		<div className="chapters" data-single={chapters.length < 2 || undefined}>
			{chapters.length > 1 ? (
				<nav aria-label="chapters" className="chapter-index">
					<p aria-hidden="true" className="kicker">
						chapters
					</p>
					<ol>
						{indexed.map(({ chapter, index }) => (
							<li key={chapter.title}>
								<a
									aria-current={index === active ? "location" : undefined}
									className="chapter-link"
									href={`#${anchor(index)}`}
								>
									<span className="chapter-n">{pad(index + 1)}</span>
									<span className="chapter-label">{chapter.label}</span>
								</a>
							</li>
						))}
					</ol>
				</nav>
			) : null}
			<div className="chapter-list" ref={listRef}>
				{indexed.map(({ chapter, index }) => (
					<article
						aria-labelledby={`${anchor(index)}-title`}
						className="chapter"
						data-chapter={index}
						data-reveal="up"
						id={anchor(index)}
						key={chapter.title}
					>
						<p aria-hidden="true" className="chapter-kicker">
							<span>{pad(index + 1)}</span>
							{chapter.label}
						</p>
						<h2 className="chapter-title" id={`${anchor(index)}-title`}>
							{chapter.title}
						</h2>
						{chapter.paragraphs.map((paragraph) => (
							<p className="chapter-text" key={paragraph}>
								{paragraph}
							</p>
						))}
					</article>
				))}
			</div>
		</div>
	);
}
