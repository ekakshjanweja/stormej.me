"use client";

import { ExternalLink, Maximize2, X } from "lucide-react";
import { useState } from "react";

interface WebsitePreviewProps {
	title: string;
	url: string;
}

export function WebsitePreview({ url, title }: WebsitePreviewProps) {
	const [isFullscreen, setIsFullscreen] = useState(false);

	return (
		<>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-foreground text-lg tracking-tight">
						live preview
					</h3>
					<div className="flex items-center gap-2">
						<button
							aria-label="Fullscreen preview"
							className="rounded-lg bg-muted/50 p-2 transition-colors duration-200 hover:bg-muted"
							onClick={() => setIsFullscreen(true)}
						>
							<Maximize2 className="h-4 w-4 text-muted-foreground" />
						</button>
						<a
							aria-label="Open in new tab"
							className="rounded-lg bg-muted/50 p-2 transition-colors duration-200 hover:bg-muted"
							href={url}
							rel="noopener noreferrer"
							target="_blank"
						>
							<ExternalLink className="h-4 w-4 text-muted-foreground" />
						</a>
					</div>
				</div>
				<div className="group relative overflow-hidden rounded-2xl border border-border/40 transition-all duration-500 hover:border-highlight/30">
					<div className="relative aspect-[16/10] w-full bg-muted/20">
						<iframe
							className="absolute inset-0 h-full w-full"
							loading="lazy"
							sandbox="allow-scripts allow-same-origin allow-popups"
							src={url}
							title={`${title} website preview`}
						/>
					</div>
				</div>
			</div>

			{/* Fullscreen Modal */}
			{isFullscreen && (
				<div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
					<div className="absolute top-4 right-4 z-10 flex items-center gap-2">
						<a
							aria-label="Open in new tab"
							className="rounded-lg bg-muted p-2 transition-colors duration-200 hover:bg-muted/80"
							href={url}
							rel="noopener noreferrer"
							target="_blank"
						>
							<ExternalLink className="h-5 w-5 text-foreground" />
						</a>
						<button
							aria-label="Close fullscreen"
							className="rounded-lg bg-muted p-2 transition-colors duration-200 hover:bg-muted/80"
							onClick={() => setIsFullscreen(false)}
						>
							<X className="h-5 w-5 text-foreground" />
						</button>
					</div>
					<iframe
						className="h-full w-full"
						loading="lazy"
						sandbox="allow-scripts allow-same-origin allow-popups"
						src={url}
						title={`${title} website preview`}
					/>
				</div>
			)}
		</>
	);
}
