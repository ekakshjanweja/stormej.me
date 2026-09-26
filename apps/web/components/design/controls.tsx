"use client";

import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import {
	COPY_FIELDS,
	COPY_OPTIONS,
	FONTS,
	type FontId,
	type HeroCopy,
	isHexColor,
	matchCopyOption,
	PALETTE_TOKEN_KEYS,
	PALETTE_TOKEN_LABELS,
	type PaletteModes,
	type PaletteTokens,
} from "@/lib/design/options";
import { cn } from "@/lib/utils";

export function StudioSection({
	children,
	title,
	action,
}: {
	action?: React.ReactNode;
	children: React.ReactNode;
	title: string;
}) {
	return (
		<section className="border-border border-t pt-5 first:border-t-0 first:pt-0">
			<div className="mb-3 flex items-baseline justify-between gap-3">
				<h2 className="font-medium text-[13px] text-foreground">{title}</h2>
				{action}
			</div>
			{children}
		</section>
	);
}

interface Choice<V extends string> {
	hint: string;
	label: string;
	value: V;
}

export function ChoiceGroup<V extends string>({
	label,
	name,
	options,
	value,
	onChange,
}: {
	label: string;
	name: string;
	onChange: (value: V) => void;
	options: readonly Choice<V>[];
	value: V | undefined;
}) {
	const selected = options.find((option) => option.value === value);

	return (
		<fieldset className="mb-4 last:mb-0">
			<legend className="mb-1.5 flex w-full items-baseline justify-between gap-2 text-[11px] uppercase tracking-[0.08em]">
				<span className="text-muted-foreground">{label}</span>
				<span className="truncate text-muted-foreground/70 normal-case tracking-normal">
					{selected?.hint}
				</span>
			</legend>
			<div className="flex flex-wrap gap-1">
				{options.map((option) => (
					<ChoiceChip
						checked={option.value === value}
						key={option.value}
						name={name}
						onChange={onChange}
						option={option}
					/>
				))}
			</div>
		</fieldset>
	);
}

function ChoiceChip<V extends string>({
	checked,
	name,
	option,
	onChange,
}: {
	checked: boolean;
	name: string;
	onChange: (value: V) => void;
	option: Choice<V>;
}) {
	const handleChange = useCallback(
		() => onChange(option.value),
		[onChange, option.value]
	);

	return (
		<label
			className={cn(
				"cursor-pointer rounded-full border px-2.5 py-1 text-[12px] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
				checked
					? "border-foreground bg-foreground text-background"
					: "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
			)}
			title={option.hint}
		>
			<input
				checked={checked}
				className="sr-only"
				name={name}
				onChange={handleChange}
				type="radio"
				value={option.value}
			/>
			{option.label}
		</label>
	);
}

const FONT_GROUPS = [
	{ label: "serif", match: "serif" },
	{ label: "sans", match: "sans-serif" },
	{ label: "mono", match: "monospace" },
] as const;

const fontGroup = (fallback: string) =>
	FONT_GROUPS.find((group) => fallback.endsWith(group.match))?.label ?? "sans";

export function FontSelect({
	label,
	value,
	onChange,
}: {
	label: string;
	onChange: (value: FontId) => void;
	value: FontId;
}) {
	const handleChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) =>
			onChange(event.target.value as FontId),
		[onChange]
	);

	return (
		<label className="flex items-center justify-between gap-3 text-[12px]">
			<span className="text-muted-foreground">{label}</span>
			<select
				className="w-44 rounded-md border border-border bg-background px-2 py-1.5 text-[12px] outline-none focus:border-foreground/40"
				onChange={handleChange}
				value={value}
			>
				{FONT_GROUPS.map((group) => (
					<optgroup key={group.label} label={group.label}>
						{FONTS.filter(
							(font) => fontGroup(font.fallback) === group.label
						).map((font) => (
							<option key={font.id} value={font.id}>
								{font.label}
							</option>
						))}
					</optgroup>
				))}
			</select>
		</label>
	);
}

export function Swatches({ modes }: { modes: PaletteModes }) {
	return (
		<span
			aria-hidden
			className="flex overflow-hidden rounded-sm border border-border"
		>
			{[modes.light, modes.dark].map((tokens, index) => (
				<span
					className="flex h-4 w-5 items-center justify-center"
					// biome-ignore lint/suspicious/noArrayIndexKey: always exactly light then dark
					key={index}
					style={{ background: tokens.background }}
				>
					<span
						className="size-2 rounded-full"
						style={{ background: tokens.accent }}
					/>
				</span>
			))}
		</span>
	);
}

function HexInput({
	value,
	onCommit,
}: {
	onCommit: (value: string) => void;
	value: string;
}) {
	const [text, setText] = useState(value);

	useEffect(() => {
		setText(value);
	}, [value]);

	const onChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const next = event.target.value.trim();
			setText(next);
			const hex = next.startsWith("#") ? next : `#${next}`;
			if (isHexColor(hex)) {
				onCommit(hex.toLowerCase());
			}
		},
		[onCommit]
	);

	return (
		<input
			aria-label="hex colour"
			className="w-[4.75rem] rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] outline-none focus:border-foreground/40"
			onChange={onChange}
			spellCheck={false}
			value={text}
		/>
	);
}

function TokenRow({
	token,
	value,
	onChange,
}: {
	onChange: (token: keyof PaletteTokens, value: string) => void;
	token: keyof PaletteTokens;
	value: string;
}) {
	const commit = useCallback(
		(next: string) => onChange(token, next),
		[onChange, token]
	);
	const onPick = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => commit(event.target.value),
		[commit]
	);

	return (
		<div className="flex items-center gap-2 text-[12px]">
			<input
				aria-label={PALETTE_TOKEN_LABELS[token]}
				className="size-6 shrink-0 cursor-pointer rounded border border-border bg-transparent p-0"
				onChange={onPick}
				type="color"
				value={value}
			/>
			<span className="min-w-0 flex-1 truncate text-muted-foreground">
				{PALETTE_TOKEN_LABELS[token]}
			</span>
			<HexInput onCommit={commit} value={value} />
		</div>
	);
}

export function ColourColumn({
	mode,
	tokens,
	onChange,
}: {
	mode: keyof PaletteModes;
	onChange: (
		mode: keyof PaletteModes,
		token: keyof PaletteTokens,
		value: string
	) => void;
	tokens: PaletteTokens;
}) {
	const change = useCallback(
		(token: keyof PaletteTokens, value: string) => onChange(mode, token, value),
		[mode, onChange]
	);

	return (
		<div className="flex flex-col gap-1.5">
			<p className="text-[11px] text-muted-foreground uppercase tracking-[0.08em]">
				{mode}
			</p>
			{PALETTE_TOKEN_KEYS.map((token) => (
				<TokenRow
					key={token}
					onChange={change}
					token={token}
					value={tokens[token]}
				/>
			))}
		</div>
	);
}

const COPY_CHOICES = COPY_OPTIONS.map((option) => ({
	hint: option.hint,
	label: option.id,
	value: option.id,
}));

const fieldClass =
	"w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] leading-snug outline-none focus:border-foreground/40";

function CopyField({
	field,
	value,
	onChange,
}: {
	field: (typeof COPY_FIELDS)[number];
	onChange: (key: keyof HeroCopy, value: string) => void;
	value: string;
}) {
	const handleChange = useCallback(
		(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
			onChange(field.key, event.target.value),
		[field.key, onChange]
	);
	const id = `design-copy-${field.key}`;

	return (
		<div className="flex flex-col gap-1">
			<div className="flex items-baseline justify-between gap-2 text-[11px] uppercase tracking-[0.08em]">
				<label className="text-muted-foreground" htmlFor={id}>
					{field.label}
				</label>
				<span className="text-muted-foreground/70 tabular-nums tracking-normal">
					{value.length}/{field.max}
				</span>
			</div>
			{field.multiline ? (
				<textarea
					className={cn(fieldClass, "resize-y")}
					id={id}
					maxLength={field.max}
					onChange={handleChange}
					rows={3}
					value={value}
				/>
			) : (
				<input
					className={fieldClass}
					id={id}
					maxLength={field.max}
					onChange={handleChange}
					type="text"
					value={value}
				/>
			)}
		</div>
	);
}

/** pick a written option as a starting point, then edit any line by hand */
export function CopyEditor({
	copy,
	onChange,
}: {
	copy: HeroCopy;
	onChange: (copy: HeroCopy) => void;
}) {
	const pickOption = useCallback(
		(id: string) => {
			const option = COPY_OPTIONS.find((item) => item.id === id);
			if (option) {
				onChange(option.copy);
			}
		},
		[onChange]
	);
	const editField = useCallback(
		(key: keyof HeroCopy, value: string) => onChange({ ...copy, [key]: value }),
		[copy, onChange]
	);

	return (
		<>
			<ChoiceGroup
				label="start from"
				name="design-copy"
				onChange={pickOption}
				options={COPY_CHOICES}
				value={matchCopyOption(copy)?.id}
			/>
			<div className="flex flex-col gap-3">
				{COPY_FIELDS.map((field) => (
					<CopyField
						field={field}
						key={field.key}
						onChange={editField}
						value={copy[field.key]}
					/>
				))}
			</div>
			<p className="mt-3 text-[12px] text-muted-foreground">
				leave the eyebrow or subline empty to hide them. the button label is
				shared with the centred navbar.
			</p>
		</>
	);
}
