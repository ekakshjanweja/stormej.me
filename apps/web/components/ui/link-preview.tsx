"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import {
	AnimatePresence,
	motion,
	useMotionValue,
	useSpring,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { encode } from "qss";
import * as React from "react";
import { cn } from "@/lib/utils";

type LinkPreviewProps = {
	children: React.ReactNode;
	url: string;
	className?: string;
	onClick?: () => void;
	width?: number;
	height?: number;
	quality?: number;
} & (
	| { isStatic: true; imageSrc: string }
	| { isStatic?: false; imageSrc?: never }
);

function getHostname(url: string) {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}

export const LinkPreview = ({
	children,
	url,
	className,
	onClick,
	width = 240,
	height = 150,
	quality = 60,
	isStatic = false,
	imageSrc = "",
}: LinkPreviewProps) => {
	const src = isStatic
		? imageSrc
		: `https://api.microlink.io/?${encode({
				colorScheme: "dark",
				embed: "screenshot.url",
				meta: false,
				screenshot: true,
				url,
				"viewport.deviceScaleFactor": 1,
				"viewport.height": height * 3,
				"viewport.isMobile": true,
				"viewport.width": width * 3,
			})}`;

	const hostname = getHostname(url);

	const [isOpen, setOpen] = React.useState(false);
	const [isMounted, setIsMounted] = React.useState(false);

	React.useEffect(() => {
		setIsMounted(true);
	}, []);

	const x = useMotionValue(0);
	const translateX = useSpring(x, { damping: 24, mass: 0.6, stiffness: 200 });

	const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
		const targetRect = event.currentTarget.getBoundingClientRect();
		const eventOffsetX = event.clientX - targetRect.left;
		const offsetFromCenter = (eventOffsetX - targetRect.width / 2) / 4;
		x.set(offsetFromCenter);
	};

	return (
		<>
			{isMounted ? (
				<div className="hidden">
					<Image
						alt=""
						height={height}
						priority
						quality={quality}
						src={src}
						width={width}
					/>
				</div>
			) : null}

			<HoverCardPrimitive.Root
				closeDelay={120}
				onOpenChange={(open) => setOpen(open)}
				openDelay={120}
			>
				<HoverCardPrimitive.Trigger
					asChild
					className={cn(className)}
					href={url}
					onMouseMove={handleMouseMove}
					rel="noopener noreferrer"
					target="_blank"
				>
					<Link
						href={url}
						onClick={onClick}
						rel="noopener noreferrer"
						target="_blank"
					>
						{children}
					</Link>
				</HoverCardPrimitive.Trigger>

				<HoverCardPrimitive.Content
					align="center"
					className="z-50 origin-[--radix-hover-card-content-transform-origin]"
					side="top"
					sideOffset={10}
				>
					<AnimatePresence>
						{isOpen && (
							<motion.div
								animate={{
									opacity: 1,
									scale: 1,
									transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
									y: 0,
								}}
								exit={{
									opacity: 0,
									scale: 0.97,
									transition: { duration: 0.1, ease: [0.4, 0, 1, 1] },
									y: 4,
								}}
								initial={{ opacity: 0, scale: 0.97, y: 4 }}
								style={{ x: translateX }}
							>
								<Link
									className="group block overflow-hidden rounded-md border border-border bg-popover transition-colors duration-150 hover:border-foreground/30"
									href={url}
									onClick={onClick}
									rel="noopener noreferrer"
									target="_blank"
								>
									<div
										className="relative bg-background"
										style={{ height, width }}
									>
										<Image
											alt={`Preview of ${hostname}`}
											className="block"
											height={height}
											priority
											quality={quality}
											src={isStatic ? imageSrc : src}
											width={width}
										/>
									</div>
									<div className="border-border/70 border-t px-2.5 py-1.5">
										<span className="meta-tag truncate normal-case tracking-[0.08em]">
											{hostname}
										</span>
									</div>
								</Link>
							</motion.div>
						)}
					</AnimatePresence>
				</HoverCardPrimitive.Content>
			</HoverCardPrimitive.Root>
		</>
	);
};
