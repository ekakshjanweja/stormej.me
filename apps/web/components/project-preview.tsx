"use client";

// biome-ignore lint/performance/noNamespaceImport: Radix exports the hover card primitives as a namespace
import * as HoverCard from "@radix-ui/react-hover-card";
import Image from "next/image";
import type { ReactNode } from "react";
import type { ProjectListItem } from "@/lib/projects";

interface ProjectPreviewProps {
	children: ReactNode;
	project: ProjectListItem;
}

export function ProjectPreview({ children, project }: ProjectPreviewProps) {
	return (
		<HoverCard.Root closeDelay={100} openDelay={160}>
			<HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
			<HoverCard.Portal>
				<HoverCard.Content
					align="start"
					avoidCollisions
					className="data-[state=open]:fade-in data-[state=open]:zoom-in-95 z-[100] max-h-[calc(100dvh-24px)] w-[min(320px,calc(100dvw-24px))] overflow-hidden rounded-md border border-border bg-popover shadow-lg outline-none data-[state=open]:animate-in"
					collisionPadding={12}
					side="top"
					sideOffset={10}
					sticky="always"
				>
					<div className="relative aspect-[16/9] overflow-hidden bg-muted">
						<Image
							alt=""
							className="object-cover"
							fill
							sizes="320px"
							src={`/og/projects/${project.slug}`}
							unoptimized
						/>
					</div>
					<div className="border-border/70 border-t px-3 py-2">
						<span className="block truncate font-medium text-foreground text-sm">
							{project.title}
						</span>
						{project.subtitle && (
							<span className="block truncate text-muted-foreground text-xs">
								{project.subtitle}
							</span>
						)}
					</div>
				</HoverCard.Content>
			</HoverCard.Portal>
		</HoverCard.Root>
	);
}
