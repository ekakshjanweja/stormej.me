"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ScrollTrigger } from "../_lib/gsap";
import {
	DEFAULT_THEME,
	DEFAULT_TYPE,
	isTheme,
	isType,
	THEME_KEY,
	THEMES,
	type ThemeId,
	TYPE_KEY,
	TYPES,
	type TypeId,
} from "../_lib/themes";

const SWITCH_MS = 500;
/* long enough for a newly chosen face to start loading */
const REMEASURE_AFTER_MS = 400;

/* a chip in the corner that opens two settings, chosen apart: a type style
   and a colour palette. the strip eases over to each choice. until someone
   picks, a visit opens as cobalt + serif; the first pick remembers both */
export function ThemePicker() {
	const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
	const [type, setType] = useState<TypeId>(DEFAULT_TYPE);
	const [open, setOpen] = useState(false);
	const id = useId();
	const rootRef = useRef<HTMLDivElement>(null);
	const toggleRef = useRef<HTMLButtonElement>(null);

	/* the gate in the layout has already applied them; read them back */
	useEffect(() => {
		const { dataset } = document.documentElement;
		if (isTheme(dataset.theme)) {
			setTheme(dataset.theme);
		}
		if (isType(dataset.type)) {
			setType(dataset.type);
		}
	}, []);

	const remember = useCallback(() => {
		const { dataset } = document.documentElement;
		try {
			localStorage.setItem(THEME_KEY, dataset.theme ?? DEFAULT_THEME);
			localStorage.setItem(TYPE_KEY, dataset.type ?? DEFAULT_TYPE);
		} catch {
			/* storage off: the choice still applies for this visit */
		}
	}, []);

	const ease = useCallback(() => {
		const root = document.documentElement;
		root.dataset.themeSwitching = "";
		window.setTimeout(() => {
			delete root.dataset.themeSwitching;
		}, SWITCH_MS);
	}, []);

	const onTheme = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			const next = event.currentTarget.dataset.themeId;
			if (!isTheme(next)) {
				return;
			}
			ease();
			document.documentElement.dataset.theme = next;
			remember();
			setTheme(next);
		},
		[ease, remember]
	);

	const onType = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			const next = event.currentTarget.dataset.typeId;
			if (!isType(next)) {
				return;
			}
			document.documentElement.dataset.type = next;
			remember();
			setType(next);
			/* another face changes how wide the panels are, so the sideways
			   scroll is measured again once it has arrived */
			window.setTimeout(() => {
				document.fonts?.ready.then(() =>
					requestAnimationFrame(() => ScrollTrigger.refresh())
				);
			}, REMEASURE_AFTER_MS);
		},
		[remember]
	);

	const toggle = useCallback(() => setOpen((value) => !value), []);

	useEffect(() => {
		if (!open) {
			return;
		}
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
				toggleRef.current?.focus();
			}
		};
		const onDown = (event: PointerEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		window.addEventListener("keydown", onKey);
		window.addEventListener("pointerdown", onDown);
		return () => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("pointerdown", onDown);
		};
	}, [open]);

	const themeName = THEMES.find((item) => item.id === theme)?.name ?? theme;
	const typeName = TYPES.find((item) => item.id === type)?.name ?? type;

	return (
		<div className="themes" ref={rootRef}>
			<div className="themes-panel" hidden={!open} id={id}>
				<p className="themes-hint">style</p>
				<div className="themes-grid">
					{TYPES.map((item) => (
						<button
							aria-pressed={item.id === type}
							className="themes-option"
							data-cursor="nav"
							data-sfx="swatch"
							data-type-id={item.id}
							key={item.id}
							onClick={onType}
							type="button"
						>
							<span
								aria-hidden="true"
								className="type-sample"
								data-type-sample={item.id}
							>
								Aa
							</span>
							{item.name}
						</button>
					))}
				</div>
				<p className="themes-hint">colour</p>
				<div className="themes-grid">
					{THEMES.map((item) => (
						<button
							aria-pressed={item.id === theme}
							className="themes-option"
							data-cursor="nav"
							data-sfx="swatch"
							data-theme-id={item.id}
							key={item.id}
							onClick={onTheme}
							type="button"
						>
							<span
								aria-hidden="true"
								className="swatch"
								data-swatch={item.id}
							/>
							{item.name}
						</button>
					))}
				</div>
			</div>
			<button
				aria-controls={id}
				aria-expanded={open}
				aria-label={`look: ${typeName}, ${themeName}`}
				className="themes-toggle"
				data-cursor="nav"
				onClick={toggle}
				ref={toggleRef}
				type="button"
			>
				<span aria-hidden="true" className="swatch" data-swatch={theme} />
				{typeName} · {themeName}
			</button>
		</div>
	);
}
