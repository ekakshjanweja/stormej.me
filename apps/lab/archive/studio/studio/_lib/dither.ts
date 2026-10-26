/* an ordered-dither sweep on a plain 2d canvas: the same bayer pattern the
   paper uses, blown up to chunky cells. a pale edge leads, sage follows.
   the canvas is one pixel per cell and the browser scales it up, so a full
   screen is a few thousand pixels a frame. no webgl, so it never competes
   with the fluid for a context */

/* 8x8 bayer thresholds, 0..63 */
const BAYER = [
	0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
	14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
	51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23,
	61, 29, 53, 21,
];
const LEVELS = 64;
/** how wide the dithered band is, as a share of the sweep */
const SPREAD = 0.55;
/** how far the sage trails the pale edge */
const LAG = 0.2;

export type SweepAxis = "up" | "right";

const packColor = (hex: string) => {
	const r = Number.parseInt(hex.slice(1, 3), 16);
	const g = Number.parseInt(hex.slice(3, 5), 16);
	const b = Number.parseInt(hex.slice(5, 7), 16);
	/* imagedata is rgba in memory; a little-endian uint32 reads it as abgr */
	return 255 * 2 ** 24 + b * 2 ** 16 + g * 2 ** 8 + r;
};

export class DitherSweep {
	private readonly canvas: HTMLCanvasElement;
	private readonly context: CanvasRenderingContext2D;
	private readonly cell: number;
	private readonly axis: SweepAxis;
	private readonly lead: number;
	private readonly body: number;
	private image: ImageData | null = null;
	// biome-ignore lint/correctness/noUnusedPrivateClassMembers: read through destructuring in draw()
	private pixels: Uint32Array | null = null;
	private columns = 0;
	private rows = 0;

	constructor(
		canvas: HTMLCanvasElement,
		options: { axis: SweepAxis; body: string; cell: number; lead: string }
	) {
		const context = canvas.getContext("2d");
		if (!context) {
			throw new Error("no 2d context for the dither sweep");
		}
		this.canvas = canvas;
		this.context = context;
		this.cell = options.cell;
		this.axis = options.axis;
		this.lead = packColor(options.lead);
		this.body = packColor(options.body);
	}

	resize() {
		const columns = Math.max(1, Math.ceil(this.canvas.clientWidth / this.cell));
		const rows = Math.max(1, Math.ceil(this.canvas.clientHeight / this.cell));
		if (columns === this.columns && rows === this.rows && this.image) {
			return;
		}
		this.columns = columns;
		this.rows = rows;
		this.canvas.width = columns;
		this.canvas.height = rows;
		this.image = this.context.createImageData(columns, rows);
		this.pixels = new Uint32Array(this.image.data.buffer);
	}

	/** 0..1 along the sweep: 0 where it starts, 1 where it ends */
	private along(x: number, y: number) {
		if (this.axis === "right") {
			return x / Math.max(1, this.columns - 1);
		}
		/* a slow wave keeps the edge from reading as a ruler */
		const wave = Math.sin(x * 0.09) * 0.025 + Math.sin(x * 0.023 + 1.3) * 0.03;
		const at = 1 - y / Math.max(1, this.rows - 1) + wave;
		return Math.min(1, Math.max(0, at));
	}

	/**
	 * `cover` 0..1 fills the canvas, `clear` 0..1 empties it again from the
	 * same edge, so the colour travels through and out the far side
	 */
	draw(cover: number, clear = 0) {
		const { image, pixels } = this;
		if (!(image && pixels)) {
			return;
		}
		const scale = 1 + LAG;
		const leadIn = Math.min(1, cover * scale);
		const bodyIn = Math.max(0, cover * scale - LAG);
		const bodyOut = Math.min(1, clear * scale);
		const leadOut = Math.max(0, clear * scale - LAG);
		const reach = (progress: number, at: number) =>
			progress * (1 + SPREAD) - at * SPREAD;
		for (let y = 0; y < this.rows; y += 1) {
			for (let x = 0; x < this.columns; x += 1) {
				const threshold = (BAYER[(y % 8) * 8 + (x % 8)] ?? 0) / LEVELS;
				const at = this.along(x, y);
				const hasLead =
					threshold < reach(leadIn, at) && threshold >= reach(leadOut, at);
				const hasBody =
					threshold < reach(bodyIn, at) && threshold >= reach(bodyOut, at);
				let color = 0;
				if (hasBody) {
					color = this.body;
				} else if (hasLead) {
					color = this.lead;
				}
				pixels[y * this.columns + x] = color;
			}
		}
		this.context.putImageData(image, 0, 0);
	}

	clear() {
		this.context.clearRect(0, 0, this.columns, this.rows);
	}
}
