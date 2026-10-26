"use client";

import Image from "next/image";
import {
	type KeyboardEvent,
	type MouseEvent,
	type PointerEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { pad } from "../_lib/format";

/* a case's screens on a strip that bends like the inside of the ring as it
   scrolls (a scroll-driven animation, so no script runs per frame). drag
   it, swipe it, use the arrows, or open a screen to see it big */

interface GalleryProps {
	shape: "phone" | "wide";
	shots: string[];
	title: string;
}

/** past this many px a press is a drag, not a click */
const DRAG_SLOP = 6;

const behavior = (): ScrollBehavior =>
	prefersReducedMotion() ? "auto" : "smooth";

export function Gallery({ shape, shots, title }: GalleryProps) {
	const trackRef = useRef<HTMLUListElement>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [active, setActive] = useState(0);
	const [open, setOpen] = useState<number | null>(null);
	const drag = useRef({ left: 0, moved: 0, pointer: -1, x: 0 });

	const buttons = useCallback(
		() =>
			Array.from(
				trackRef.current?.querySelectorAll<HTMLButtonElement>(".shot") ?? []
			),
		[]
	);

	const bring = useCallback(
		(index: number) => {
			const target = buttons()[index];
			if (!target) {
				return;
			}
			target.focus({ preventScroll: true });
			target.scrollIntoView({
				behavior: behavior(),
				block: "nearest",
				inline: "center",
			});
			setActive(index);
		},
		[buttons]
	);

	const step = useCallback(
		(direction: number) => {
			const track = trackRef.current;
			const [first] = buttons();
			if (!(track && first)) {
				return;
			}
			const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
			track.scrollBy({
				behavior: behavior(),
				left: direction * (first.getBoundingClientRect().width + gap),
			});
		},
		[buttons]
	);
	const previous = useCallback(() => step(-1), [step]);
	const next = useCallback(() => step(1), [step]);

	/* arrow keys move between screens; only one of them is in the tab order */
	const onKeyDown = useCallback(
		(event: KeyboardEvent<HTMLUListElement>) => {
			const count = shots.length;
			const moves: Record<string, number> = {
				ArrowLeft: active - 1,
				ArrowRight: active + 1,
				End: count - 1,
				Home: 0,
			};
			const target = moves[event.key];
			if (target === undefined) {
				return;
			}
			event.preventDefault();
			bring(Math.min(count - 1, Math.max(0, target)));
		},
		[active, bring, shots.length]
	);

	const onFocus = useCallback((event: React.FocusEvent<HTMLButtonElement>) => {
		setActive(Number(event.currentTarget.dataset.index));
	}, []);

	/* a mouse can drag the strip like the ring; touch scrolls natively */
	const onPointerDown = useCallback((event: PointerEvent<HTMLUListElement>) => {
		if (event.pointerType !== "mouse" || event.button !== 0) {
			return;
		}
		drag.current = {
			left: event.currentTarget.scrollLeft,
			moved: 0,
			pointer: event.pointerId,
			x: event.clientX,
		};
	}, []);

	const onPointerMove = useCallback((event: PointerEvent<HTMLUListElement>) => {
		const state = drag.current;
		if (state.pointer !== event.pointerId) {
			return;
		}
		const track = event.currentTarget;
		const dx = event.clientX - state.x;
		state.moved = Math.max(state.moved, Math.abs(dx));
		if (state.moved > DRAG_SLOP && !track.hasPointerCapture(event.pointerId)) {
			track.setPointerCapture(event.pointerId);
			track.setAttribute("data-dragging", "");
		}
		if (track.hasAttribute("data-dragging")) {
			track.scrollLeft = state.left - dx;
		}
	}, []);

	const endDrag = useCallback((event: PointerEvent<HTMLUListElement>) => {
		if (drag.current.pointer !== event.pointerId) {
			return;
		}
		drag.current.pointer = -1;
		event.currentTarget.removeAttribute("data-dragging");
	}, []);

	/* a drag that ends on a screen must not open it */
	const onClickCapture = useCallback((event: MouseEvent) => {
		if (drag.current.moved > DRAG_SLOP) {
			event.preventDefault();
			event.stopPropagation();
			drag.current.moved = 0;
		}
	}, []);

	const show = useCallback((event: MouseEvent<HTMLButtonElement>) => {
		setOpen(Number(event.currentTarget.dataset.index));
	}, []);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) {
			return;
		}
		if (open !== null && !dialog.open) {
			dialog.showModal();
		}
		if (open === null && dialog.open) {
			dialog.close();
		}
	}, [open]);

	const close = useCallback(() => {
		const index = open;
		setOpen(null);
		if (index !== null) {
			bring(index);
		}
	}, [bring, open]);

	const flip = useCallback(
		(direction: number) =>
			setOpen((current) =>
				current === null
					? current
					: (current + direction + shots.length) % shots.length
			),
		[shots.length]
	);
	const flipBack = useCallback(() => flip(-1), [flip]);
	const flipOn = useCallback(() => flip(1), [flip]);

	const onDialogKey = useCallback(
		(event: KeyboardEvent<HTMLDialogElement>) => {
			if (event.key === "ArrowLeft") {
				flip(-1);
			} else if (event.key === "ArrowRight") {
				flip(1);
			}
		},
		[flip]
	);

	/* a press on the dim backdrop closes */
	const onDialogClick = useCallback(
		(event: MouseEvent<HTMLDialogElement>) => {
			if (event.target === event.currentTarget) {
				close();
			}
		},
		[close]
	);

	const many = shots.length > 1;
	const items = shots.map((src, index) => ({ index, src }));

	return (
		<div className="gallery" data-shape={shape}>
			<div className="gallery-head">
				<p aria-hidden="true" className="gallery-count">
					{pad(shots.length)} {shots.length === 1 ? "screen" : "screens"}
				</p>
				{many ? (
					<div className="gallery-nav">
						<button aria-label="scroll back" onClick={previous} type="button">
							←
						</button>
						<button aria-label="scroll on" onClick={next} type="button">
							→
						</button>
					</div>
				) : null}
			</div>
			{/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: the strip is a drag surface; every screen inside is a button and the arrow keys move between them */}
			<ul
				aria-label={`${title} screens. drag, scroll or use the arrow keys`}
				className="gallery-track"
				data-cursor="drag"
				onClickCapture={onClickCapture}
				onKeyDown={onKeyDown}
				onLostPointerCapture={endDrag}
				onPointerCancel={endDrag}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={endDrag}
				ref={trackRef}
			>
				{items.map(({ index, src }) => (
					<li className="gallery-item" key={src}>
						<button
							aria-label={`${title} screen ${index + 1}, open it bigger`}
							className="shot"
							data-cursor="open"
							data-index={index}
							onClick={show}
							onFocus={onFocus}
							tabIndex={index === active ? 0 : -1}
							type="button"
						>
							<span aria-hidden className="card-frame" />
							<span className="shot-face">
								<Image
									alt={`${title} screen ${index + 1}`}
									className="shot-media"
									draggable={false}
									fill
									sizes={
										shape === "wide"
											? "(max-width: 700px) 86vw, 760px"
											: "300px"
									}
									src={src}
								/>
							</span>
						</button>
					</li>
				))}
			</ul>
			{/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: the backdrop click is a mouse nicety; escape and the close button do the same */}
			<dialog
				aria-label={`${title} screens`}
				className="lightbox"
				onClick={onDialogClick}
				onClose={close}
				onKeyDown={onDialogKey}
				ref={dialogRef}
			>
				{open === null ? null : (
					<div className="lightbox-body" data-shape={shape}>
						<div className="lightbox-media">
							<Image
								alt={`${title} screen ${open + 1}`}
								fill
								sizes="(max-width: 700px) 92vw, 80vw"
								src={shots[open] ?? ""}
							/>
						</div>
						<div className="lightbox-bar">
							<p className="lightbox-count">
								{pad(open + 1)} / {pad(shots.length)}
							</p>
							{many ? (
								<div className="gallery-nav">
									<button
										aria-label="previous screen"
										onClick={flipBack}
										type="button"
									>
										←
									</button>
									<button
										aria-label="next screen"
										onClick={flipOn}
										type="button"
									>
										→
									</button>
								</div>
							) : null}
							<button className="lightbox-close" onClick={close} type="button">
								close <kbd>esc</kbd>
							</button>
						</div>
					</div>
				)}
			</dialog>
		</div>
	);
}
