"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Reel } from "@/lib/profile";
import { playSfx } from "@/lib/sfx";
import { Draggable, gsap, reducedMotion } from "../_lib/gsap";
import { useReel } from "../_lib/sound";
import { SoundButton } from "./sound-button";

const TRAIL_STEP = 30;
const TRAIL_MAX = 10;

/* a reel you can pick up. pressing pulls the frame in and pushes the
   picture closer; dragging stamps fading stills of whatever frame is
   playing. it plays muted; the button under it turns the sound on */
export function DragReel({
	alt,
	reel,
}: {
	alt: string;
	reel: Reel & { video: string };
}) {
	const areaRef = useRef<HTMLDivElement>(null);
	const frameRef = useRef<HTMLDivElement>(null);
	const trailRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const { audible, toggle } = useReel(videoRef);

	useEffect(() => {
		const frame = frameRef.current;
		const trail = trailRef.current;
		const area = areaRef.current;
		const video = videoRef.current;
		const inner = frame?.querySelector<HTMLElement>("[data-inner]");
		if (!(frame && trail && area && video && inner) || reducedMotion()) {
			return;
		}
		let lastX = 0;
		let lastY = 0;
		let layer = 1;

		/* a still of the current frame, so the trail moves with the reel */
		const stamp = (x: number, y: number) => {
			if (trail.childElementCount >= TRAIL_MAX) {
				trail.firstElementChild?.remove();
			}
			const still = document.createElement("canvas");
			still.width = frame.clientWidth;
			still.height = frame.clientHeight;
			const context = still.getContext("2d");
			if (context && video.videoWidth > 0) {
				const scale = Math.max(
					still.width / video.videoWidth,
					still.height / video.videoHeight
				);
				const width = video.videoWidth * scale;
				const height = video.videoHeight * scale;
				context.drawImage(
					video,
					(still.width - width) / 2,
					(still.height - height) / 2,
					width,
					height
				);
			}
			still.style.transform = `translate(${x}px, ${y}px) scale(0.8)`;
			still.style.zIndex = String(layer);
			trail.append(still);
			gsap.to(still, {
				delay: 0.1,
				duration: 0.3,
				ease: "power1.out",
				onComplete: () => still.remove(),
				opacity: 0,
			});
		};

		const [draggable] = Draggable.create(frame, {
			bounds: area.closest("section") ?? undefined,
			onDrag() {
				if (Math.hypot(this.x - lastX, this.y - lastY) > TRAIL_STEP) {
					stamp(lastX, lastY);
					playSfx("snap");
					lastX = this.x;
					lastY = this.y;
				}
			},
			onPress() {
				playSfx("pickup");
				lastX = this.x;
				lastY = this.y;
				layer += 1;
				frame.style.zIndex = String(layer + TRAIL_MAX);
				gsap.to(frame, { duration: 0.4, ease: "power3.out", scale: 0.8 });
				gsap.to(inner, { duration: 0.4, ease: "power3.out", scale: 1.5 });
			},
			onRelease() {
				playSfx("drop");
				gsap.to(frame, { duration: 0.6, ease: "power3.out", scale: 1 });
				gsap.to(inner, { duration: 0.6, ease: "power3.out", scale: 1 });
			},
			type: "x,y",
			zIndexBoost: false,
		});
		return () => {
			draggable?.kill();
		};
	}, []);

	return (
		<figure className="drag">
			<div className="drag-area" ref={areaRef}>
				<span aria-hidden="true" className="drag-label">
					dr<em>a</em>g me
				</span>
				<div aria-hidden="true" className="drag-trail" ref={trailRef} />
				<div
					className="drag-frame"
					data-cursor="drag"
					data-cursor-label="drag me"
					data-frame=""
					ref={frameRef}
				>
					<div className="drag-inner" data-inner="">
						<Image
							alt=""
							draggable={false}
							fill
							priority
							sizes="(min-width: 1200px) 22vw, 60vw"
							src={reel.cover}
						/>
						<video
							aria-label={alt}
							loop
							muted
							playsInline
							poster={reel.cover}
							preload="metadata"
							ref={videoRef}
							src={reel.video}
						>
							<track
								kind="captions"
								label="english"
								src={reel.captions}
								srcLang="en"
							/>
						</video>
					</div>
				</div>
			</div>
			<figcaption className="drag-caption">
				<SoundButton audible={audible} onToggle={toggle} />
				<a data-cursor="nav" href={reel.href} rel="noopener" target="_blank">
					{reel.title} ↗
				</a>
			</figcaption>
		</figure>
	);
}
