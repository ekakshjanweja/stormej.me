"use client";

import { useEffect, useRef, useState } from "react";
import type { Chapter } from "@/lib/cases";
import { pad } from "../_lib/pages";

/* the long read: chapters down the right, a contents list that holds its
   place on the left and marks the chapter crossing the middle of the
   screen. the contents are plain anchors, so they glide there (or jump,
   with reduced motion) and focus follows */

export function CaseChapters({ chapters }: { chapters: Chapter[] }) {
	const bodyRef = useRef<HTMLDivElement>(null);
	const [active, setActive] = useState(0);
	const withContents = chapters.length > 1;

	useEffect(() => {
		const body = bodyRef.current;
		if (!(body && withContents)) {
			return;
		}
		const sections = [...body.querySelectorAll<HTMLElement>(".chapter")];
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActive(sections.indexOf(entry.target as HTMLElement));
					}
				}
			},
			{ rootMargin: "-45% 0px -50% 0px" }
		);
		for (const section of sections) {
			observer.observe(section);
		}
		return () => observer.disconnect();
	}, [withContents]);

	return (
		<section
			aria-labelledby="chapters-title"
			className={`case-chapters${withContents ? "" : "is-single"}`}
		>
			<div className="chapters-side">
				<h2 className="case-label" id="chapters-title">
					how it went
				</h2>
				{withContents ? (
					<nav aria-label="chapters" className="chapters-toc">
						<ol>
							{chapters.map((chapter, index) => (
								<li key={chapter.title}>
									<a
										aria-current={index === active ? "true" : undefined}
										className="chapters-toc-link"
										href={`#chapter-${index + 1}`}
									>
										<span aria-hidden="true">{pad(index + 1)}</span>
										{chapter.label}
									</a>
								</li>
							))}
						</ol>
					</nav>
				) : null}
			</div>
			<div className="chapters-body" ref={bodyRef}>
				{chapters.map((chapter, index) => (
					<article
						aria-labelledby={`chapter-${index + 1}-title`}
						className="chapter"
						id={`chapter-${index + 1}`}
						key={chapter.title}
					>
						<p className="chapter-index">
							<span aria-hidden="true">{pad(index + 1)} — </span>
							{chapter.label}
						</p>
						<h3 className="chapter-title" id={`chapter-${index + 1}-title`}>
							{chapter.title}
						</h3>
						{chapter.paragraphs.map((paragraph) => (
							<p className="chapter-text" key={paragraph.slice(0, 40)}>
								{paragraph}
							</p>
						))}
					</article>
				))}
			</div>
		</section>
	);
}
