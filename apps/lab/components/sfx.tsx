"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	interfaceAudio,
	readSfxPreferences,
	SFX_STORAGE_KEY,
	SFX_VOLUME,
	type SfxCue,
	type SfxTheme,
	saveSfxPreferences,
} from "@/lib/sfx";
import "./sfx.css";
import { useScrollSfx } from "./use-scroll-sfx";

const INTERACTIVE = "a[href], button, summary";
/* no click sound: things that make their own, the sfx control itself, the
   dev overlay, and something just dropped after a drag */
const SILENT =
	'[data-sfx="silent"], [data-sfx-control], nextjs-portal, [data-just-moved]';
/* no hover sound: only the control and the dev overlay. a quiet click can
   still have a hover of its own (a record sliding out) */
const HOVER_SILENT = "[data-sfx-control], nextjs-portal";
/* things that grow when you reach for them get a rising note; any other
   control a soft tick */
const GROWS =
	"[data-sfx-grow], .rc-item, .hm-feature, .hm-list-link, .s-logo, .liquid, .pill, .cycle";
/* cues a control can ask for by name, with data-sfx="…" */
const NAMED = new Set<SfxCue>([
	"tap",
	"navigate",
	"open",
	"close",
	"switch",
	"swatch",
	"shutter",
]);
/* things with a hover sound of their own, before the general ones: a
   record slides out of its sleeve, a face opens its card */
const HOVERS: [selector: string, cue: SfxCue][] = [
	[".rec", "slide"],
	[".face-spot", "pop"],
];

const cueFor = (control: Element): SfxCue | null => {
	const explicit = control.getAttribute("data-sfx");
	if (explicit && NAMED.has(explicit as SfxCue)) {
		return explicit as SfxCue;
	}
	if (control.hasAttribute("aria-expanded")) {
		return control.getAttribute("aria-expanded") === "true" ? "close" : "open";
	}
	if (control.getAttribute("aria-haspopup") === "dialog") {
		return "open";
	}
	if (control instanceof HTMLAnchorElement) {
		return control.getAttribute("aria-current") === "page" ? null : "navigate";
	}
	if (control instanceof HTMLElement && control.tagName === "SUMMARY") {
		return control.parentElement?.hasAttribute("open") ? "close" : "open";
	}
	return "tap";
};

/** what a hover over `target` is over, and the sound it makes: its own
    sound if it has one, a rising note if it grows, else a soft tick */
const hoverCue = (
	target: Element
): { cue: SfxCue; element: Element } | null => {
	for (const [selector, cue] of HOVERS) {
		const element = target.closest(selector);
		if (element) {
			return { cue, element };
		}
	}
	const grows = target.closest(GROWS);
	if (grows) {
		return { cue: "grow", element: grows };
	}
	const control = target.closest(INTERACTIVE);
	return control ? { cue: "hover", element: control } : null;
};

interface SfxSettings {
	available: boolean;
	enabled: boolean;
	toggle: () => void;
}

const SfxContext = createContext<SfxSettings | null>(null);

export function SoundEffects({
	children,
	theme,
}: {
	children: ReactNode;
	theme: SfxTheme;
}) {
	const [preferences, setPreferences] = useState({
		enabled: false,
		volume: SFX_VOLUME,
	});
	const [available, setAvailable] = useState(false);
	useScrollSfx(preferences.enabled);

	useEffect(() => {
		setAvailable(typeof window.AudioContext === "function");
		const reduced = matchMedia("(prefers-reduced-motion: reduce)");
		const restore = () => {
			const saved = readSfxPreferences();
			const next = { ...saved, enabled: saved.enabled && !reduced.matches };
			setPreferences(next);
			interfaceAudio.configure(next, theme);
		};
		const onStorage = (event: StorageEvent) => {
			if (event.key === SFX_STORAGE_KEY || event.key === null) {
				restore();
			}
		};
		restore();
		reduced.addEventListener("change", restore);
		window.addEventListener("storage", onStorage);
		return () => {
			reduced.removeEventListener("change", restore);
			window.removeEventListener("storage", onStorage);
			interfaceAudio.dispose();
		};
	}, [theme]);

	useEffect(() => {
		const click = async (event: MouseEvent) => {
			if (
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.altKey ||
				event.shiftKey ||
				!(event.target instanceof Element) ||
				event.target.closest(SILENT)
			) {
				return;
			}
			const control = event.target.closest(INTERACTIVE);
			if (!control || control.matches(':disabled, [aria-disabled="true"]')) {
				return;
			}
			const cue = cueFor(control);
			if (cue) {
				await interfaceAudio.play(cue);
			}
		};
		/* hovering: one cue per thing entered, never again while inside it */
		let hovered: Element | null = null;
		const over = async (event: PointerEvent) => {
			if (event.pointerType !== "mouse" || !(event.target instanceof Element)) {
				return;
			}
			if (event.target.closest(HOVER_SILENT)) {
				return;
			}
			const found = hoverCue(event.target);
			const control = found?.element ?? null;
			if (control === hovered) {
				return;
			}
			hovered = control;
			if (found) {
				await interfaceAudio.play(found.cue);
			}
		};
		/* browsers only allow sound after a gesture: the first click or key
		   wakes it, so the hovers after that can be heard */
		const wake = async () => {
			await interfaceAudio.unlock();
		};
		// Capture before React updates aria-expanded or begins a page transition.
		document.addEventListener("click", click, true);
		document.addEventListener("pointerover", over, { passive: true });
		document.addEventListener("pointerdown", wake, true);
		document.addEventListener("keydown", wake, true);
		document.addEventListener("visibilitychange", interfaceAudio.syncOutput);
		const mediaEvents = ["play", "pause", "ended", "volumechange"] as const;
		for (const event of mediaEvents) {
			document.addEventListener(event, interfaceAudio.syncOutput, true);
		}
		return () => {
			document.removeEventListener("click", click, true);
			document.removeEventListener("pointerover", over);
			document.removeEventListener("pointerdown", wake, true);
			document.removeEventListener("keydown", wake, true);
			document.removeEventListener(
				"visibilitychange",
				interfaceAudio.syncOutput
			);
			for (const event of mediaEvents) {
				document.removeEventListener(event, interfaceAudio.syncOutput, true);
			}
		};
	}, []);

	const toggle = useCallback(async () => {
		const next = { enabled: !preferences.enabled, volume: SFX_VOLUME };
		setPreferences(next);
		interfaceAudio.configure(next, theme);
		saveSfxPreferences(next);
		if (next.enabled) {
			await interfaceAudio.play("open");
		}
	}, [preferences.enabled, theme]);
	const value = useMemo(
		() => ({ available, enabled: preferences.enabled, toggle }),
		[preferences.enabled, available, toggle]
	);

	return <SfxContext value={value}>{children}</SfxContext>;
}

/** sound effects, on or off. on is full volume; there's nothing to set */
export function SfxControl() {
	const settings = useContext(SfxContext);
	if (!settings) {
		return null;
	}
	const { available, enabled, toggle } = settings;

	return (
		<div className="sfx-control" data-sfx-control="">
			<button
				aria-label="Sound effects"
				aria-pressed={enabled}
				className="sfx-toggle"
				disabled={!available}
				onClick={toggle}
				title={available ? "Toggle sound effects" : "Sound effects unavailable"}
				type="button"
			>
				<svg
					aria-hidden="true"
					fill="none"
					height="16"
					viewBox="0 0 20 20"
					width="16"
				>
					<path
						d="M3 8v4h3l4 3V5L6 8H3Z"
						stroke="currentColor"
						strokeLinejoin="round"
						strokeWidth="1.3"
					/>
					{enabled ? (
						<path
							d="M13 7a4 4 0 0 1 0 6m2-8a7 7 0 0 1 0 10"
							stroke="currentColor"
							strokeLinecap="round"
							strokeWidth="1.3"
						/>
					) : (
						<path
							d="m13 8 4 4m0-4-4 4"
							stroke="currentColor"
							strokeLinecap="round"
							strokeWidth="1.3"
						/>
					)}
				</svg>
				<span>sfx {enabled ? "on" : "off"}</span>
			</button>
		</div>
	);
}
