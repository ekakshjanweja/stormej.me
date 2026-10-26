"use client";

import Lenis from "lenis";
import { usePathname, useRouter } from "next/navigation";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { playSfx } from "@/lib/sfx";
import {
	getLenis,
	gsap,
	reducedMotion,
	ScrollTrigger,
	SIDEWAYS,
	scrollToY,
	setLenis,
} from "../_lib/gsap";
import { setPhase } from "../_lib/phase";
import { ClickBurst } from "./click-burst";
import { Cursor } from "./cursor";
import { Curtain, type CurtainHandle } from "./curtain";
import { FluidTrail } from "./fluid-trail";
import { Footer } from "./footer";
import { Nav } from "./nav";
import { Preloader } from "./preloader";
import { Progress } from "./progress";
import { SpotifyProvider } from "./spotify";
import { NavigateContext } from "./strip-link";
import { ThemePicker } from "./theme-picker";

const nextFrame = () =>
	new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/* sideways, every page glides; stacked, the pages are heavier, then brake */
const FEEL = {
	sideways: { lerp: 0.12, wheelMultiplier: 0.6 },
	stacked: { lerp: 0.07, wheelMultiplier: 0.5 },
} as const;
const BRAKE_LERP = 0.3;
const BRAKE_AFTER_MS = 150;

export function Shell({ children }: { children: ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const curtainRef = useRef<CurtainHandle>(null);
	const busyRef = useRef(false);
	/* usePathname leaves the base path off, so the curtain compares
	   against this rather than window.location */
	const pathnameRef = useRef(pathname);
	pathnameRef.current = pathname;
	const arrivedRef = useRef<(() => void) | null>(null);
	const [locked, setLocked] = useState(false);

	/* one lenis for the whole visit, on gsap's clock so scrolltrigger and
	   the smoothing never disagree by a frame */
	useEffect(() => {
		if (reducedMotion()) {
			return;
		}
		const lenis = new Lenis({ easing: (t) => 1 - 2 ** (-10 * t) });
		setLenis(lenis);
		lenis.on("scroll", ScrollTrigger.update);
		const raf = (time: number) => lenis.raf(time * 1000);
		gsap.ticker.add(raf);
		gsap.ticker.lagSmoothing(0);
		return () => {
			gsap.ticker.remove(raf);
			lenis.destroy();
			setLenis(null);
		};
	}, []);

	/* sideways or stacked, and when stacked a brake: when the wheel stops,
	   the lerp jumps so the page settles instead of drifting */
	useEffect(() => {
		const lenis = getLenis();
		if (!lenis) {
			return;
		}
		const media = window.matchMedia(SIDEWAYS);
		let timer = 0;
		const apply = () => {
			const feel = media.matches ? FEEL.sideways : FEEL.stacked;
			lenis.options.lerp = feel.lerp;
			lenis.options.wheelMultiplier = feel.wheelMultiplier;
		};
		const onWheel = () => {
			if (media.matches) {
				return;
			}
			lenis.options.lerp = FEEL.stacked.lerp;
			window.clearTimeout(timer);
			timer = window.setTimeout(() => {
				lenis.options.lerp = BRAKE_LERP;
			}, BRAKE_AFTER_MS);
		};
		apply();
		media.addEventListener("change", apply);
		window.addEventListener("wheel", onWheel, { passive: true });
		return () => {
			window.clearTimeout(timer);
			media.removeEventListener("change", apply);
			window.removeEventListener("wheel", onWheel);
		};
	}, []);

	useEffect(() => {
		if (pathname) {
			arrivedRef.current?.();
			arrivedRef.current = null;
		}
	}, [pathname]);

	const navigate = useCallback(
		async (href: string, label: string) => {
			if (busyRef.current) {
				return;
			}
			if (href === pathnameRef.current) {
				scrollToY(0);
				return;
			}
			if (reducedMotion()) {
				router.push(href);
				return;
			}
			busyRef.current = true;
			setLocked(true);
			setPhase("covered");
			getLenis()?.stop();
			playSfx("whoosh");
			await curtainRef.current?.cover(label);

			const arrived = new Promise<void>((resolve) => {
				arrivedRef.current = resolve;
			});
			router.push(href, { scroll: false });
			await arrived;
			await nextFrame();
			await nextFrame();

			window.scrollTo(0, 0);
			getLenis()?.scrollTo(0, { immediate: true });
			getLenis()?.start();
			ScrollTrigger.refresh();
			document.getElementById("strip-main")?.focus({ preventScroll: true });

			playSfx("reveal");
			await curtainRef.current?.reveal();
			busyRef.current = false;
			setLocked(false);
		},
		[router]
	);

	return (
		<NavigateContext value={navigate}>
			<SpotifyProvider>
				<a className="skip" href="#strip-main">
					skip to content
				</a>
				<Nav />
				<main id="strip-main" tabIndex={-1}>
					{children}
				</main>
				<Footer />
				<Progress />
				<FluidTrail />
				<Curtain ref={curtainRef} />
				<Preloader />
				<Cursor />
				<ClickBurst />
				<ThemePicker />
				<div aria-hidden="true" className="lock" hidden={!locked} />
			</SpotifyProvider>
		</NavigateContext>
	);
}
