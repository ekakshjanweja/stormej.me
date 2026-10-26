"use client";

import Image from "next/image";
import {
	type CSSProperties,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import type { Portrait } from "@/lib/profile";
import { useMovable } from "../_lib/movable";

/** what a face says about me when it's reached for */
export interface FaceCard {
	content: ReactNode;
	/** a few words over it, after the place */
	label: string;
}

/** a photo for a face, and the card it opens, where the page gives one */
export type FacePhoto = Portrait & { card?: FaceCard };

/** somewhere a face may land, against the nearest positioned box */
export interface Spot {
	bottom?: string;
	left?: string;
	right?: string;
	/** diameter, in rem */
	size: number;
	/** degrees */
	tilt: number;
	top?: string;
}

/* a card is this wide (rem, see .face-card), and needs this much room */
const CARD_REM = 18;
const CARD_ROOM_PX = CARD_REM * 16 + 32;
/* below this far down the screen, a card opens upward */
const LOWER_HALF = 0.55;

/* small round photos, dropped about the page with no labels. each visit
   deals them out to a different few of the spots offered, so they never sit
   in quite the same places. they're picked after mount (a random deal can't
   be the same on the server), so they appear a beat after the page.

   they stay small. reach for one (hover, focus, or a tap) and, where the
   page gives it one, a card opens beside it with something about me. with a
   mouse they can be picked up and thrown somewhere else, too */
export function Faces({
	className,
	photos,
	spots,
}: {
	className?: string;
	photos: FacePhoto[];
	spots: Spot[];
}) {
	const [dealt, setDealt] = useState<Spot[] | null>(null);
	const [open, setOpen] = useState<string | null>(null);

	useEffect(() => {
		const pool = [...spots];
		for (let index = pool.length - 1; index > 0; index -= 1) {
			const swap = Math.floor(Math.random() * (index + 1));
			[pool[index], pool[swap]] = [pool[swap] as Spot, pool[index] as Spot];
		}
		setDealt(pool.slice(0, photos.length));
	}, [photos.length, spots]);

	if (!dealt) {
		return null;
	}

	return (
		<ul className={`faces ${className ?? ""}`}>
			{photos.map((photo, index) => {
				const spot = dealt[index];
				return spot ? (
					<Face
						key={photo.src}
						onToggle={setOpen}
						open={open === photo.src}
						photo={photo}
						spot={spot}
					/>
				) : null;
			})}
		</ul>
	);
}

/** one face, in its spot. the spot is what moves; the face inside it is
    what tilts, and the card sits beside it on whichever side has room */
function Face({
	onToggle,
	open,
	photo,
	spot,
}: {
	onToggle: Dispatch<SetStateAction<string | null>>;
	open: boolean;
	photo: FacePhoto;
	spot: Spot;
}) {
	const spotRef = useRef<HTMLLIElement>(null);
	const cardId = useId();
	const movedRef = useMovable(spotRef);
	const { card } = photo;

	/* open toward the side with room, and upward low on the screen */
	const place = useCallback(() => {
		const element = spotRef.current;
		if (!element) {
			return;
		}
		const rect = element.getBoundingClientRect();
		element.dataset.side =
			rect.right + CARD_ROOM_PX > window.innerWidth ? "left" : "right";
		element.dataset.lift =
			rect.top > window.innerHeight * LOWER_HALF ? "up" : "down";
	}, []);

	const toggle = useCallback(() => {
		/* putting it down isn't asking to see it */
		if (movedRef.current) {
			return;
		}
		place();
		onToggle((current) => (current === photo.src ? null : photo.src));
	}, [movedRef, onToggle, photo.src, place]);

	/* an open card closes on a press anywhere else, or on esc */
	useEffect(() => {
		if (!open) {
			return;
		}
		const onDown = (event: PointerEvent) => {
			if (!spotRef.current?.contains(event.target as Node)) {
				onToggle(null);
			}
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onToggle(null);
			}
		};
		window.addEventListener("pointerdown", onDown);
		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("pointerdown", onDown);
			window.removeEventListener("keydown", onKey);
		};
	}, [onToggle, open]);

	return (
		<li
			className="face-spot"
			data-open={open ? "" : undefined}
			ref={spotRef}
			style={
				{
					"--size": `${spot.size}rem`,
					"--tilt": `${spot.tilt}deg`,
					bottom: spot.bottom,
					left: spot.left,
					right: spot.right,
					top: spot.top,
				} as CSSProperties
			}
		>
			<div className="face">
				<button
					aria-controls={card ? cardId : undefined}
					aria-expanded={card ? open : undefined}
					aria-label={photo.alt}
					className="face-button"
					data-cursor="drag"
					data-cursor-label="drag"
					data-sfx="shutter"
					onClick={toggle}
					onFocus={place}
					onPointerEnter={place}
					type="button"
				>
					<Image alt="" draggable={false} fill sizes="120px" src={photo.src} />
				</button>
			</div>
			{card ? (
				<div className="face-card" id={cardId}>
					<p className="face-card-label">
						{photo.place} · {card.label}
					</p>
					{card.content}
				</div>
			) : null}
		</li>
	);
}
