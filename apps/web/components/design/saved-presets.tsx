"use client";

import { Bookmark, Check, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import {
	type ChangeEvent,
	type FormEvent,
	useCallback,
	useEffect,
	useState,
} from "react";
import type { DesignConfig } from "@/lib/design/options";
import { PRESET_NAME_MAX, type SavedPreset } from "@/lib/design/saved-presets";
import { cn } from "@/lib/utils";
import { PreviewFrame } from "./preview-frame";
import type { PresetStorage } from "./use-saved-presets";

export const studioButtonClass =
	"inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[12px] transition-colors hover:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-40";

const inputClass =
	"min-w-0 flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] outline-none focus:border-foreground/40";

/** a second click inside this window confirms a destructive action */
const CONFIRM_WINDOW_MS = 3000;

const savedDate = (iso: string) =>
	new Date(iso)
		.toLocaleString("default", {
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			month: "short",
		})
		.toLowerCase();

export const storageNote = (storage: PresetStorage) =>
	storage === "browser"
		? "saved in this browser only. deploy apps/server to keep presets on every device."
		: "saved next to the published design, so every device sees it.";

/** first click arms it, a second click within a few seconds runs it */
function ConfirmButton({
	children,
	confirmLabel,
	onConfirm,
}: {
	children: React.ReactNode;
	confirmLabel: string;
	onConfirm: () => void;
}) {
	const [armed, setArmed] = useState(false);

	useEffect(() => {
		if (!armed) {
			return;
		}
		const timer = window.setTimeout(() => setArmed(false), CONFIRM_WINDOW_MS);
		return () => window.clearTimeout(timer);
	}, [armed]);

	const click = useCallback(() => {
		if (armed) {
			setArmed(false);
			onConfirm();
			return;
		}
		setArmed(true);
	}, [armed, onConfirm]);
	const disarm = useCallback(() => setArmed(false), []);

	return (
		<button
			className={cn(
				studioButtonClass,
				armed && "border-foreground bg-foreground text-background"
			)}
			onBlur={disarm}
			onClick={click}
			type="button"
		>
			{armed ? confirmLabel : children}
		</button>
	);
}

/** the inline "name this look" row under the studio header */
export function SavePresetForm({
	defaultName,
	onCancel,
	onSave,
	storage,
}: {
	defaultName: string;
	onCancel: () => void;
	onSave: (name: string) => void;
	storage: PresetStorage;
}) {
	const [name, setName] = useState(defaultName);
	const change = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value),
		[]
	);
	const submit = useCallback(
		(event: FormEvent) => {
			event.preventDefault();
			if (name.trim()) {
				onSave(name);
			}
		},
		[name, onSave]
	);

	return (
		<form
			className="mb-5 flex flex-col gap-2 rounded-md border border-border px-3 py-3"
			onSubmit={submit}
		>
			<div className="flex items-center gap-2">
				<Bookmark className="size-3.5 shrink-0 text-muted-foreground" />
				<input
					aria-label="preset name"
					autoFocus
					className={inputClass}
					maxLength={PRESET_NAME_MAX}
					onChange={change}
					placeholder="name this look"
					value={name}
				/>
				<button
					className="inline-flex items-center gap-1.5 rounded-full border border-foreground bg-foreground px-3 py-1.5 text-[12px] text-background transition-opacity hover:opacity-85 disabled:opacity-40"
					disabled={!name.trim()}
					type="submit"
				>
					<Check className="size-3.5" />
					save
				</button>
				<button className={studioButtonClass} onClick={onCancel} type="button">
					<X className="size-3.5" />
					cancel
				</button>
			</div>
			<p className="text-[12px] text-muted-foreground">
				{storageNote(storage)} the look is saved; your hero copy stays yours.
			</p>
		</form>
	);
}

function RenameForm({
	name,
	onCancel,
	onRename,
}: {
	name: string;
	onCancel: () => void;
	onRename: (name: string) => void;
}) {
	const [value, setValue] = useState(name);
	const change = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value),
		[]
	);
	const submit = useCallback(
		(event: FormEvent) => {
			event.preventDefault();
			if (value.trim()) {
				onRename(value);
			}
		},
		[onRename, value]
	);

	return (
		<form
			className="flex min-w-0 flex-1 items-center gap-1.5"
			onSubmit={submit}
		>
			<input
				aria-label="new name"
				autoFocus
				className={inputClass}
				maxLength={PRESET_NAME_MAX}
				onChange={change}
				value={value}
			/>
			<button
				aria-label="save name"
				className={studioButtonClass}
				disabled={!value.trim()}
				type="submit"
			>
				<Check className="size-3.5" />
			</button>
			<button
				aria-label="cancel rename"
				className={studioButtonClass}
				onClick={onCancel}
				type="button"
			>
				<X className="size-3.5" />
			</button>
		</form>
	);
}

function SavedCard({
	isCurrent,
	onLoad,
	onOverwrite,
	onRemove,
	onRename,
	preset,
}: {
	isCurrent: boolean;
	onLoad: (config: DesignConfig) => void;
	onOverwrite: (id: string) => void;
	onRemove: (id: string) => void;
	onRename: (id: string, name: string) => void;
	preset: SavedPreset;
}) {
	const [renaming, setRenaming] = useState(false);
	const load = useCallback(
		() => onLoad(preset.config),
		[onLoad, preset.config]
	);
	const overwrite = useCallback(
		() => onOverwrite(preset.id),
		[onOverwrite, preset.id]
	);
	const remove = useCallback(() => onRemove(preset.id), [onRemove, preset.id]);
	const startRename = useCallback(() => setRenaming(true), []);
	const stopRename = useCallback(() => setRenaming(false), []);
	const rename = useCallback(
		(name: string) => {
			onRename(preset.id, name);
			setRenaming(false);
		},
		[onRename, preset.id]
	);

	return (
		<li className="flex flex-col gap-2">
			<div className="grid grid-cols-2 gap-1.5">
				<PreviewFrame
					className="aspect-[4/5]"
					config={preset.config}
					mode="light"
					path="/"
					title={`${preset.name} light`}
				/>
				<PreviewFrame
					className="aspect-[4/5]"
					config={preset.config}
					mode="dark"
					path="/"
					title={`${preset.name} dark`}
				/>
			</div>
			<div className="flex items-start justify-between gap-3">
				{renaming ? (
					<RenameForm
						name={preset.name}
						onCancel={stopRename}
						onRename={rename}
					/>
				) : (
					<div className="min-w-0">
						<p className="truncate font-medium text-[14px]">
							{preset.name}
							{isCurrent && (
								<span className="ml-2 font-normal text-[11px] text-muted-foreground">
									in the editor
								</span>
							)}
						</p>
						<p className="text-[12px] text-muted-foreground">
							saved {savedDate(preset.savedAt)}
						</p>
					</div>
				)}
				{!renaming && (
					<button className={studioButtonClass} onClick={load} type="button">
						edit this
					</button>
				)}
			</div>
			{!renaming && (
				<div className="flex flex-wrap gap-1.5">
					<ConfirmButton confirmLabel="replace it?" onConfirm={overwrite}>
						<RefreshCw className="size-3.5" />
						update from editor
					</ConfirmButton>
					<button
						className={studioButtonClass}
						onClick={startRename}
						type="button"
					>
						<Pencil className="size-3.5" />
						rename
					</button>
					<ConfirmButton confirmLabel="delete it?" onConfirm={remove}>
						<Trash2 className="size-3.5" />
						delete
					</ConfirmButton>
				</div>
			)}
		</li>
	);
}

export function SavedGallery({
	currentId,
	onLoad,
	onOverwrite,
	onRemove,
	onRename,
	presets,
	storage,
}: {
	/** the saved preset whose look matches the editor, if any */
	currentId: string | undefined;
	onLoad: (config: DesignConfig) => void;
	onOverwrite: (id: string) => void;
	onRemove: (id: string) => void;
	onRename: (id: string, name: string) => void;
	presets: SavedPreset[];
	storage: PresetStorage;
}) {
	if (storage === "loading") {
		return (
			<p className="meta-tag py-16 text-center normal-case">
				fetching saved presets...
			</p>
		);
	}
	if (presets.length === 0) {
		return (
			<div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
				<Bookmark className="size-5 text-muted-foreground" />
				<p className="text-[14px]">nothing saved yet</p>
				<p className="max-w-[44ch] text-[13px] text-muted-foreground">
					build a look in the editor, then hit save preset. it lands here, next
					to the built-in ones.
				</p>
			</div>
		);
	}
	return (
		<>
			<p className="mb-4 text-[12px] text-muted-foreground">
				{storageNote(storage)}
			</p>
			<ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
				{presets.map((preset) => (
					<SavedCard
						isCurrent={preset.id === currentId}
						key={preset.id}
						onLoad={onLoad}
						onOverwrite={onOverwrite}
						onRemove={onRemove}
						onRename={onRename}
						preset={preset}
					/>
				))}
			</ul>
		</>
	);
}
