"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DesignConfig } from "@/lib/design/options";
import {
	cleanPresetName,
	MAX_SAVED_PRESETS,
	normalizeSavedPresets,
	type SavedPreset,
} from "@/lib/design/saved-presets";

const PRESETS_ENDPOINT = "/admin/design/presets";
const LOCAL_STORAGE_KEY = "stormej.design-presets";

/**
 * "worker" keeps presets next to the published design so every device sees
 * them. A worker from before saved presets answers 404; then they live in
 * this browser until it is redeployed.
 */
export type PresetStorage = "browser" | "loading" | "worker";

const ID_RADIX = 36;

/** crypto.randomUUID only exists on secure origins; ids just need to be unique here */
const newPresetId = () =>
	`${Date.now().toString(ID_RADIX)}-${Math.random().toString(ID_RADIX).slice(2, 10)}`;

const readError = async (response: Response) => {
	const text = await response.text();
	try {
		return (JSON.parse(text) as { error?: string }).error ?? text;
	} catch {
		return text;
	}
};

function readLocal() {
	try {
		return normalizeSavedPresets(
			JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? "[]")
		);
	} catch {
		return [];
	}
}

export function useSavedPresets() {
	const [presets, setPresets] = useState<SavedPreset[]>([]);
	const [storage, setStorage] = useState<PresetStorage>("loading");
	const [error, setError] = useState<string | null>(null);
	// writes build on the latest list, not the one a callback closed over
	const latest = useRef<SavedPreset[]>([]);

	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			const response = await fetch(PRESETS_ENDPOINT, {
				credentials: "include",
			});
			if (cancelled) {
				return;
			}
			if (response.status === 404) {
				latest.current = readLocal();
				setPresets(latest.current);
				setStorage("browser");
				return;
			}
			if (!response.ok) {
				setError(await readError(response));
				return;
			}
			const body = (await response.json()) as { presets?: unknown };
			latest.current = normalizeSavedPresets(body.presets);
			setPresets(latest.current);
			setStorage("worker");
		};
		load().catch((reason: unknown) => {
			if (!cancelled) {
				setError((reason as Error).message);
			}
		});
		return () => {
			cancelled = true;
		};
	}, []);

	const persist = useCallback(
		async (next: SavedPreset[]) => {
			const previous = latest.current;
			latest.current = next;
			setPresets(next);
			setError(null);
			try {
				if (storage === "browser") {
					localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
					return true;
				}
				const response = await fetch(PRESETS_ENDPOINT, {
					body: JSON.stringify({ presets: next }),
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					method: "PUT",
				});
				if (response.ok) {
					return true;
				}
				setError(await readError(response));
			} catch (reason) {
				setError((reason as Error).message);
			}
			// put the list back the way the server still has it
			latest.current = previous;
			setPresets(previous);
			return false;
		},
		[storage]
	);

	const save = useCallback(
		(name: string, config: DesignConfig) => {
			if (latest.current.length >= MAX_SAVED_PRESETS) {
				setError(
					`you can save up to ${MAX_SAVED_PRESETS} presets. delete one to make room.`
				);
				return Promise.resolve(false);
			}
			return persist([
				{
					config,
					id: newPresetId(),
					name: cleanPresetName(name),
					savedAt: new Date().toISOString(),
				},
				...latest.current,
			]);
		},
		[persist]
	);

	const overwrite = useCallback(
		(id: string, config: DesignConfig) =>
			persist(
				latest.current.map((preset) =>
					preset.id === id
						? { ...preset, config, savedAt: new Date().toISOString() }
						: preset
				)
			),
		[persist]
	);

	const rename = useCallback(
		(id: string, name: string) =>
			persist(
				latest.current.map((preset) =>
					preset.id === id ? { ...preset, name: cleanPresetName(name) } : preset
				)
			),
		[persist]
	);

	const remove = useCallback(
		(id: string) =>
			persist(latest.current.filter((preset) => preset.id !== id)),
		[persist]
	);

	return { error, overwrite, presets, remove, rename, save, storage };
}
