"use client";

import { RotateCcw, Upload } from "lucide-react";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import {
	COLOR_KEYS,
	COLOR_LABELS,
	COLOR_PRESETS,
	type ColorKey,
	colorsCss,
	DEFAULT_COLORS,
	isHexColor,
	type ModeColors,
	normalizeColors,
	type SiteColors,
	sameColors,
} from "@/lib/site-colors";

const MODES = ["light", "dark"] as const;
type Mode = (typeof MODES)[number];

/** WCAG AA for body text */
const MIN_CONTRAST = 4.5;
/** colours read as text on the background, so they get a contrast check */
const TEXT_KEYS = new Set<ColorKey>(["foreground", "muted", "accent"]);

const buttonClass =
	"group inline-flex shrink-0 items-center gap-2 rounded-full border border-border/40 bg-background px-4 py-2 text-[13px] shadow-sm transition-colors duration-150 hover:border-foreground/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40";

function luminance(hex: string) {
	const channels = [1, 3, 5].map((index) => {
		const value = Number.parseInt(hex.slice(index, index + 2), 16) / 255;
		return value <= 0.039_28 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	});
	const [red = 0, green = 0, blue = 0] = channels;
	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(a: string, b: string) {
	const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05);
}

/** live preview: the layout always renders this tag (app/layout.tsx) */
function previewColors(colors: SiteColors) {
	const style = document.getElementById("site-colors");
	if (style) {
		style.textContent = colorsCss(colors);
	}
}

function ColorRow({
	colorKey,
	mode,
	onChange,
	values,
}: {
	colorKey: ColorKey;
	mode: Mode;
	onChange: (mode: Mode, key: ColorKey, value: string) => void;
	values: ModeColors;
}) {
	const value = values[colorKey];
	const [text, setText] = useState(value);

	// picker edits and resets flow back into the text field
	useEffect(() => setText(value), [value]);

	const onPick = useCallback(
		(event: ChangeEvent<HTMLInputElement>) =>
			onChange(mode, colorKey, event.target.value),
		[mode, colorKey, onChange]
	);
	const onType = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const next = event.target.value.trim();
			setText(next);
			if (isHexColor(next)) {
				onChange(mode, colorKey, next.toLowerCase());
			}
		},
		[mode, colorKey, onChange]
	);
	// a half-typed value snaps back to the colour actually in use
	const onBlur = useCallback(() => setText(value), [value]);

	const ratio = TEXT_KEYS.has(colorKey)
		? contrast(value, values.background)
		: null;
	const id = `color-${mode}-${colorKey}`;

	return (
		<div className="flex items-center gap-3">
			<input
				aria-label={`${mode} ${COLOR_LABELS[colorKey]} picker`}
				className="size-7 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
				onChange={onPick}
				type="color"
				value={value}
			/>
			<label className="w-20 shrink-0 text-[13px]" htmlFor={id}>
				{COLOR_LABELS[colorKey]}
			</label>
			<input
				className="w-24 rounded-md border border-border/60 bg-muted/20 px-2 py-1 font-mono text-xs"
				id={id}
				maxLength={7}
				onBlur={onBlur}
				onChange={onType}
				spellCheck={false}
				value={text}
			/>
			{ratio === null ? null : (
				<span
					className={`font-mono text-[11px] tabular-nums ${ratio < MIN_CONTRAST ? "text-destructive" : "text-muted-foreground"}`}
					title="contrast against the background; 4.5 or more reads well"
				>
					{ratio.toFixed(1)}
					{ratio < MIN_CONTRAST ? " low" : ""}
				</span>
			)}
		</div>
	);
}

type Preset = (typeof COLOR_PRESETS)[number];

/** a preset chip: its light and dark backgrounds split down a circle, with each accent as a dot */
function PresetButton({
	active,
	onSelect,
	preset,
}: {
	active: boolean;
	onSelect: (id: string) => void;
	preset: Preset;
}) {
	const onClick = useCallback(() => onSelect(preset.id), [onSelect, preset.id]);
	const { dark, light } = preset.colors;

	return (
		<button
			aria-pressed={active}
			className={`inline-flex items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-1.5 text-[13px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 ${
				active
					? "border-foreground/50 bg-muted text-foreground"
					: "border-border/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
			}`}
			onClick={onClick}
			title={preset.hint}
			type="button"
		>
			<span
				aria-hidden
				className="flex size-6 items-center justify-center gap-1 rounded-full border border-border/60"
				style={{
					background: `linear-gradient(90deg, ${light.background} 50%, ${dark.background} 50%)`,
				}}
			>
				<span
					className="size-2 rounded-full"
					style={{ background: light.accent }}
				/>
				<span
					className="size-2 rounded-full"
					style={{ background: dark.accent }}
				/>
			</span>
			{preset.label}
		</button>
	);
}

/**
 * The vault's palette editor: six colours per mode, previewed live on this
 * page, then published for every visitor (app/api/colors/route.ts).
 */
export function VaultSiteColors() {
	const [published, setPublished] = useState<SiteColors | null>(null);
	const [draft, setDraft] = useState<SiteColors>(DEFAULT_COLORS);
	const [status, setStatus] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		const load = async () => {
			try {
				const response = await fetch("/api/colors", { cache: "no-store" });
				const body = (await response.json()) as { colors?: unknown };
				const colors = normalizeColors(body.colors);
				setPublished(colors);
				setDraft(colors);
			} catch {
				setPublished(DEFAULT_COLORS);
				setStatus("couldn't load the published colours; showing sage");
			}
		};
		load();
	}, []);

	// preview while editing; leaving the vault puts the published palette back
	useEffect(() => {
		if (published) {
			previewColors(draft);
		}
	}, [draft, published]);
	useEffect(
		() => () => {
			if (published) {
				previewColors(published);
			}
		},
		[published]
	);

	const onChange = useCallback((mode: Mode, key: ColorKey, value: string) => {
		setStatus(null);
		setDraft((current) => ({
			...current,
			[mode]: { ...current[mode], [key]: value },
		}));
	}, []);

	// a preset only fills the editor; nothing changes for visitors until publish
	const selectPreset = useCallback((id: string) => {
		const preset = COLOR_PRESETS.find((item) => item.id === id);
		if (preset) {
			setStatus(null);
			setDraft(preset.colors);
		}
	}, []);

	const discard = useCallback(() => {
		if (published) {
			setDraft(published);
		}
	}, [published]);

	const publish = useCallback(async () => {
		setBusy(true);
		setStatus(null);
		try {
			const response = await fetch("/api/colors", {
				body: JSON.stringify({ colors: draft }),
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				method: "PUT",
			});
			if (!response.ok) {
				throw new Error(`publish failed (${response.status})`);
			}
			setPublished(draft);
			setStatus("published. the site uses these colours now.");
		} catch (error) {
			setStatus(error instanceof Error ? error.message : "publish failed");
		} finally {
			setBusy(false);
		}
	}, [draft]);

	const resetToSage = useCallback(async () => {
		setBusy(true);
		setStatus(null);
		try {
			const response = await fetch("/api/colors", {
				credentials: "include",
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error(`reset failed (${response.status})`);
			}
			setPublished(DEFAULT_COLORS);
			setDraft(DEFAULT_COLORS);
			setStatus("back to sage.");
		} catch (error) {
			setStatus(error instanceof Error ? error.message : "reset failed");
		} finally {
			setBusy(false);
		}
	}, []);

	if (!published) {
		return <p className="meta-tag normal-case">loading colours…</p>;
	}

	const changed = !sameColors(draft, published);
	const isDefault = sameColors(published, DEFAULT_COLORS);

	const activePreset = COLOR_PRESETS.find((preset) =>
		sameColors(preset.colors, draft)
	)?.id;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-2.5">
				<p className="meta-tag">presets</p>
				<div className="flex flex-wrap gap-2">
					{COLOR_PRESETS.map((preset) => (
						<PresetButton
							active={preset.id === activePreset}
							key={preset.id}
							onSelect={selectPreset}
							preset={preset}
						/>
					))}
				</div>
			</div>

			<div className="grid gap-6 sm:grid-cols-2">
				{MODES.map((mode) => (
					<fieldset className="flex flex-col gap-2.5" key={mode}>
						<legend className="meta-tag mb-2">{mode}</legend>
						{COLOR_KEYS.map((key) => (
							<ColorRow
								colorKey={key}
								key={key}
								mode={mode}
								onChange={onChange}
								values={draft[mode]}
							/>
						))}
					</fieldset>
				))}
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<button
					className={buttonClass}
					disabled={!changed || busy}
					onClick={publish}
					type="button"
				>
					<Upload aria-hidden className="size-3.5 shrink-0" />
					publish
				</button>
				<button
					className={buttonClass}
					disabled={!changed || busy}
					onClick={discard}
					type="button"
				>
					discard changes
				</button>
				<button
					className={buttonClass}
					disabled={(isDefault && !changed) || busy}
					onClick={resetToSage}
					type="button"
				>
					<RotateCcw aria-hidden className="size-3.5 shrink-0" />
					reset to sage
				</button>
			</div>

			<p aria-live="polite" className="meta-tag min-h-4 normal-case">
				{status ??
					(changed
						? "previewing on this page only. publish to apply it everywhere."
						: "")}
			</p>
		</div>
	);
}
