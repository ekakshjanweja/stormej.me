"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { pageIntro } from "@/components/curtain/page-intro";
import { COVER, type LoaderProps } from "./types";

gsap.registerPlugin(useGSAP);

const PHOSPHOR = "#8fc09d";
const GLASS = "#050605";
const ALARM = "#ff5f56";
const BAR_WIDTH = 32;
const HEX = "0123456789abcdef";

/** [message, status]; an empty status prints the line bare */
const BOOT: [string, string][] = [
	["stormej bios v26.10 · (c) ekaksh janweja", ""],
	["cpu0: caffeine x9 @ 4.20ghz", "ok"],
	["memory check: 16384mb of taste", "ok"],
	["mounting /dev/ideas", "ok"],
	["starting flutter engine", "ok"],
	["hydrating riverpod providers", "ok"],
	["resolving 2,147 pub dependencies", "ok"],
	["warming up shaders", "ok"],
	["linking bullzeye.so fpv_labs.so digital_domi.so", "ok"],
	["compiling lumen · burrow · aarthiq · turi", "ok"],
	["checking for bugs", "0 found"],
	["shipping to production", "fail"],
];
const PANIC = [
	"kernel panic: taste overflow at 0x5708ffe",
	"  too polished to contain. dumping core…",
];
/** the log is drawn once plus this many glitch copies */
const SLICES = 3;

function hexDump(length: number) {
	let out = "";
	for (let i = 0; i < length; i += 1) {
		out += HEX[Math.floor(Math.random() * 16)];
		if (i % 4 === 3) {
			out += " ";
		}
	}
	return out;
}

function Log() {
	return (
		<div className="p-5 text-[11px] leading-[1.7] sm:p-10 sm:text-[13px]">
			{BOOT.map(([message, status], i) => (
				<p className="flex gap-3 whitespace-nowrap" data-line={i} key={message}>
					<span className="truncate">{message}</span>
					{status ? (
						<>
							<span className="min-w-0 flex-1 overflow-hidden opacity-40">
								{".".repeat(200)}
							</span>
							<span
								data-status={i}
								style={status === "fail" ? { color: ALARM } : undefined}
							>
								[ {status} ]
							</span>
						</>
					) : null}
				</p>
			))}
			<p className="mt-4 whitespace-pre" data-bar>
				&nbsp;
			</p>
			{PANIC.map((line, i) => (
				<p
					className="whitespace-pre"
					data-panic-line={i}
					key={line}
					style={{ color: ALARM }}
				>
					{line}
				</p>
			))}
		</div>
	);
}

/**
 * A boot log for the site that gets a little too pleased with itself: it
 * runs green, fails on "shipping to production", panics, tears itself into
 * rgb shreds, then the tube switches off and the page is behind it.
 */
export function KernelPanic({ onDone }: LoaderProps) {
	const root = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const q = gsap.utils.selector(root);
			const [screen] = q("[data-screen]");
			const [dump] = q("[data-dump]");
			const slices = q("[data-slice]");
			const logs = q("[data-log]");
			const bars = q("[data-bar]");
			const glitch = { on: 0 };
			const progress = { value: 0 };

			gsap.set(q("[data-line], [data-status], [data-panic-line]"), {
				visibility: "hidden",
			});
			gsap.set(slices, { visibility: "hidden" });

			const renderBar = () => {
				const filled = Math.round((progress.value / 100) * BAR_WIDTH);
				const text = `[${"#".repeat(filled)}${"-".repeat(BAR_WIDTH - filled)}] ${Math.round(progress.value)}%`;
				for (const bar of bars) {
					bar.textContent = text;
				}
			};

			/* while glitching, every frame re-rolls the shake, the colour split,
			   the torn slices and the core dump */
			const tear = () => {
				if (glitch.on < 0.5) {
					return;
				}
				const split = gsap.utils.random(2, 14);
				gsap.set(screen ?? [], {
					x: gsap.utils.random(-10, 10),
					y: gsap.utils.random(-6, 6),
				});
				gsap.set(logs, {
					textShadow: `${split}px 0 ${ALARM}, ${-split}px 0 #05d9e8`,
				});
				for (const slice of slices) {
					const top = gsap.utils.random(0, 92);
					const height = gsap.utils.random(2, 14);
					const inverted = Math.random() < 0.3;
					gsap.set(slice, {
						backgroundColor: inverted ? PHOSPHOR : GLASS,
						clipPath: `inset(${top}% 0 ${Math.max(0, 100 - top - height)}% 0)`,
						color: inverted ? GLASS : PHOSPHOR,
						visibility: "visible",
						x: gsap.utils.random(-90, 90),
					});
				}
				if (dump) {
					dump.textContent = hexDump(2400);
					dump.style.opacity = `${gsap.utils.random(0.1, 0.5)}`;
				}
			};
			gsap.ticker.add(tear);

			const tl = gsap.timeline({ onComplete: onDone });

			/* boot: lines land at an uneven clip, statuses a beat later */
			let at = 0.25;
			for (const [i, [, status]] of BOOT.entries()) {
				tl.set(q(`[data-line='${i}']`), { visibility: "visible" }, at);
				if (status) {
					tl.set(
						q(`[data-status='${i}']`),
						{ visibility: "visible" },
						at + gsap.utils.random(0.04, 0.14)
					);
				}
				at += i === BOOT.length - 1 ? 0.5 : gsap.utils.random(0.06, 0.17);
			}
			tl.to(
				progress,
				{
					duration: at - 0.4,
					ease: "steps(18)",
					onUpdate: renderBar,
					value: 97,
				},
				0.3
			).to(
				q("[data-status='11']"),
				{ duration: 0.08, opacity: 0, repeat: 5, yoyo: true },
				at - 0.3
			);

			/* panic */
			tl.set(q("[data-panic-line='0']"), { visibility: "visible" }, at)
				.set(q("[data-panic-line='1']"), { visibility: "visible" }, at + 0.25)
				.set(glitch, { on: 1 }, at + 0.45)
				.set(slices, { visibility: "visible" }, at + 0.45)
				.fromTo(
					q("[data-panic]"),
					{ autoAlpha: 0 },
					{
						autoAlpha: 1,
						duration: 0.05,
						ease: "steps(1)",
						repeat: 9,
						repeatDelay: 0.06,
						yoyo: true,
					},
					at + 0.6
				)
				.to(q("[data-scan]"), { duration: 0.2, opacity: 0.9 }, at + 0.6)
				.set(glitch, { on: 0 }, at + 1.75)
				.set(slices, { visibility: "hidden" }, at + 1.75)
				.set(logs, { textShadow: "none" }, at + 1.75)
				.set(screen ?? [], { x: 0, y: 0 }, at + 1.75)
				.set(q("[data-panic]"), { autoAlpha: 0 }, at + 1.75)
				.set(dump ?? [], { opacity: 0 }, at + 1.75);

			/* the tube switches off: a white line, a dot, nothing */
			const off = at + 1.8;
			tl.set(root.current, { pointerEvents: "none" }, off)
				.to(
					screen ?? [],
					{ backgroundColor: "#e9fff0", duration: 0.12, ease: "power2.in" },
					off
				)
				.to(
					screen ?? [],
					{ duration: 0.22, ease: "power4.in", scaleY: 0.004 },
					off
				)
				.to(screen ?? [], { duration: 0.24, ease: "power4.in", scaleX: 0 }, ">")
				.fromTo(
					q("[data-glow]"),
					{ opacity: 1, scale: 1 },
					{ duration: 0.5, ease: "power2.out", opacity: 0, scale: 0.2 },
					">-0.05"
				)
				.add(pageIntro(), off + 0.3);

			return () => gsap.ticker.remove(tear);
		},
		{ scope: root }
	);

	return (
		<div aria-hidden className={COVER} ref={root}>
			<div
				className="absolute inset-0 overflow-hidden font-mono"
				data-screen
				style={{ backgroundColor: GLASS, color: PHOSPHOR }}
			>
				<pre
					className="absolute inset-0 overflow-hidden whitespace-pre-wrap break-all p-2 text-[10px] leading-[1.15] opacity-0"
					data-dump
				/>
				<div className="relative" data-log>
					<Log />
				</div>
				{Array.from({ length: SLICES }, (_, i) => (
					<div
						className="absolute inset-0"
						data-log
						data-slice
						// biome-ignore lint/suspicious/noArrayIndexKey: identical glitch copies
						key={i}
					>
						<Log />
					</div>
				))}
				<div
					className="absolute inset-0 grid place-items-center bg-[#e9fff0] opacity-0"
					data-panic
				>
					<p
						className="text-center font-bold font-space-mono text-[clamp(56px,13vw,220px)] uppercase leading-[0.85] tracking-tight"
						style={{ color: GLASS }}
					>
						kernel
						<br />
						panic
					</p>
				</div>
				{/* scanlines and a vignette, for the glass */}
				<div
					className="pointer-events-none absolute inset-0 opacity-40"
					data-scan
					style={{
						background:
							"repeating-linear-gradient(to bottom, rgba(0,0,0,0.5) 0 1px, transparent 1px 3px)",
					}}
				/>
				<div
					className="pointer-events-none absolute inset-0"
					style={{
						background:
							"radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65))",
					}}
				/>
			</div>
			<div
				className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-[0_0_30px_12px_rgba(201,255,214,0.8)]"
				data-glow
			/>
		</div>
	);
}
