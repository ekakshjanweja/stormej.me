"use client";

import { Check, Link2, Palette, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
	applyDesign,
	DEFAULT_DESIGN,
	DESIGN_AXES,
	DESIGN_PRESETS,
	DESIGN_STORAGE_KEY,
	type DesignAxis,
	type DesignConfig,
	matchPreset,
	normalizeDesign,
} from "@/lib/design-lab";
import { cn } from "@/lib/utils";

const COPIED_RESET_MS = 1600;

function readCurrentDesign(): DesignConfig {
	return normalizeDesign({ ...document.documentElement.dataset });
}

function shareUrl(config: DesignConfig) {
	const url = new URL(window.location.href);
	url.search = "";
	const preset = matchPreset(config);
	if (preset) {
		url.searchParams.set("preset", preset.id);
		return url.toString();
	}
	for (const axis of DESIGN_AXES) {
		url.searchParams.set(axis.key, config[axis.key]);
	}
	return url.toString();
}

export function DesignLab() {
	const [config, setConfig] = useState<DesignConfig>(DEFAULT_DESIGN);
	const [open, setOpen] = useState(false);
	const [framed, setFramed] = useState(true);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		// the init script has already applied the stored design by now
		setConfig(readCurrentDesign());
		setFramed(window.self !== window.top);
	}, []);

	useEffect(() => {
		if (!open) {
			return;
		}
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [open]);

	const commit = useCallback((next: DesignConfig) => {
		setConfig(next);
		applyDesign(next);
		localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(next));
	}, []);

	const setAxis = useCallback(
		(key: DesignAxis["key"], value: string) =>
			commit(normalizeDesign({ ...config, [key]: value })),
		[commit, config]
	);

	const copyLink = useCallback(async () => {
		await navigator.clipboard.writeText(shareUrl(config));
		setCopied(true);
		setTimeout(() => setCopied(false), COPIED_RESET_MS);
	}, [config]);

	const toggle = useCallback(() => setOpen((prev) => !prev), []);
	const close = useCallback(() => setOpen(false), []);
	const reset = useCallback(() => commit(DEFAULT_DESIGN), [commit]);

	if (framed) {
		return null;
	}

	const activePreset = matchPreset(config);

	return (
		<div className="fixed right-4 bottom-4 z-[60] flex flex-col items-end gap-3">
			{open && (
				<section
					aria-label="Design lab"
					className="custom-scrollbar max-h-[min(640px,calc(100vh-6rem))] w-[min(340px,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg"
					id="design-lab-panel"
				>
					<div className="mb-4 flex items-start justify-between gap-3">
						<div>
							<h2 className="font-medium text-[14px]">design lab</h2>
							<p className="text-[12px] text-muted-foreground">
								mix axes or start from a preset. saved to this browser.
							</p>
						</div>
						<button
							aria-label="Close design lab"
							className="hover-dim -m-1 rounded p-1"
							onClick={close}
							type="button"
						>
							<X className="size-4" />
						</button>
					</div>

					<fieldset className="mb-4">
						<legend className="mb-2 text-[11px] text-muted-foreground uppercase tracking-[0.08em]">
							presets
						</legend>
						<div className="grid grid-cols-2 gap-1.5">
							{DESIGN_PRESETS.map((preset) => (
								<PresetOption
									active={activePreset?.id === preset.id}
									key={preset.id}
									onSelect={commit}
									preset={preset}
								/>
							))}
						</div>
					</fieldset>

					<div className="flex flex-col gap-3.5 border-border border-t pt-4">
						{DESIGN_AXES.map((axis) => (
							<AxisPicker
								axis={axis}
								key={axis.key}
								onChange={setAxis}
								value={config[axis.key]}
							/>
						))}
					</div>

					<div className="mt-4 flex items-center justify-between gap-2 border-border border-t pt-3 text-[12px]">
						<Link
							className="hover-dim underline underline-offset-2"
							href="/design-lab"
							onClick={close}
						>
							compare side by side
						</Link>
						<div className="flex items-center gap-3">
							<button
								className="hover-dim inline-flex items-center gap-1"
								onClick={copyLink}
								type="button"
							>
								{copied ? (
									<Check className="size-3.5" />
								) : (
									<Link2 className="size-3.5" />
								)}
								{copied ? "copied" : "share"}
							</button>
							<button
								className="hover-dim inline-flex items-center gap-1"
								onClick={reset}
								type="button"
							>
								<RotateCcw className="size-3.5" />
								reset
							</button>
						</div>
					</div>
				</section>
			)}

			<button
				aria-controls="design-lab-panel"
				aria-expanded={open}
				className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-popover px-3.5 text-[12px] text-popover-foreground shadow-md transition-transform duration-150 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				onClick={toggle}
				type="button"
			>
				<Palette aria-hidden className="size-3.5" />
				<span>design</span>
				<span className="text-muted-foreground">
					{activePreset?.label ?? "custom"}
				</span>
			</button>
		</div>
	);
}

function PresetOption({
	preset,
	active,
	onSelect,
}: {
	preset: (typeof DESIGN_PRESETS)[number];
	active: boolean;
	onSelect: (config: DesignConfig) => void;
}) {
	const onChange = useCallback(
		() => onSelect(preset.config),
		[onSelect, preset.config]
	);

	return (
		<label
			className={cn(
				"cursor-pointer rounded-md border px-2.5 py-1.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
				active
					? "border-foreground/60 bg-accent"
					: "border-border hover:border-foreground/30"
			)}
			title={preset.description}
		>
			<input
				checked={active}
				className="sr-only"
				name="design-preset"
				onChange={onChange}
				type="radio"
				value={preset.id}
			/>
			<span className="block font-medium text-[12px]">{preset.label}</span>
			<span className="block truncate text-[11px] text-muted-foreground">
				{preset.description}
			</span>
		</label>
	);
}

function AxisPicker({
	axis,
	value,
	onChange,
}: {
	axis: DesignAxis;
	value: string;
	onChange: (key: DesignAxis["key"], value: string) => void;
}) {
	const selected = axis.options.find((option) => option.value === value);

	return (
		<fieldset>
			<legend className="mb-1.5 flex w-full items-baseline justify-between gap-2 text-[11px] uppercase tracking-[0.08em]">
				<span className="text-muted-foreground">{axis.label}</span>
				<span className="truncate text-muted-foreground/70 normal-case tracking-normal">
					{selected?.hint}
				</span>
			</legend>
			<div className="flex flex-wrap gap-1">
				{axis.options.map((option) => (
					<AxisOption
						axisKey={axis.key}
						checked={option.value === value}
						hint={option.hint}
						key={option.value}
						label={option.label}
						onChange={onChange}
						value={option.value}
					/>
				))}
			</div>
		</fieldset>
	);
}

function AxisOption({
	axisKey,
	value,
	label,
	hint,
	checked,
	onChange,
}: {
	axisKey: DesignAxis["key"];
	value: string;
	label: string;
	hint: string;
	checked: boolean;
	onChange: (key: DesignAxis["key"], value: string) => void;
}) {
	const handleChange = useCallback(
		() => onChange(axisKey, value),
		[onChange, axisKey, value]
	);

	return (
		<label
			className={cn(
				"cursor-pointer rounded-full border px-2.5 py-1 text-[12px] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
				checked
					? "border-foreground bg-foreground text-background"
					: "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
			)}
			title={hint}
		>
			<input
				checked={checked}
				className="sr-only"
				name={`design-${axisKey}`}
				onChange={handleChange}
				type="radio"
				value={value}
			/>
			{label}
		</label>
	);
}
