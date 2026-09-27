"use client";

import {
	ArrowUpRight,
	Bookmark,
	Dices,
	Monitor,
	Palette,
	RotateCcw,
	RotateCw,
	Smartphone,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
	MOTION_AXES,
	type MotionFeel,
	type MotionSpeed,
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
	sameLook,
	shuffleDesign,
} from "@/lib/design/options";
import type { SavedPreset } from "@/lib/design/saved-presets";
import { MAX_SAVED_PRESETS } from "@/lib/design/saved-presets";
import { cn } from "@/lib/utils";
import {
	ChoiceGroup,
	ColourColumn,
	CopyEditor,
	FeelPicker,
	FontSelect,
	SpeedSlider,
	StudioSection,
	Swatches,
} from "./controls";
import { type PreviewDevice, PreviewFrame } from "./preview-frame";
import {
	SavedGallery,
	SavePresetForm,
	studioButtonClass,
} from "./saved-presets";
import { useSavedPresets } from "./use-saved-presets";

const DRAFT_STORAGE_KEY = "stormej.design-draft";

const PREVIEW_PATHS = ["/", "/work", "/projects", "/blog", "/trove", "/gear"];

const PREVIEW_MODES = [
	{ hint: "light and dark side by side", label: "both", value: "both" },
	{ hint: "light mode only", label: "light", value: "light" },
	{ hint: "dark mode only", label: "dark", value: "dark" },
] as const;

type PreviewMode = (typeof PREVIEW_MODES)[number]["value"];

type Gate = "checking" | "locked" | "missing" | "offline" | "open";

const VIEWS = ["editor", "gallery", "saved"] as const;

type View = (typeof VIEWS)[number];

const isView = (value: string): value is View =>
	(VIEWS as readonly string[]).includes(value);

const PANELS = ["look", "layout", "motion", "copy"] as const;

interface Preset {
	config: DesignConfig;
	description: string;
	id: string;
	/** shown instead of the id; saved presets have names */
	label?: string;
}

/** whatever is published right now, offered next to the built-in presets */
const livePreset = (config: DesignConfig): Preset => ({
	config,
	description: "what the site looks like right now",
	id: "live",
});

const savedAsPreset = (saved: SavedPreset): Preset => ({
	config: saved.config,
	description: "saved by you",
	id: saved.id,
	label: saved.name,
});

const buttonClass = studioButtonClass;

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
	const [device, setDevice] = useState<PreviewDevice>("desktop");
	const [replay, setReplay] = useState(0);
	const [isSaving, setIsSaving] = useState(false);
	const saved = useSavedPresets();
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

	const playAgain = useCallback(() => setReplay((count) => count + 1), []);

	const openSave = useCallback(() => setIsSaving(true), []);
	const closeSave = useCallback(() => setIsSaving(false), []);
	const {
		overwrite: overwritePreset,
		remove: removeSaved,
		rename: renameSaved,
		save: savePreset,
	} = saved;
	const saveDraft = useCallback(
		async (name: string) => {
			const ok = await savePreset(name, draft);
			if (ok) {
				setIsSaving(false);
				setStatus({ text: `saved "${name.trim()}". find it under saved.` });
			}
		},
		[draft, savePreset]
	);
	const saveClicked = useCallback(
		(name: string) => {
			saveDraft(name).catch((error: unknown) =>
				setStatus({ error: true, text: (error as Error).message })
			);
		},
		[saveDraft]
	);
	const overwriteWithDraft = useCallback(
		(id: string) => {
			overwritePreset(id, draft).catch(() => undefined);
		},
		[draft, overwritePreset]
	);
	const renamePreset = useCallback(
		(id: string, name: string) => {
			renameSaved(id, name).catch(() => undefined);
		},
		[renameSaved]
	);
	const removePreset = useCallback(
		(id: string) => {
			removeSaved(id).catch(() => undefined);
		},
		[removeSaved]
	);

	const selectView = useCallback((value: string) => {
		if (isView(value)) {
			setView(value);
		}
	}, []);

	if (gate !== "open") {
		return <StudioGate gate={gate} />;
	}

	const activePreset = matchPreset(draft);
	const live = livePreset(published);
	const savedPresets = saved.presets.map(savedAsPreset);
	const activeSaved = saved.presets.find((preset) =>
		sameLook(preset.config, draft)
	);
	let lookLabel = "custom mix";
	if (activeSaved) {
		lookLabel = `saved: ${activeSaved.name}`;
	} else if (activePreset) {
		lookLabel = `preset: ${activePreset.id}`;
	} else if (sameLook(draft, published)) {
		lookLabel = "preset: live";
	}
	const suggestedName = activeSaved?.name ?? activePreset?.id ?? "";

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
						{lookLabel}
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
						aria-expanded={isSaving}
						className={buttonClass}
						disabled={
							saved.storage === "loading" ||
							saved.presets.length >= MAX_SAVED_PRESETS
						}
						onClick={openSave}
						type="button"
					>
						<Bookmark className="size-3.5" />
						save preset
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

			{isSaving && (
				<SavePresetForm
					defaultName={suggestedName}
					onCancel={closeSave}
					onSave={saveClicked}
					storage={saved.storage}
				/>
			)}

			{(status || saved.error) && (
				<p
					className={cn(
						"mb-5 rounded-md border px-3 py-2 text-[13px]",
						status?.error || saved.error
							? "border-destructive/40 text-destructive"
							: "border-border text-foreground"
					)}
				>
					{saved.error ? `saved presets: ${saved.error}` : status?.text}
				</p>
			)}

			<Tabs onValueChange={selectView} value={view}>
				<TabsList className="mb-5 h-auto rounded-full p-1">
					<TabsTrigger className="rounded-full text-[12px]" value="editor">
						editor
					</TabsTrigger>
					<TabsTrigger className="rounded-full text-[12px]" value="gallery">
						all presets
					</TabsTrigger>
					<TabsTrigger className="rounded-full text-[12px]" value="saved">
						saved
						{saved.presets.length > 0 && (
							<span className="ml-1.5 text-muted-foreground tabular-nums">
								{saved.presets.length}
							</span>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent className="mt-0" value="editor">
					<div className="grid gap-8 lg:grid-cols-[23rem_minmax(0,1fr)]">
						<aside className="custom-scrollbar flex flex-col gap-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-3">
							<StudioControls
								draft={draft}
								live={live}
								onAxis={setAxis}
								onColour={editColour}
								onPreset={loadPreset}
								onReplay={playAgain}
								onUpdate={update}
								saved={savedPresets}
							/>
						</aside>
						<PreviewPane
							device={device}
							draft={draft}
							mode={previewMode}
							onDevice={setDevice}
							onMode={setPreviewMode}
							onPath={setPreviewPath}
							onReplay={playAgain}
							path={previewPath}
							replay={replay}
						/>
					</div>
				</TabsContent>

				{/* radix only mounts the active panel, so the galleries' many
				    preview frames load when their tab opens */}
				<TabsContent className="mt-0" value="gallery">
					<PresetGallery live={live} onPick={loadFromGallery} />
				</TabsContent>

				<TabsContent className="mt-0" value="saved">
					<SavedGallery
						currentId={activeSaved?.id}
						onLoad={loadFromGallery}
						onOverwrite={overwriteWithDraft}
						onRemove={removePreset}
						onRename={renamePreset}
						presets={saved.presets}
						storage={saved.storage}
					/>
				</TabsContent>
			</Tabs>
		</div>
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
	live,
	onAxis,
	onColour,
	onPreset,
	onReplay,
	onUpdate,
	saved,
}: {
	draft: DesignConfig;
	live: Preset;
	onAxis: (key: StructureKey, value: string) => void;
	onColour: (
		mode: keyof PaletteModes,
		token: keyof PaletteTokens,
		value: string
	) => void;
	onPreset: (config: DesignConfig) => void;
	onReplay: () => void;
	onUpdate: (patch: Partial<DesignConfig>) => void;
	saved: Preset[];
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
	const setFeel = useCallback(
		(motion: MotionFeel) => onUpdate({ motion }),
		[onUpdate]
	);
	const setSpeed = useCallback(
		(speed: MotionSpeed) => onUpdate({ speed }),
		[onUpdate]
	);

	return (
		<Tabs defaultValue="look">
			<TabsList className="sticky top-0 z-10 grid h-auto w-full grid-cols-4 p-1">
				{PANELS.map((panel) => (
					<TabsTrigger className="text-[12px]" key={panel} value={panel}>
						{panel}
					</TabsTrigger>
				))}
			</TabsList>

			<TabsContent className="mt-5 flex flex-col gap-5" value="look">
				<StudioSection title="presets">
					{saved.length > 0 && (
						<>
							<p className="mb-1.5 text-[11px] text-muted-foreground uppercase tracking-[0.08em]">
								saved
							</p>
							<div className="mb-3 grid grid-cols-2 gap-1.5">
								{saved.map((preset) => (
									<PresetButton
										active={sameLook(draft, preset.config)}
										key={preset.id}
										onPick={onPreset}
										preset={preset}
									/>
								))}
							</div>
							<p className="mb-1.5 text-[11px] text-muted-foreground uppercase tracking-[0.08em]">
								built in
							</p>
						</>
					)}
					<div className="grid grid-cols-2 gap-1.5">
						<PresetButton
							active={sameLook(draft, live.config)}
							onPick={onPreset}
							preset={live}
						/>
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
						<ColourColumn
							mode="light"
							onChange={onColour}
							tokens={modes.light}
						/>
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
						<FontSelect
							label="body"
							onChange={setBody}
							value={draft.fontBody}
						/>
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
			</TabsContent>

			<TabsContent className="mt-5" value="layout">
				<StudioSection title="structure">
					{draft.layout === "sidebar" && (
						<p className="mb-3 text-[12px] text-muted-foreground">
							the sidebar layout brings its own rail on wide screens, so the
							navbar choice only shows on smaller ones.
						</p>
					)}
					{(draft.nav === "dock" ||
						draft.nav === "corner" ||
						draft.nav === "magnify") && (
						<p className="mb-3 text-[12px] text-muted-foreground">
							the {draft.nav} navbar pins itself, so navbar scroll does not
							change it.
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
			</TabsContent>

			<TabsContent className="mt-5" value="motion">
				<StudioSection
					action={
						<button className={buttonClass} onClick={onReplay} type="button">
							<RotateCw className="size-3.5" />
							replay
						</button>
					}
					title="motion"
				>
					<FeelPicker
						onChange={setFeel}
						speed={draft.speed}
						value={draft.motion}
					/>
					<SpeedSlider
						disabled={draft.motion === "off"}
						onChange={setSpeed}
						value={draft.speed}
					/>
					{draft.motion === "off" && (
						<p className="mb-4 text-[12px] text-muted-foreground">
							motion is off: entrances, scroll reveals, the headline effect and
							the cursor sit still, and backgrounds freeze.
						</p>
					)}
					{MOTION_AXES.map((axis) => (
						<AxisChoice
							axis={axis}
							key={axis.key}
							onAxis={onAxis}
							value={draft[axis.key]}
						/>
					))}
					<p className="mt-4 text-[12px] text-muted-foreground">
						visitors who ask their system for reduced motion always get the
						still version.
					</p>
				</StudioSection>
			</TabsContent>

			<TabsContent className="mt-5" value="copy">
				<StudioSection
					action={
						<span className="text-[11px] text-muted-foreground">
							homepage intro
						</span>
					}
					title="hero copy"
				>
					<CopyEditor
						copy={draft.copy}
						live={live.config.copy}
						onChange={setCopy}
					/>
				</StudioSection>
			</TabsContent>
		</Tabs>
	);
}

function AxisChoice({
	axis,
	value,
	onAxis,
}: {
	axis: (typeof STRUCTURE_AXES)[number] | (typeof MOTION_AXES)[number];
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
	preset: Preset;
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
				<span className="block truncate font-medium text-[12px]">
					{preset.label ?? preset.id}
				</span>
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

const DEVICES = [
	{ icon: Monitor, label: "desktop", value: "desktop" },
	{ icon: Smartphone, label: "mobile", value: "mobile" },
] as const;

function DeviceButton({
	current,
	device,
	onDevice,
}: {
	current: PreviewDevice;
	device: (typeof DEVICES)[number];
	onDevice: (device: PreviewDevice) => void;
}) {
	const pick = useCallback(() => onDevice(device.value), [device, onDevice]);
	const Icon = device.icon;
	return (
		<button
			aria-label={`${device.label} preview`}
			aria-pressed={current === device.value}
			className={cn(
				"inline-flex size-7 items-center justify-center rounded-full transition-colors",
				current === device.value
					? "bg-foreground text-background"
					: "text-muted-foreground hover:text-foreground"
			)}
			onClick={pick}
			title={`${device.label} preview`}
			type="button"
		>
			<Icon className="size-3.5" />
		</button>
	);
}

function PreviewPane({
	device,
	draft,
	mode,
	path,
	replay,
	onDevice,
	onMode,
	onPath,
	onReplay,
}: {
	device: PreviewDevice;
	draft: DesignConfig;
	mode: PreviewMode;
	onDevice: (device: PreviewDevice) => void;
	onMode: (mode: PreviewMode) => void;
	onPath: (path: string) => void;
	onReplay: () => void;
	path: string;
	replay: number;
}) {
	const onPathChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => onPath(event.target.value),
		[onPath]
	);
	const frames = mode === "both" ? (["light", "dark"] as const) : [mode];
	const isMobile = device === "mobile";

	return (
		<div className="min-w-0">
			<div className="mb-3 flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-3">
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
					<div className="flex items-center gap-0.5 rounded-full border border-border p-0.5">
						{DEVICES.map((item) => (
							<DeviceButton
								current={device}
								device={item}
								key={item.value}
								onDevice={onDevice}
							/>
						))}
					</div>
					<button className={buttonClass} onClick={onReplay} type="button">
						<RotateCw className="size-3.5" />
						replay
					</button>
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
					mode === "both" && (isMobile ? "grid-cols-2" : "2xl:grid-cols-2"),
					mode !== "both" && "grid-cols-1"
				)}
			>
				{frames.map((frameMode) => (
					<div
						className={cn(isMobile && "mx-auto w-full max-w-[24rem]")}
						key={frameMode}
					>
						<p className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase tracking-[0.08em]">
							<Sparkles className="size-3" />
							{frameMode}
						</p>
						<PreviewFrame
							className={isMobile ? "aspect-[9/18]" : "aspect-[16/10]"}
							config={draft}
							device={device}
							mode={frameMode}
							path={path}
							replay={replay}
							title={`${frameMode} preview`}
						/>
					</div>
				))}
			</div>
		</div>
	);
}

function PresetGallery({
	live,
	onPick,
}: {
	live: Preset;
	onPick: (config: DesignConfig) => void;
}) {
	return (
		<ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
			<GalleryCard onPick={onPick} preset={live} />
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
	preset: Preset;
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
