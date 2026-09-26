"use client";

import {
	ArrowUpRight,
	Dices,
	Palette,
	RotateCcw,
	Sparkles,
	Undo2,
	Upload,
} from "lucide-react";
import Link from "next/link";
import {
	type ChangeEvent,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	applyFontPairing,
	applyPreset,
	DEFAULT_DESIGN,
	DESIGN_PRESETS,
	type DesignConfig,
	designKey,
	FONT_PAIRINGS,
	type FontId,
	type HeroCopy,
	LEDE_FONTS,
	matchFontPairing,
	matchPreset,
	normalizeDesign,
	PALETTES,
	type PaletteModes,
	type PaletteTokens,
	paletteModes,
	randomPalette,
	STRUCTURE_AXES,
	type StructureKey,
	shuffleDesign,
} from "@/lib/design/options";
import { cn } from "@/lib/utils";
import {
	ChoiceGroup,
	ColourColumn,
	CopyEditor,
	FontSelect,
	StudioSection,
	Swatches,
} from "./controls";
import { PreviewFrame } from "./preview-frame";

const DRAFT_STORAGE_KEY = "stormej.design-draft";

const PREVIEW_PATHS = ["/", "/work", "/projects", "/blog", "/trove", "/gear"];

const PREVIEW_MODES = [
	{ hint: "light and dark side by side", label: "both", value: "both" },
	{ hint: "light mode only", label: "light", value: "light" },
	{ hint: "dark mode only", label: "dark", value: "dark" },
] as const;

type PreviewMode = (typeof PREVIEW_MODES)[number]["value"];

type Gate = "checking" | "locked" | "missing" | "offline" | "open";

type View = "editor" | "gallery";

const buttonClass =
	"inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[12px] transition-colors hover:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-40";

const readError = async (response: Response) => {
	const text = await response.text();
	try {
		return (JSON.parse(text) as { error?: string }).error ?? text;
	} catch {
		return text;
	}
};

function loadDraft(published: DesignConfig) {
	try {
		const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
		return stored ? normalizeDesign(JSON.parse(stored)) : published;
	} catch {
		return published;
	}
}

export function DesignStudio() {
	const [gate, setGate] = useState<Gate>("checking");
	const [published, setPublished] = useState<DesignConfig>(DEFAULT_DESIGN);
	const [draft, setDraft] = useState<DesignConfig>(DEFAULT_DESIGN);
	const [view, setView] = useState<View>("editor");
	const [previewMode, setPreviewMode] = useState<PreviewMode>("both");
	const [previewPath, setPreviewPath] = useState("/");
	const [status, setStatus] = useState<{
		error?: boolean;
		text: string;
	} | null>(null);
	const [isPublishing, setIsPublishing] = useState(false);

	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			const response = await fetch("/admin/design", { credentials: "include" });
			if (cancelled) {
				return;
			}
			if (response.status === 401) {
				setGate("locked");
				return;
			}
			if (response.status === 404) {
				setGate("missing");
				return;
			}
			if (!response.ok) {
				setGate("offline");
				return;
			}
			const body = (await response.json()) as { design?: unknown };
			const current = body.design
				? normalizeDesign(body.design)
				: DEFAULT_DESIGN;
			setPublished(current);
			setDraft(loadDraft(current));
			setGate("open");
		};
		load().catch(() => {
			if (!cancelled) {
				setGate("offline");
			}
		});
		return () => {
			cancelled = true;
		};
	}, []);

	const isDirty = designKey(draft) !== designKey(published);

	// keep unpublished work across reloads
	useEffect(() => {
		if (gate !== "open") {
			return;
		}
		if (isDirty) {
			localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
		} else {
			localStorage.removeItem(DRAFT_STORAGE_KEY);
		}
	}, [draft, gate, isDirty]);

	const update = useCallback((patch: Partial<DesignConfig>) => {
		setDraft((current) => ({ ...current, ...patch }));
		setStatus(null);
	}, []);

	const setAxis = useCallback(
		(key: StructureKey, value: string) =>
			update({ [key]: value } as Partial<DesignConfig>),
		[update]
	);

	const editColour = useCallback(
		(mode: keyof PaletteModes, token: keyof PaletteTokens, value: string) => {
			setDraft((current) => {
				// editing a built-in palette forks it into the custom slot
				const base = paletteModes(current);
				return {
					...current,
					custom: { ...base, [mode]: { ...base[mode], [token]: value } },
					palette: "custom",
				};
			});
			setStatus(null);
		},
		[]
	);

	const shuffle = useCallback(() => {
		setDraft((current) => shuffleDesign(current.copy));
		setStatus({ text: "shuffled. keep going until something clicks." });
	}, []);

	const shuffleColours = useCallback(
		() => update({ custom: randomPalette(), palette: "custom" }),
		[update]
	);

	const revert = useCallback(() => {
		setDraft(published);
		setStatus({ text: "back to what is live." });
	}, [published]);

	const resetToOriginal = useCallback(() => {
		setDraft((current) => applyPreset(current, DEFAULT_DESIGN));
		setStatus({
			text: "loaded the original look (your copy stayed). publish to restore it.",
		});
	}, []);

	const publish = useCallback(async () => {
		setIsPublishing(true);
		setStatus(null);
		try {
			const response = await fetch("/api/design", {
				body: JSON.stringify({ design: draft }),
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				method: "PUT",
			});
			if (!response.ok) {
				setStatus({ error: true, text: await readError(response) });
				return;
			}
			setPublished(draft);
			setStatus({
				text: "published. the site now looks like this for everyone.",
			});
		} catch (error) {
			setStatus({ error: true, text: (error as Error).message });
		} finally {
			setIsPublishing(false);
		}
	}, [draft]);

	const loadFromGallery = useCallback((config: DesignConfig) => {
		setDraft((current) => applyPreset(current, config));
		setView("editor");
		setStatus({ text: "loaded into the editor. tweak away, then publish." });
	}, []);

	const loadPreset = useCallback((config: DesignConfig) => {
		setDraft((current) => applyPreset(current, config));
		setStatus(null);
	}, []);

	const publishClicked = useCallback(() => {
		publish().catch(() => undefined);
	}, [publish]);

	if (gate !== "open") {
		return <StudioGate gate={gate} />;
	}

	const activePreset = matchPreset(draft);

	return (
		<div className="design-studio relative left-1/2 w-[min(96rem,calc(100vw-3rem))] -translate-x-1/2">
			<header className="mb-6 flex flex-col gap-4 border-border border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<Link className="meta-tag hover-dim normal-case" href="/vault">
						← the vault
					</Link>
					<h1 className="headline mt-2 text-3xl">site design</h1>
					<p className="mt-1 text-[13px] text-muted-foreground">
						{isDirty ? (
							<span className="text-foreground">unpublished changes</span>
						) : (
							"this is what is live"
						)}
						{" · "}
						{activePreset ? `preset: ${activePreset.id}` : "custom mix"}
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<button className={buttonClass} onClick={shuffle} type="button">
						<Dices className="size-3.5" />
						shuffle
					</button>
					<button
						className={buttonClass}
						onClick={shuffleColours}
						type="button"
					>
						<Palette className="size-3.5" />
						random colours
					</button>
					<button
						className={buttonClass}
						disabled={!isDirty}
						onClick={revert}
						type="button"
					>
						<Undo2 className="size-3.5" />
						revert
					</button>
					<button
						className={buttonClass}
						onClick={resetToOriginal}
						type="button"
					>
						<RotateCcw className="size-3.5" />
						original
					</button>
					<button
						className="inline-flex items-center gap-1.5 rounded-full border border-foreground bg-foreground px-4 py-1.5 text-[12px] text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
						disabled={!isDirty || isPublishing}
						onClick={publishClicked}
						type="button"
					>
						<Upload className="size-3.5" />
						{isPublishing ? "publishing..." : "publish"}
					</button>
				</div>
			</header>

			{status && (
				<p
					className={cn(
						"mb-5 rounded-md border px-3 py-2 text-[13px]",
						status.error
							? "border-destructive/40 text-destructive"
							: "border-border text-foreground"
					)}
				>
					{status.text}
				</p>
			)}

			<div className="mb-5 flex flex-wrap items-center gap-2">
				<ViewTab current={view} onSelect={setView} value="editor">
					editor
				</ViewTab>
				<ViewTab current={view} onSelect={setView} value="gallery">
					all presets
				</ViewTab>
			</div>

			{view === "gallery" ? (
				<PresetGallery onPick={loadFromGallery} />
			) : (
				<div className="grid gap-8 lg:grid-cols-[23rem_minmax(0,1fr)]">
					<aside className="custom-scrollbar flex flex-col gap-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-3">
						<StudioControls
							draft={draft}
							onAxis={setAxis}
							onColour={editColour}
							onPreset={loadPreset}
							onUpdate={update}
						/>
					</aside>
					<PreviewPane
						draft={draft}
						mode={previewMode}
						onMode={setPreviewMode}
						onPath={setPreviewPath}
						path={previewPath}
					/>
				</div>
			)}
		</div>
	);
}

function ViewTab({
	children,
	current,
	value,
	onSelect,
}: {
	children: React.ReactNode;
	current: View;
	onSelect: (view: View) => void;
	value: View;
}) {
	const select = useCallback(() => onSelect(value), [onSelect, value]);
	return (
		<button
			aria-pressed={current === value}
			className={cn(
				"rounded-full px-3 py-1 text-[12px] transition-colors",
				current === value
					? "bg-foreground text-background"
					: "text-muted-foreground hover:text-foreground"
			)}
			onClick={select}
			type="button"
		>
			{children}
		</button>
	);
}

function StudioGate({ gate }: { gate: Exclude<Gate, "open"> }) {
	const messages: Record<typeof gate, React.ReactNode> = {
		checking: "checking the locks...",
		locked: (
			<>
				the design studio lives behind the vault.{" "}
				<Link className="underline underline-offset-2" href="/vault">
					unlock it first
				</Link>
				.
			</>
		),
		missing:
			"the worker does not know about designs yet. deploy apps/server (bun run deploy) and reload.",
		offline:
			"could not reach the worker. make sure it is running, then reload.",
	};
	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<p className="meta-tag max-w-[48ch] text-center normal-case">
				{messages[gate]}
			</p>
		</div>
	);
}

function StudioControls({
	draft,
	onAxis,
	onColour,
	onPreset,
	onUpdate,
}: {
	draft: DesignConfig;
	onAxis: (key: StructureKey, value: string) => void;
	onColour: (
		mode: keyof PaletteModes,
		token: keyof PaletteTokens,
		value: string
	) => void;
	onPreset: (config: DesignConfig) => void;
	onUpdate: (patch: Partial<DesignConfig>) => void;
}) {
	const activePreset = matchPreset(draft);
	const pairing = matchFontPairing(draft);
	const modes = paletteModes(draft);

	const pairingOptions = useMemo(
		() =>
			FONT_PAIRINGS.map((item) => ({
				hint: `${item.body} / ${item.display} / ${item.label_font}`,
				label: item.label,
				value: item.id,
			})),
		[]
	);

	const choosePairing = useCallback(
		(id: string) => onUpdate(applyFontPairing(draft, id)),
		[draft, onUpdate]
	);
	const setBody = useCallback(
		(fontBody: FontId) => onUpdate({ fontBody }),
		[onUpdate]
	);
	const setDisplay = useCallback(
		(fontDisplay: FontId) => onUpdate({ fontDisplay }),
		[onUpdate]
	);
	const setLabel = useCallback(
		(fontLabel: FontId) => onUpdate({ fontLabel }),
		[onUpdate]
	);
	const setLede = useCallback(
		(lede: DesignConfig["lede"]) => onUpdate({ lede }),
		[onUpdate]
	);
	const setCopy = useCallback(
		(copy: HeroCopy) => onUpdate({ copy }),
		[onUpdate]
	);

	return (
		<>
			<StudioSection title="presets">
				<div className="grid grid-cols-2 gap-1.5">
					{DESIGN_PRESETS.map((preset) => (
						<PresetButton
							active={activePreset?.id === preset.id}
							key={preset.id}
							onPick={onPreset}
							preset={preset}
						/>
					))}
				</div>
			</StudioSection>

			<StudioSection
				action={
					<span className="text-[11px] text-muted-foreground">
						homepage intro
					</span>
				}
				title="hero copy"
			>
				<CopyEditor copy={draft.copy} onChange={setCopy} />
			</StudioSection>

			<StudioSection title="palette">
				<div className="mb-4 grid grid-cols-3 gap-1.5">
					{PALETTES.map((palette) => (
						<PaletteButton
							active={draft.palette === palette.id}
							id={palette.id}
							key={palette.id}
							label={palette.label}
							modes={palette.modes}
							onPick={onUpdate}
						/>
					))}
					<PaletteButton
						active={draft.palette === "custom"}
						id="custom"
						label="custom"
						modes={draft.custom}
						onPick={onUpdate}
					/>
				</div>
				<p className="mb-3 text-[12px] text-muted-foreground">
					edit any colour below; built-in palettes fork into custom.
				</p>
				<div className="grid grid-cols-2 gap-4">
					<ColourColumn mode="light" onChange={onColour} tokens={modes.light} />
					<ColourColumn mode="dark" onChange={onColour} tokens={modes.dark} />
				</div>
			</StudioSection>

			<StudioSection title="type">
				<ChoiceGroup
					label="pairing"
					name="design-pairing"
					onChange={choosePairing}
					options={pairingOptions}
					value={pairing?.id}
				/>
				<div className="mb-4 flex flex-col gap-2">
					<FontSelect label="body" onChange={setBody} value={draft.fontBody} />
					<FontSelect
						label="display"
						onChange={setDisplay}
						value={draft.fontDisplay}
					/>
					<FontSelect
						label="labels"
						onChange={setLabel}
						value={draft.fontLabel}
					/>
				</div>
				<ChoiceGroup
					label="intro font"
					name="design-lede"
					onChange={setLede}
					options={LEDE_FONTS}
					value={draft.lede}
				/>
			</StudioSection>

			<StudioSection title="structure">
				{draft.layout === "sidebar" && (
					<p className="mb-3 text-[12px] text-muted-foreground">
						the sidebar layout brings its own rail on wide screens, so the
						navbar choice only shows on smaller ones.
					</p>
				)}
				{STRUCTURE_AXES.map((axis) => (
					<AxisChoice
						axis={axis}
						key={axis.key}
						onAxis={onAxis}
						value={draft[axis.key]}
					/>
				))}
			</StudioSection>
		</>
	);
}

function AxisChoice({
	axis,
	value,
	onAxis,
}: {
	axis: (typeof STRUCTURE_AXES)[number];
	onAxis: (key: StructureKey, value: string) => void;
	value: string;
}) {
	const change = useCallback(
		(next: string) => onAxis(axis.key, next),
		[axis.key, onAxis]
	);
	return (
		<ChoiceGroup
			label={axis.label}
			name={`design-${axis.key}`}
			onChange={change}
			options={axis.options}
			value={value}
		/>
	);
}

function PresetButton({
	active,
	preset,
	onPick,
}: {
	active: boolean;
	onPick: (config: DesignConfig) => void;
	preset: (typeof DESIGN_PRESETS)[number];
}) {
	const pick = useCallback(
		() => onPick(preset.config),
		[onPick, preset.config]
	);
	return (
		<button
			aria-pressed={active}
			className={cn(
				"flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left transition-colors",
				active
					? "border-foreground/60 bg-accent"
					: "border-border hover:border-foreground/30"
			)}
			onClick={pick}
			title={preset.description}
			type="button"
		>
			<Swatches modes={paletteModes(preset.config)} />
			<span className="min-w-0">
				<span className="block font-medium text-[12px]">{preset.id}</span>
				<span className="block truncate text-[11px] text-muted-foreground">
					{preset.description}
				</span>
			</span>
		</button>
	);
}

function PaletteButton({
	active,
	id,
	label,
	modes,
	onPick,
}: {
	active: boolean;
	id: DesignConfig["palette"];
	label: string;
	modes: PaletteModes;
	onPick: (patch: Partial<DesignConfig>) => void;
}) {
	const pick = useCallback(() => onPick({ palette: id }), [id, onPick]);
	return (
		<button
			aria-pressed={active}
			className={cn(
				"flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[12px] transition-colors",
				active
					? "border-foreground/60 bg-accent"
					: "border-border hover:border-foreground/30"
			)}
			onClick={pick}
			type="button"
		>
			<Swatches modes={modes} />
			<span className="truncate">{label}</span>
		</button>
	);
}

function PreviewPane({
	draft,
	mode,
	path,
	onMode,
	onPath,
}: {
	draft: DesignConfig;
	mode: PreviewMode;
	onMode: (mode: PreviewMode) => void;
	onPath: (path: string) => void;
	path: string;
}) {
	const onPathChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => onPath(event.target.value),
		[onPath]
	);
	const frames = mode === "both" ? (["light", "dark"] as const) : [mode];

	return (
		<div className="min-w-0">
			<div className="mb-3 flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<label className="flex items-center gap-2 text-[12px] text-muted-foreground">
						page
						<select
							className="rounded-md border border-border bg-background px-2 py-1 text-[12px] text-foreground outline-none"
							onChange={onPathChange}
							value={path}
						>
							{PREVIEW_PATHS.map((item) => (
								<option key={item} value={item}>
									{item}
								</option>
							))}
						</select>
					</label>
					<Link
						className="meta-tag hover-dim inline-flex items-center gap-1 normal-case"
						href={path}
						rel="noopener"
						target="_blank"
					>
						live site
						<ArrowUpRight className="size-3" />
					</Link>
				</div>
				<div className="w-60">
					<ChoiceGroup
						label="preview"
						name="design-preview-mode"
						onChange={onMode}
						options={PREVIEW_MODES}
						value={mode}
					/>
				</div>
			</div>
			<div
				className={cn(
					"grid gap-4",
					mode === "both" ? "2xl:grid-cols-2" : "grid-cols-1"
				)}
			>
				{frames.map((frameMode) => (
					<div key={frameMode}>
						<p className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase tracking-[0.08em]">
							<Sparkles className="size-3" />
							{frameMode}
						</p>
						<PreviewFrame
							className="aspect-[16/10]"
							config={draft}
							mode={frameMode}
							path={path}
							title={`${frameMode} preview`}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

function PresetGallery({ onPick }: { onPick: (config: DesignConfig) => void }) {
	return (
		<ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
			{DESIGN_PRESETS.map((preset) => (
				<GalleryCard key={preset.id} onPick={onPick} preset={preset} />
			))}
		</ul>
	);
}

function GalleryCard({
	preset,
	onPick,
}: {
	onPick: (config: DesignConfig) => void;
	preset: (typeof DESIGN_PRESETS)[number];
}) {
	const pick = useCallback(
		() => onPick(preset.config),
		[onPick, preset.config]
	);
	return (
		<li className="flex flex-col gap-2">
			<div className="grid grid-cols-2 gap-1.5">
				<PreviewFrame
					className="aspect-[4/5]"
					config={preset.config}
					mode="light"
					path="/"
					title={`${preset.id} light`}
				/>
				<PreviewFrame
					className="aspect-[4/5]"
					config={preset.config}
					mode="dark"
					path="/"
					title={`${preset.id} dark`}
				/>
			</div>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="font-medium text-[14px]">{preset.id}</p>
					<p className="text-[12px] text-muted-foreground">
						{preset.description}
					</p>
				</div>
				<button className={buttonClass} onClick={pick} type="button">
					edit this
				</button>
			</div>
		</li>
	);
}
