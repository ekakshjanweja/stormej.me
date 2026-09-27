"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DesignConfig } from "@/lib/design/options";
import { cn } from "@/lib/utils";
import {
	type DesignPreviewMessage,
	type DesignReplayMessage,
	PREVIEW_PARAM,
} from "./preview-bridge";

/** previews render the real site at a device width, then scale to fit */
export const FRAME_WIDTHS = { desktop: 1280, mobile: 390 } as const;

export type PreviewDevice = keyof typeof FRAME_WIDTHS;

interface PreviewFrameProps {
	className?: string;
	config: DesignConfig;
	device?: PreviewDevice;
	mode: DesignPreviewMessage["mode"];
	path: string;
	/** bump to play the frame's entrance animations again */
	replay?: number;
	title: string;
}

export function PreviewFrame({
	className,
	config,
	device = "desktop",
	mode,
	path,
	replay = 0,
	title,
}: PreviewFrameProps) {
	const boxRef = useRef<HTMLDivElement>(null);
	const frameRef = useRef<HTMLIFrameElement>(null);
	const [box, setBox] = useState({ height: 0, width: 0 });

	useEffect(() => {
		const element = boxRef.current;
		if (!element) {
			return;
		}
		const observer = new ResizeObserver(([entry]) => {
			if (entry) {
				setBox({
					height: entry.contentRect.height,
					width: entry.contentRect.width,
				});
			}
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	const post = useCallback(() => {
		const message: DesignPreviewMessage = {
			config,
			mode,
			type: "design-preview",
		};
		frameRef.current?.contentWindow?.postMessage(
			message,
			window.location.origin
		);
	}, [config, mode]);

	// push every edit straight into the frame
	useEffect(() => {
		post();
	}, [post]);

	useEffect(() => {
		if (replay === 0) {
			return;
		}
		const message: DesignReplayMessage = { type: "design-replay" };
		frameRef.current?.contentWindow?.postMessage(
			message,
			window.location.origin
		);
	}, [replay]);

	// and answer the frame when it (re)loads and asks for the current design
	useEffect(() => {
		const onMessage = (event: MessageEvent<{ type?: string }>) => {
			if (
				event.origin === window.location.origin &&
				event.source === frameRef.current?.contentWindow &&
				event.data?.type === "design-preview-ready"
			) {
				post();
			}
		};
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, [post]);

	const frameWidth = FRAME_WIDTHS[device];
	const scale = box.width > 0 ? box.width / frameWidth : 0;
	const separator = path.includes("?") ? "&" : "?";

	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-lg border border-border bg-muted",
				className
			)}
			ref={boxRef}
		>
			{scale > 0 && (
				<iframe
					className="absolute top-0 left-0 origin-top-left border-0"
					loading="lazy"
					ref={frameRef}
					src={`${path}${separator}${PREVIEW_PARAM}=${mode}`}
					style={{
						height: box.height / scale,
						transform: `scale(${scale})`,
						width: frameWidth,
					}}
					title={title}
				/>
			)}
		</div>
	);
}
