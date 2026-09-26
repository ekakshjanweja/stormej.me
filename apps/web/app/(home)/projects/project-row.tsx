"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ProjectListItem } from "@/lib/projects";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function ProjectRow({
	project,
	index,
}: {
	project: ProjectListItem;
	index?: number;
}) {
	const hasDescription = project.description && project.description.length > 0;
	const href = hasDescription
		? `/projects/${project.slug}`
		: project.website || `/projects/${project.slug}`;
	const isExternal = !hasDescription && !!project.website;
	const animated = index !== undefined;

	return (
		<motion.li
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, transition: { duration: 0.15, ease: EASE } }}
			initial={animated ? { opacity: 0, y: 8 } : false}
			transition={{ delay: (index ?? 0) * 0.04, duration: 0.25, ease: EASE }}
		>
			<Link
				className="group flex items-baseline justify-between gap-4 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
				href={href}
				rel={isExternal ? "noopener noreferrer" : undefined}
				target={isExternal ? "_blank" : undefined}
			>
				<div className="flex min-w-0 flex-col gap-0.5">
					<span className="squiggle-link-hover truncate font-medium text-[14px] text-foreground">
						{project.title}
					</span>
					<span className="font-light text-[12px] text-muted-foreground leading-snug">
						{project.subtitle}
					</span>
				</div>
				{isExternal && (
					<ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
				)}
			</Link>
		</motion.li>
	);
}
