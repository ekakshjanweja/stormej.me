"use client";

// springs after motion-primitives' spotlight and magnetic (motion-primitives.com)
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import type { DesignConfig } from "@/lib/design/options";

type CursorVariant = Exclude<DesignConfig["cursor"], "default">;

/** things worth growing over; the native cursor still does the real work */
const INTERACTIVE =
	"a, button, [role='button'], input, select, textarea, label, summary";

const FOLLOW = { damping: 40, mass: 0.4, stiffness: 520 };
const LAG = { damping: 26, mass: 0.6, stiffness: 180 };
const DRIFT = { damping: 30, mass: 1, stiffness: 90 };

const SPRINGS: Record<CursorVariant, typeof FOLLOW> = {
	blob: FOLLOW,
	ring: FOLLOW,
	spotlight: DRIFT,
	trail: LAG,
};

/**
 * A decorative cursor that follows the pointer on springs. It never hides
 * the native cursor, takes no pointer events and is only mounted for fine
 * pointers (see DesignEffects), so it can't get in the way of anything.
 */
export function DesignCursor({ variant }: { variant: CursorVariant }) {
	const x = useMotionValue(-200);
	const y = useMotionValue(-200);
	const followX = useSpring(x, SPRINGS[variant]);
	const followY = useSpring(y, SPRINGS[variant]);
	const [visible, setVisible] = useState(false);
	const [hovering, setHovering] = useState(false);
	const [pressed, setPressed] = useState(false);

	useEffect(() => {
		let shown = false;
		const onMove = (event: PointerEvent) => {
			if (event.pointerType !== "mouse" && event.pointerType !== "pen") {
				return;
			}
			x.set(event.clientX);
			y.set(event.clientY);
			if (!shown) {
				// arrive where the pointer is instead of flying in from the corner
				followX.jump(event.clientX);
				followY.jump(event.clientY);
				shown = true;
				setVisible(true);
			}
			const target = event.target instanceof Element ? event.target : null;
			setHovering(Boolean(target?.closest(INTERACTIVE)));
		};
		const onLeave = () => {
			shown = false;
			setVisible(false);
		};
		const onDown = () => setPressed(true);
		const onUp = () => setPressed(false);
		const root = document.documentElement;
		window.addEventListener("pointermove", onMove, { passive: true });
		window.addEventListener("pointerdown", onDown, { passive: true });
		window.addEventListener("pointerup", onUp, { passive: true });
		root.addEventListener("pointerleave", onLeave);
		window.addEventListener("blur", onLeave);
		return () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerdown", onDown);
			window.removeEventListener("pointerup", onUp);
			root.removeEventListener("pointerleave", onLeave);
			window.removeEventListener("blur", onLeave);
		};
	}, [x, y, followX, followY]);

	const state = {
		"data-hover": hovering || undefined,
		"data-pressed": pressed || undefined,
		"data-visible": visible || undefined,
	};

	if (variant === "trail") {
		return (
			<div
				aria-hidden="true"
				className="fx-cursor"
				data-cursor-fx={variant}
				{...state}
			>
				<motion.span
					className="fx-cursor-ring"
					style={{ x: followX, y: followY }}
				/>
				<motion.span className="fx-cursor-dot" style={{ x, y }} />
			</div>
		);
	}

	return (
		<div
			aria-hidden="true"
			className="fx-cursor"
			data-cursor-fx={variant}
			{...state}
		>
			<motion.span
				className="fx-cursor-shape"
				style={{ x: followX, y: followY }}
			/>
		</div>
	);
}
