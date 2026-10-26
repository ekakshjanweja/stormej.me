"use client";

import {
	type KeyboardEvent,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { WAYS } from "../_lib/content";
import { gsap, reducedMotion } from "../_lib/gsap";

/* a segmented toggle between two ways of working. the pill slides under
   the chosen tab; the old cards are pushed sideways and wiped out while
   the new ones wipe in from the other side, and the box eases to its new
   height. a real tablist: arrows move between tabs */

const OPTIONS = WAYS.options;

export function Ways() {
	const [active, setActive] = useState(0);
	const [leaving, setLeaving] = useState<number | null>(null);
	const direction = useRef(1);
	const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
	const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
	const boxRef = useRef<HTMLDivElement>(null);
	const pillRef = useRef<HTMLSpanElement>(null);
	const previousHeight = useRef(0);

	const select = useCallback(
		(index: number) => {
			if (index === active) {
				return;
			}
			direction.current = index > active ? 1 : -1;
			previousHeight.current = boxRef.current?.offsetHeight ?? 0;
			if (!reducedMotion()) {
				setLeaving(active);
			}
			setActive(index);
		},
		[active]
	);

	const setTabRef = useCallback((node: HTMLButtonElement | null) => {
		if (node) {
			tabsRef.current[Number(node.dataset.index)] = node;
		}
	}, []);

	const setPanelRef = useCallback((node: HTMLDivElement | null) => {
		if (node) {
			panelsRef.current[Number(node.dataset.index)] = node;
		}
	}, []);

	const onTabClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			select(Number(event.currentTarget.dataset.index));
		},
		[select]
	);

	const onTabKey = useCallback(
		(event: KeyboardEvent<HTMLButtonElement>) => {
			const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
			if (!step) {
				return;
			}
			event.preventDefault();
			const next = (active + step + OPTIONS.length) % OPTIONS.length;
			select(next);
			tabsRef.current[next]?.focus();
		},
		[active, select]
	);

	/* the pill follows the selected tab */
	useLayoutEffect(() => {
		const tab = tabsRef.current[active];
		const pill = pillRef.current;
		if (tab && pill) {
			pill.style.width = `${tab.offsetWidth}px`;
			pill.style.transform = `translateX(${tab.offsetLeft}px)`;
		}
	}, [active]);

	useLayoutEffect(() => {
		if (leaving === null) {
			return;
		}
		const box = boxRef.current;
		const outgoing = panelsRef.current[leaving];
		const incoming = panelsRef.current[active];
		if (!(box && outgoing && incoming)) {
			setLeaving(null);
			return;
		}
		const shift = 100 * direction.current;
		const timeline = gsap.timeline({
			onComplete: () => {
				gsap.set(box, { clearProps: "height" });
				setLeaving(null);
			},
		});
		timeline
			.fromTo(
				box,
				{ height: previousHeight.current },
				{ duration: 1.25, ease: "power4.inOut", height: incoming.offsetHeight },
				0
			)
			.to(
				outgoing.querySelectorAll(".way-card"),
				{ duration: 1.5, ease: "backExpoInOut", stagger: 0.05, x: -shift },
				0
			)
			.fromTo(
				outgoing.querySelectorAll(".way-card"),
				{ clipPath: "inset(0% 0% 0% 0%)" },
				{
					clipPath: shift > 0 ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)",
					duration: 0.75,
					ease: "expo.out",
					stagger: 0.05,
				},
				0.2
			)
			.fromTo(
				incoming.querySelectorAll(".way-card"),
				{
					clipPath: shift > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)",
					x: shift,
				},
				{
					clipPath: "inset(0% 0% 0% 0%)",
					duration: 0.75,
					ease: "expo.out",
					stagger: 0.05,
					x: 0,
				},
				0.6
			);
		return () => {
			timeline.kill();
			gsap.set(outgoing.querySelectorAll(".way-card"), {
				clearProps: "transform,clipPath",
			});
			gsap.set(incoming.querySelectorAll(".way-card"), {
				clearProps: "transform,clipPath",
			});
		};
	}, [active, leaving]);

	return (
		<section aria-labelledby="ways-title" className="ways" id="ways">
			<div className="ways-head">
				<h2 className="ways-title" id="ways-title">
					{WAYS.title}
				</h2>
				<p className="ways-text">{WAYS.text}</p>
				<div aria-label="ways of working" className="ways-tabs" role="tablist">
					<span aria-hidden="true" className="ways-pill" ref={pillRef} />
					{OPTIONS.map((option, index) => (
						<button
							aria-controls={`way-panel-${option.id}`}
							aria-selected={index === active}
							className="ways-tab"
							data-index={index}
							id={`way-tab-${option.id}`}
							key={option.id}
							onClick={onTabClick}
							onKeyDown={onTabKey}
							ref={setTabRef}
							role="tab"
							tabIndex={index === active ? 0 : -1}
							type="button"
						>
							{option.label}
						</button>
					))}
				</div>
			</div>
			<div className="ways-box" ref={boxRef}>
				{OPTIONS.map((option, index) => (
					<div
						aria-labelledby={`way-tab-${option.id}`}
						className="ways-panel"
						data-index={index}
						hidden={index !== active && index !== leaving}
						id={`way-panel-${option.id}`}
						key={option.id}
						ref={setPanelRef}
						role="tabpanel"
					>
						<ol className="ways-cards">
							{option.cards.map((card, cardIndex) => (
								<li className="way-card" key={card.title}>
									<span aria-hidden="true" className="way-card-index">
										{String(cardIndex + 1).padStart(2, "0")}
									</span>
									<h3 className="way-card-title">{card.title}</h3>
									<p className="way-card-text">{card.text}</p>
								</li>
							))}
						</ol>
					</div>
				))}
			</div>
		</section>
	);
}
