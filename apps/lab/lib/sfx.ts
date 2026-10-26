export type SfxTheme = "orbit" | "strip" | "studio";
export type SfxCue =
	| "tap"
	| "navigate"
	| "open"
	| "close"
	| "success"
	| "scroll"
	| "hover"
	| "grow"
	| "whoosh"
	| "reveal"
	| "pickup"
	| "drop"
	| "tick"
	| "switch"
	| "swatch"
	| "slide"
	| "needle"
	| "pop"
	| "land"
	| "spring"
	| "type"
	| "shutter"
	| "snap"
	| "flash";

export const SFX_STORAGE_KEY = "lab:sfx";
/* effects are only ever on or off, and on is full volume */
export const SFX_VOLUME = 1;

const FLOOR = 0.0001;
const MIN_INTERVAL_MS = 70;
const MAX_DELAY_MS = 200;
const SCROLL_INTERVAL_MS = 600;
/* the same cue again within this long is dropped; different cues layer */
const CUE_INTERVAL_MS: Partial<Record<SfxCue, number>> = {
	grow: 160,
	hover: 90,
	pop: 160,
	slide: 140,
	snap: 90,
	tick: 60,
};
/* cues that come from looking around, not from a decision: they never
   unlock audio on their own, they only play once a click or key has */
const AMBIENT = new Set<SfxCue>([
	"scroll",
	"hover",
	"grow",
	"tick",
	"reveal",
	"slide",
	"pop",
	"land",
	"spring",
	"snap",
]);
const SCROLL_AFTER_ACTION_MS = 250;
const PITCH: Record<SfxTheme, number> = {
	orbit: 1.1,
	strip: 0.9,
	studio: 1,
};

interface Preferences {
	enabled: boolean;
	volume: number;
}

export function readSfxPreferences(): Preferences {
	/* on unless someone has switched it off. a volume saved by an older
	   version, from when it could be turned down, is ignored */
	const fallback = { enabled: true, volume: SFX_VOLUME };
	try {
		const saved: unknown = JSON.parse(
			localStorage.getItem(SFX_STORAGE_KEY) ?? "null"
		);
		if (!saved || typeof saved !== "object") {
			return fallback;
		}
		const enabled = !("enabled" in saved) || saved.enabled === true;
		return { enabled, volume: SFX_VOLUME };
	} catch {
		return fallback;
	}
}

export function saveSfxPreferences(preferences: Preferences): void {
	try {
		localStorage.setItem(SFX_STORAGE_KEY, JSON.stringify(preferences));
	} catch {
		// The control still works when browser storage is unavailable.
	}
}

const audibleMedia = (): boolean =>
	Array.from(document.querySelectorAll<HTMLMediaElement>("audio, video")).some(
		(media) => !(media.paused || media.ended || media.muted) && media.volume > 0
	);

/* One lazy context per layout. No downloads, autoplay, or persistent voices;
   every source disconnects when its short envelope ends. */
class InterfaceAudio {
	private context: AudioContext | null = null;
	private output: GainNode | null = null;
	private noise: AudioBuffer | null = null;
	private readonly voices = new Set<AudioScheduledSourceNode>();
	private enabled: boolean;
	private volume = SFX_VOLUME;
	private pitch = 1;
	private lastPlayed = Number.NEGATIVE_INFINITY;
	private lastScrollPlayed = Number.NEGATIVE_INFINITY;
	private readonly lastByCue = new Map<SfxCue, number>();
	private generation = 0;

	constructor() {
		this.enabled = false;
	}

	configure(preferences: Preferences, theme: SfxTheme): void {
		this.enabled = preferences.enabled;
		this.volume = preferences.volume;
		this.pitch = PITCH[theme];
		this.generation += 1;
		this.syncOutput();
	}

	syncOutput = (): void => {
		if (!(this.context && this.output)) {
			return;
		}
		const level = this.canPlay() ? this.volume : 0;
		if (level === 0) {
			this.stopVoices();
		}
		this.output.gain.setTargetAtTime(level, this.context.currentTime, 0.008);
	};

	private stopVoices(): void {
		for (const voice of this.voices) {
			voice.stop();
		}
		this.voices.clear();
	}

	private canPlay(): boolean {
		return (
			this.enabled &&
			this.volume > 0 &&
			document.visibilityState === "visible" &&
			!audibleMedia()
		);
	}

	private getContext(): AudioContext {
		if (!this.context) {
			const context = new AudioContext({ latencyHint: "interactive" });
			this.context = context;
			this.output = context.createGain();
			this.output.gain.value = this.volume;
			this.output.connect(context.destination);
			this.noise = context.createBuffer(
				1,
				context.sampleRate * 0.8,
				context.sampleRate
			);
			const samples = this.noise.getChannelData(0);
			for (const [index] of samples.entries()) {
				samples[index] = Math.random() * 2 - 1;
			}
		}
		return this.context;
	}

	private tone(
		frequency: number,
		end: number,
		duration: number,
		delay = 0,
		level = 0.24
	): void {
		const { context } = this;
		if (!(context && this.output)) {
			return;
		}
		const at = context.currentTime + delay;
		const voice = context.createOscillator();
		const envelope = context.createGain();
		voice.type = "sine";
		voice.frequency.setValueAtTime(frequency * this.pitch, at);
		voice.frequency.exponentialRampToValueAtTime(
			end * this.pitch,
			at + duration
		);
		envelope.gain.setValueAtTime(FLOOR, at);
		envelope.gain.exponentialRampToValueAtTime(level, at + 0.006);
		envelope.gain.exponentialRampToValueAtTime(FLOOR, at + duration);
		voice.connect(envelope).connect(this.output);
		voice.onended = () => {
			this.voices.delete(voice);
			voice.disconnect();
			envelope.disconnect();
		};
		voice.start(at);
		this.voices.add(voice);
		voice.stop(at + duration + 0.01);
	}

	private brush(
		duration: number,
		frequency: number,
		level: number,
		end = frequency * 0.6,
		attack = 0.002,
		delay = 0
	): void {
		const { context } = this;
		if (!(context && this.output && this.noise)) {
			return;
		}
		const at = context.currentTime + delay;
		const source = context.createBufferSource();
		const filter = context.createBiquadFilter();
		const envelope = context.createGain();
		source.buffer = this.noise;
		filter.type = "bandpass";
		filter.Q.value = 2.5;
		filter.frequency.setValueAtTime(frequency * this.pitch, at);
		filter.frequency.exponentialRampToValueAtTime(
			end * this.pitch,
			at + duration
		);
		envelope.gain.setValueAtTime(FLOOR, at);
		envelope.gain.exponentialRampToValueAtTime(level, at + attack);
		envelope.gain.exponentialRampToValueAtTime(FLOOR, at + duration);
		source.connect(filter).connect(envelope).connect(this.output);
		source.onended = () => {
			this.voices.delete(source);
			source.disconnect();
			filter.disconnect();
			envelope.disconnect();
		};
		source.start(at);
		this.voices.add(source);
		source.stop(at + duration + 0.01);
	}

	async play(cue: SfxCue): Promise<void> {
		const requested = performance.now();
		// Ambient cues never unlock audio or queue up behind a suspended tab.
		if (AMBIENT.has(cue) && this.context?.state !== "running") {
			return;
		}
		if (
			cue === "scroll" &&
			(requested - this.lastScrollPlayed < SCROLL_INTERVAL_MS ||
				requested - this.lastPlayed < SCROLL_AFTER_ACTION_MS)
		) {
			return;
		}
		const gap = CUE_INTERVAL_MS[cue] ?? MIN_INTERVAL_MS;
		if (
			!this.canPlay() ||
			requested - (this.lastByCue.get(cue) ?? Number.NEGATIVE_INFINITY) < gap
		) {
			return;
		}
		const { generation } = this;
		try {
			const context = this.getContext();
			if (context.state === "suspended") {
				await context.resume();
			}
			// A denied/slow unlock must never queue a surprise sound later.
			if (
				context.state !== "running" ||
				generation !== this.generation ||
				performance.now() - requested > MAX_DELAY_MS ||
				!this.canPlay()
			) {
				return;
			}
			this.lastPlayed = performance.now();
			this.lastByCue.set(cue, this.lastPlayed);
			this.syncOutput();
			switch (cue) {
				case "scroll":
					this.lastScrollPlayed = requested;
					this.brush(0.11, 1500, 0.28, 800);
					break;
				case "hover":
					this.brush(0.014, 5200, 0.16);
					break;
				case "grow":
					this.tone(420, 640, 0.16, 0, 0.09);
					break;
				case "whoosh":
					this.brush(0.5, 500, 0.32, 2600, 0.18);
					break;
				case "reveal":
					this.brush(0.45, 2400, 0.22, 600, 0.04);
					break;
				case "pickup":
					this.tone(200, 300, 0.09, 0, 0.3);
					break;
				case "drop":
					this.tone(280, 150, 0.12, 0, 0.26);
					break;
				case "tick":
					this.brush(0.008, 4200, 0.2);
					break;
				case "tap":
					this.brush(0.012, 3600, 0.55);
					break;
				case "navigate":
					this.brush(0.09, 1800, 0.3);
					break;
				case "open":
					this.tone(260, 420, 0.09);
					break;
				case "close":
					this.tone(320, 190, 0.075);
					break;
				case "success":
					this.tone(520, 660, 0.12);
					this.tone(780, 880, 0.15, 0.065);
					break;
				/* a tab changing: two quick blips, the second higher */
				case "switch":
					this.tone(540, 560, 0.05, 0, 0.16);
					this.tone(760, 790, 0.06, 0.045, 0.14);
					break;
				/* a colour or a face chosen: a soft two-note chime */
				case "swatch":
					this.tone(660, 662, 0.2, 0, 0.12);
					this.tone(990, 992, 0.26, 0.06, 0.08);
					break;
				/* a record sliding out of its sleeve: a papery sweep */
				case "slide":
					this.brush(0.2, 900, 0.16, 2400, 0.04);
					break;
				/* the needle going down: a click, a low thump, a little dust */
				case "needle":
					this.brush(0.012, 3000, 0.4);
					this.tone(120, 70, 0.14, 0.01, 0.22);
					this.brush(0.06, 6000, 0.06, 5000, 0.02);
					break;
				/* a card opening beside a face */
				case "pop":
					this.tone(480, 720, 0.07, 0, 0.12);
					break;
				/* something thrown, coming to rest */
				case "land":
					this.tone(170, 110, 0.1, 0, 0.2);
					this.brush(0.03, 900, 0.18);
					break;
				/* something springing back into its place */
				case "spring":
					this.tone(300, 540, 0.1, 0, 0.13);
					this.tone(540, 400, 0.12, 0.09, 0.08);
					break;
				/* a word arriving: a soft keystroke */
				case "type":
					this.brush(0.018, 2600, 0.3);
					this.tone(170, 150, 0.035, 0, 0.07);
					break;
				/* a camera: the blade's click, the body's thump, the clack back */
				case "shutter":
					this.brush(0.01, 4200, 0.5);
					this.tone(95, 70, 0.05, 0, 0.18);
					this.brush(0.022, 2600, 0.4, 1800, 0.002, 0.07);
					break;
				/* the same, lighter and quicker: one frame of a burst */
				case "snap":
					this.brush(0.008, 4600, 0.28);
					this.brush(0.012, 2800, 0.2, 2000, 0.002, 0.04);
					break;
				/* a flash: the charge whining up, then the pop */
				case "flash":
					this.tone(1800, 5200, 0.28, 0, 0.035);
					this.brush(0.12, 7000, 0.32, 2500, 0.004, 0.27);
					this.tone(140, 90, 0.1, 0.27, 0.12);
					break;
				default:
					break;
			}
		} catch {
			// Audio may be unavailable or interrupted; navigation always continues.
		}
	}

	/** wakes the audio on a real gesture, so hovers can be heard after it */
	async unlock(): Promise<void> {
		if (!this.canPlay()) {
			return;
		}
		try {
			const context = this.getContext();
			if (context.state === "suspended") {
				await context.resume();
			}
		} catch {
			// no audio here; everything else carries on
		}
	}

	async dispose(): Promise<void> {
		this.enabled = false;
		this.generation += 1;
		this.stopVoices();
		this.output?.disconnect();
		const { context } = this;
		this.context = null;
		this.output = null;
		this.noise = null;
		this.lastPlayed = Number.NEGATIVE_INFINITY;
		this.lastScrollPlayed = Number.NEGATIVE_INFINITY;
		this.lastByCue.clear();
		if (context && context.state !== "closed") {
			try {
				await context.close();
			} catch {
				// Some browsers close the context themselves during page teardown.
			}
		}
	}
}

export const interfaceAudio = new InterfaceAudio();

/** Pair a cue with its visible interaction; shared settings gate playback. */
export const playSfx = async (cue: SfxCue): Promise<void> => {
	await interfaceAudio.play(cue);
};
