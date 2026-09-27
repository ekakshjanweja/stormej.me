import { type DesignConfig, normalizeDesign } from "./options";

/** a look saved from the studio, kept next to the published design */
export interface SavedPreset {
	config: DesignConfig;
	id: string;
	name: string;
	/** iso timestamp of the last save */
	savedAt: string;
}

export const PRESET_NAME_MAX = 40;
export const MAX_SAVED_PRESETS = 60;
const RUNS_OF_WHITESPACE = /\s+/g;

export const cleanPresetName = (name: string) =>
	name.replace(RUNS_OF_WHITESPACE, " ").trim().slice(0, PRESET_NAME_MAX);

/** stored json is only trusted after every preset runs through normalizeDesign */
export function normalizeSavedPresets(input: unknown): SavedPreset[] {
	if (!Array.isArray(input)) {
		return [];
	}
	const presets: SavedPreset[] = [];
	for (const item of input.slice(0, MAX_SAVED_PRESETS)) {
		if (!item || typeof item !== "object") {
			continue;
		}
		const source = item as Record<string, unknown>;
		const name =
			typeof source.name === "string" ? cleanPresetName(source.name) : "";
		if (!(name && typeof source.id === "string" && source.id)) {
			continue;
		}
		presets.push({
			config: normalizeDesign(source.config),
			id: source.id,
			name,
			savedAt:
				typeof source.savedAt === "string"
					? source.savedAt
					: new Date(0).toISOString(),
		});
	}
	return presets;
}

export const canSaveMorePresets = (presets: SavedPreset[]) =>
	presets.length < MAX_SAVED_PRESETS;
