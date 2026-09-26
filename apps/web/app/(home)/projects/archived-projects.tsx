"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useCallback, useId, useState } from "react";
import type { ProjectListItem } from "@/lib/projects";
import { ProjectRow } from "./project-row";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function ArchivedProjects({
	projects,
}: {
	projects: ProjectListItem[];
}) {
	const [open, setOpen] = useState(false);
	const listId = useId();
	const toggle = useCallback(() => setOpen((value) => !value), []);

	if (projects.length === 0) {
		return null;
	}

	return (
		<MotionConfig reducedMotion="user">
			<div className="mt-12">
				<button
					aria-controls={listId}
					aria-expanded={open}
					className="meta-tag hover-dim inline-flex cursor-pointer items-center gap-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
					onClick={toggle}
					type="button"
				>
					<motion.span
						animate={{ rotate: open ? 90 : 0 }}
						className="inline-flex"
						transition={{ duration: 0.2, ease: EASE }}
					>
						<ChevronRight className="h-3.5 w-3.5" />
					</motion.span>
					archived · {projects.length}
				</button>
				<AnimatePresence initial={false}>
					{open && (
						<motion.div
							animate={{ height: "auto", opacity: 1 }}
							className="overflow-hidden"
							exit={{
								height: 0,
								opacity: 0,
								transition: { duration: 0.22, ease: EASE },
							}}
							id={listId}
							initial={{ height: 0, opacity: 0 }}
							key="archived-list"
							transition={{ duration: 0.32, ease: EASE }}
						>
							<ul className="flex flex-col gap-5 pt-6">
								{projects.map((project, index) => (
									<ProjectRow
										index={index}
										key={project.slug}
										project={project}
									/>
								))}
							</ul>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</MotionConfig>
	);
}
