import {
	ADVECTION,
	BASE_VERTEX,
	CLEAR,
	COPY,
	DISPLAY,
	DIVERGENCE,
	GRADIENT_SUBTRACT,
	PRESSURE,
	SPLAT,
} from "./shaders";

/* a small webgl fluid: the sim runs at 128 / 256, the display pass at
   full size. no vorticity (the reference runs it at zero curl) */

const SIM_RESOLUTION = 128;
const DYE_RESOLUTION = 256;
const DENSITY_DISSIPATION = 2.5;
const VELOCITY_DISSIPATION = 0.5;
const PRESSURE_ITERATIONS = 12;
const SPLAT_RADIUS = 0.15;
const SPLAT_FORCE = 1000;
const DYE = 0.15;
/** below this speed (in uv per frame) a splat is weaker and smaller */
const FULL_SPEED = 0.02;

type Rgb = readonly [number, number, number];

export interface FluidPalette {
	accent: Rgb;
	accentPale: Rgb;
	dark: boolean;
	ditherDark: Rgb;
	ditherLight: Rgb;
	text: Rgb;
	/** what text turns into where the dye is thick */
	textTint: Rgb;
}

const channel = (value: string, at: number) =>
	Number.parseInt(value.slice(at, at + 2), 16) / 255;

const hex = (value: string): Rgb => [
	channel(value, 1),
	channel(value, 3),
	channel(value, 5),
];

export const PAPER_PALETTE: FluidPalette = {
	accent: hex("#3d6a4c"),
	accentPale: hex("#dbe8dd"),
	dark: false,
	ditherDark: hex("#dadfd4"),
	ditherLight: hex("#ebede7"),
	text: hex("#1a1d1a"),
	textTint: hex("#3d6a4c"),
};

/* on the dark card the stirred dither goes a deep sage and the words only
   warm to a pale mint, so they never sink into the dye (they used to share
   one mint and the line went faint wherever the cursor had been) */
export const NIGHT_PALETTE: FluidPalette = {
	accent: hex("#4f7d5c"),
	accentPale: hex("#2b3a2f"),
	dark: true,
	ditherDark: hex("#141714"),
	ditherLight: hex("#222722"),
	text: hex("#f1f4f0"),
	textTint: hex("#c9e4d0"),
};

interface Pointer {
	dx: number;
	dy: number;
	moved: boolean;
	speed: number;
	x: number;
	y: number;
}

interface Target {
	attach: (unit: number) => number;
	fbo: WebGLFramebuffer;
	height: number;
	texelX: number;
	texelY: number;
	texture: WebGLTexture;
	width: number;
}

interface DoubleTarget {
	height: number;
	read: Target;
	swap: () => void;
	texelX: number;
	texelY: number;
	width: number;
	write: Target;
}

interface Format {
	format: number;
	internal: number;
}

type Uniforms = Record<string, WebGLUniformLocation | null>;

interface Program {
	bind: () => void;
	uniforms: Uniforms;
}

const supportsTarget = (
	gl: WebGLRenderingContext,
	internal: number,
	format: number,
	type: number
) => {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, internal, 4, 4, 0, format, type, null);
	const fbo = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,
		gl.COLOR_ATTACHMENT0,
		gl.TEXTURE_2D,
		texture,
		0
	);
	const ok =
		gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
	gl.deleteTexture(texture);
	gl.deleteFramebuffer(fbo);
	return ok;
};

export class Fluid {
	readonly canvas: HTMLCanvasElement;
	readonly gl: WebGLRenderingContext;
	private readonly isGl2: boolean;
	private readonly halfFloat: number;
	private readonly linear: boolean;
	private readonly rgba: Format;
	private readonly rg: Format;
	private readonly r: Format;
	private readonly programs: Record<string, Program> = {};
	private dye: DoubleTarget | null = null;
	private velocity: DoubleTarget | null = null;
	private divergence: Target | null = null;
	private pressure: DoubleTarget | null = null;
	private maskTexture: WebGLTexture | null = null;
	private overlayTexture: WebGLTexture | null = null;
	private overlaySize = { h: 0, w: 0 };
	private time = Math.random() * 120;
	private readonly pointer: Pointer = {
		dx: 0,
		dy: 0,
		moved: false,
		speed: 0,
		x: 0,
		y: 0,
	};
	palette: FluidPalette;
	/** 0 turns the dye off: just the drifting dither and the masks */
	fluidAmount = 1;

	static create(canvas: HTMLCanvasElement, palette: FluidPalette) {
		const options: WebGLContextAttributes = {
			alpha: true,
			antialias: false,
			depth: false,
			preserveDrawingBuffer: false,
			stencil: false,
		};
		const gl2 = canvas.getContext("webgl2", options);
		const gl = gl2 ?? canvas.getContext("webgl", options);
		if (!gl) {
			return null;
		}
		try {
			return new Fluid(canvas, gl, Boolean(gl2), palette);
		} catch {
			return null;
		}
	}

	private constructor(
		canvas: HTMLCanvasElement,
		gl: WebGLRenderingContext,
		isGl2: boolean,
		palette: FluidPalette
	) {
		this.canvas = canvas;
		this.gl = gl;
		this.isGl2 = isGl2;
		this.palette = palette;
		const gl2 = gl as WebGL2RenderingContext;
		if (isGl2) {
			gl.getExtension("EXT_color_buffer_float");
			this.linear = Boolean(gl.getExtension("OES_texture_float_linear"));
			this.halfFloat = gl2.HALF_FLOAT;
		} else {
			const half = gl.getExtension("OES_texture_half_float");
			this.linear = Boolean(gl.getExtension("OES_texture_half_float_linear"));
			if (!half) {
				throw new Error("half float textures are not supported");
			}
			this.halfFloat = half.HALF_FLOAT_OES;
		}
		this.rgba = this.pickFormat("rgba");
		this.rg = this.pickFormat("rg");
		this.r = this.pickFormat("r");
		this.buildPrograms();
		this.buildGeometry();
		this.resize();
	}

	private pickFormat(kind: "r" | "rg" | "rgba"): Format {
		const { gl } = this;
		if (!this.isGl2) {
			return { format: gl.RGBA, internal: gl.RGBA };
		}
		const gl2 = gl as WebGL2RenderingContext;
		const candidates: Format[] = [
			{ format: gl2.RED, internal: gl2.R16F },
			{ format: gl2.RG, internal: gl2.RG16F },
			{ format: gl2.RGBA, internal: gl2.RGBA16F },
		];
		const start = { r: 0, rg: 1, rgba: 2 }[kind];
		for (const candidate of candidates.slice(start)) {
			if (
				supportsTarget(gl, candidate.internal, candidate.format, this.halfFloat)
			) {
				return candidate;
			}
		}
		throw new Error("no renderable float format");
	}

	private compile(type: number, source: string, keywords: string[] = []) {
		const { gl } = this;
		const shader = gl.createShader(type);
		if (!shader) {
			throw new Error("could not create a shader");
		}
		const defines = keywords.map((keyword) => `#define ${keyword}\n`).join("");
		gl.shaderSource(shader, defines + source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			throw new Error(gl.getShaderInfoLog(shader) ?? "shader failed");
		}
		return shader;
	}

	private program(vertex: WebGLShader, fragment: WebGLShader): Program {
		const { gl } = this;
		const program = gl.createProgram();
		if (!program) {
			throw new Error("could not create a program");
		}
		gl.attachShader(program, vertex);
		gl.attachShader(program, fragment);
		gl.bindAttribLocation(program, 0, "aPosition");
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(gl.getProgramInfoLog(program) ?? "link failed");
		}
		const uniforms: Uniforms = {};
		const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
		for (let index = 0; index < count; index += 1) {
			const info = gl.getActiveUniform(program, index);
			if (info) {
				uniforms[info.name] = gl.getUniformLocation(program, info.name);
			}
		}
		return { bind: () => gl.useProgram(program), uniforms };
	}

	private buildPrograms() {
		const { gl } = this;
		const vertex = this.compile(gl.VERTEX_SHADER, BASE_VERTEX);
		const fragment = (source: string, keywords?: string[]) =>
			this.program(vertex, this.compile(gl.FRAGMENT_SHADER, source, keywords));
		this.programs.copy = fragment(COPY);
		this.programs.clear = fragment(CLEAR);
		this.programs.splat = fragment(SPLAT);
		this.programs.advection = fragment(
			ADVECTION,
			this.linear ? [] : ["MANUAL_FILTERING"]
		);
		this.programs.divergence = fragment(DIVERGENCE);
		this.programs.pressure = fragment(PRESSURE);
		this.programs.gradient = fragment(GRADIENT_SUBTRACT);
		this.programs.display = fragment(DISPLAY);
	}

	private buildGeometry() {
		const { gl } = this;
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
			gl.STATIC_DRAW
		);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(
			gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array([0, 1, 2, 0, 2, 3]),
			gl.STATIC_DRAW
		);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(0);
	}

	private target(
		width: number,
		height: number,
		format: Format,
		filter: number
	): Target {
		const { gl } = this;
		gl.activeTexture(gl.TEXTURE0);
		const texture = gl.createTexture();
		const fbo = gl.createFramebuffer();
		if (!(texture && fbo)) {
			throw new Error("could not create a render target");
		}
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			format.internal,
			width,
			height,
			0,
			format.format,
			this.halfFloat,
			null
		);
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
		gl.framebufferTexture2D(
			gl.FRAMEBUFFER,
			gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D,
			texture,
			0
		);
		gl.viewport(0, 0, width, height);
		gl.clear(gl.COLOR_BUFFER_BIT);
		return {
			attach: (unit) => {
				gl.activeTexture(gl.TEXTURE0 + unit);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				return unit;
			},
			fbo,
			height,
			texelX: 1 / width,
			texelY: 1 / height,
			texture,
			width,
		};
	}

	private double(
		width: number,
		height: number,
		format: Format,
		filter: number
	): DoubleTarget {
		let read = this.target(width, height, format, filter);
		let write = this.target(width, height, format, filter);
		return {
			height,
			get read() {
				return read;
			},
			swap() {
				const swapped = read;
				read = write;
				write = swapped;
			},
			texelX: 1 / width,
			texelY: 1 / height,
			width,
			get write() {
				return write;
			},
		};
	}

	private free(target: Target | null) {
		if (target) {
			this.gl.deleteTexture(target.texture);
			this.gl.deleteFramebuffer(target.fbo);
		}
	}

	private freeDouble(target: DoubleTarget | null) {
		if (target) {
			this.free(target.read);
			this.free(target.write);
		}
	}

	private resolution(base: number) {
		const { gl } = this;
		let aspect = gl.drawingBufferWidth / Math.max(gl.drawingBufferHeight, 1);
		if (aspect < 1) {
			aspect = 1 / aspect;
		}
		const short = Math.round(base);
		const long = Math.round(base * aspect);
		return gl.drawingBufferWidth > gl.drawingBufferHeight
			? { height: short, width: long }
			: { height: long, width: short };
	}

	/** matches the canvas to its css box; returns true when it changed */
	resize(ratio = 1) {
		const width = Math.max(1, Math.floor(this.canvas.clientWidth * ratio));
		const height = Math.max(1, Math.floor(this.canvas.clientHeight * ratio));
		if (
			this.dye &&
			this.canvas.width === width &&
			this.canvas.height === height
		) {
			return false;
		}
		this.canvas.width = width;
		this.canvas.height = height;
		const { gl } = this;
		const filter = this.linear ? gl.LINEAR : gl.NEAREST;
		const sim = this.resolution(SIM_RESOLUTION);
		const dye = this.resolution(DYE_RESOLUTION);
		this.freeDouble(this.dye);
		this.freeDouble(this.velocity);
		this.free(this.divergence);
		this.freeDouble(this.pressure);
		gl.disable(gl.BLEND);
		this.dye = this.double(dye.width, dye.height, this.rgba, filter);
		this.velocity = this.double(sim.width, sim.height, this.rg, filter);
		this.divergence = this.target(sim.width, sim.height, this.r, gl.NEAREST);
		this.pressure = this.double(sim.width, sim.height, this.r, gl.NEAREST);
		return true;
	}

	private blit(target: Target | null) {
		const { gl } = this;
		if (target) {
			gl.viewport(0, 0, target.width, target.height);
			gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
		} else {
			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	}

	private uploadTexture(
		existing: WebGLTexture | null,
		source: HTMLCanvasElement,
		filter: number
	) {
		const { gl } = this;
		const texture = existing ?? gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		if (!existing) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
		gl.bindTexture(gl.TEXTURE_2D, null);
		return texture;
	}

	/** white text on black, the same size as the canvas */
	setMask(mask: HTMLCanvasElement | null) {
		if (!mask) {
			if (this.maskTexture) {
				this.gl.deleteTexture(this.maskTexture);
			}
			this.maskTexture = null;
			return;
		}
		this.maskTexture = this.uploadTexture(
			this.maskTexture,
			mask,
			this.gl.LINEAR
		);
	}

	/** coloured shapes on black, redrawn every frame by the caller */
	setOverlay(overlay: HTMLCanvasElement | null) {
		if (!overlay || overlay.width === 0) {
			return;
		}
		const sameSize =
			overlay.width === this.overlaySize.w &&
			overlay.height === this.overlaySize.h;
		if (sameSize && this.overlayTexture) {
			const { gl } = this;
			gl.bindTexture(gl.TEXTURE_2D, this.overlayTexture);
			gl.texSubImage2D(
				gl.TEXTURE_2D,
				0,
				0,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				overlay
			);
			gl.bindTexture(gl.TEXTURE_2D, null);
			return;
		}
		this.overlayTexture = this.uploadTexture(
			this.overlayTexture,
			overlay,
			this.gl.NEAREST
		);
		this.overlaySize = { h: overlay.height, w: overlay.width };
	}

	/** feed the smoothed cursor in canvas css pixels */
	move(x: number, y: number) {
		const { canvas, pointer } = this;
		const u = x / Math.max(canvas.clientWidth, 1);
		const v = 1 - y / Math.max(canvas.clientHeight, 1);
		const aspect = canvas.width / Math.max(canvas.height, 1);
		let dx = u - pointer.x;
		let dy = v - pointer.y;
		if (aspect < 1) {
			dx *= aspect;
		}
		if (aspect > 1) {
			dy /= aspect;
		}
		pointer.x = u;
		pointer.y = v;
		pointer.dx = dx;
		pointer.dy = dy;
		pointer.speed += (Math.hypot(dx, dy) - pointer.speed) * 0.15;
		pointer.moved = dx !== 0 || dy !== 0;
	}

	/** puts the pointer somewhere without stirring anything */
	place(x: number, y: number) {
		this.pointer.x = x / Math.max(this.canvas.clientWidth, 1);
		this.pointer.y = 1 - y / Math.max(this.canvas.clientHeight, 1);
		this.pointer.moved = false;
	}

	private splat() {
		const { canvas, gl, pointer, programs } = this;
		const { velocity, dye } = this;
		if (!(velocity && dye)) {
			return;
		}
		const widthScale = canvas.width / 1920;
		const strength = Math.min(
			(pointer.speed * canvas.width) / 1920 / FULL_SPEED,
			1
		);
		const fullRadius = SPLAT_RADIUS / 100 / Math.max(widthScale, 0.01);
		const aspect = canvas.width / Math.max(canvas.height, 1);
		const radius = fullRadius * strength * (aspect > 1 ? aspect : 1);
		const { splat } = programs;
		splat.bind();
		gl.uniform1i(splat.uniforms.uTarget, velocity.read.attach(0));
		gl.uniform1f(splat.uniforms.aspectRatio, aspect);
		gl.uniform2f(splat.uniforms.point, pointer.x, pointer.y);
		gl.uniform3f(
			splat.uniforms.color,
			pointer.dx * SPLAT_FORCE,
			pointer.dy * SPLAT_FORCE,
			0
		);
		gl.uniform1f(splat.uniforms.radius, Math.max(radius, 1e-6));
		this.blit(velocity.write);
		velocity.swap();
		gl.uniform1i(splat.uniforms.uTarget, dye.read.attach(0));
		gl.uniform3f(
			splat.uniforms.color,
			DYE * strength,
			DYE * strength,
			DYE * strength
		);
		this.blit(dye.write);
		dye.swap();
	}

	private simulate(dt: number) {
		const { gl, programs, velocity, dye, divergence, pressure } = this;
		if (!(velocity && dye && divergence && pressure)) {
			return;
		}
		gl.disable(gl.BLEND);
		const div = programs.divergence;
		div.bind();
		gl.uniform2f(div.uniforms.texelSize, velocity.texelX, velocity.texelY);
		gl.uniform1i(div.uniforms.uVelocity, velocity.read.attach(0));
		this.blit(divergence);

		const { clear } = programs;
		clear.bind();
		gl.uniform1i(clear.uniforms.uTexture, pressure.read.attach(0));
		gl.uniform1f(clear.uniforms.value, 0);
		this.blit(pressure.write);
		pressure.swap();

		const solve = programs.pressure;
		solve.bind();
		gl.uniform2f(solve.uniforms.texelSize, velocity.texelX, velocity.texelY);
		gl.uniform1i(solve.uniforms.uDivergence, divergence.attach(0));
		for (let index = 0; index < PRESSURE_ITERATIONS; index += 1) {
			gl.uniform1i(solve.uniforms.uPressure, pressure.read.attach(1));
			this.blit(pressure.write);
			pressure.swap();
		}

		const { gradient } = programs;
		gradient.bind();
		gl.uniform2f(gradient.uniforms.texelSize, velocity.texelX, velocity.texelY);
		gl.uniform1i(gradient.uniforms.uPressure, pressure.read.attach(0));
		gl.uniform1i(gradient.uniforms.uVelocity, velocity.read.attach(1));
		this.blit(velocity.write);
		velocity.swap();

		const advect = programs.advection;
		advect.bind();
		gl.uniform2f(advect.uniforms.texelSize, velocity.texelX, velocity.texelY);
		if (!this.linear) {
			gl.uniform2f(
				advect.uniforms.dyeTexelSize,
				velocity.texelX,
				velocity.texelY
			);
		}
		const own = velocity.read.attach(0);
		gl.uniform1i(advect.uniforms.uVelocity, own);
		gl.uniform1i(advect.uniforms.uSource, own);
		gl.uniform1f(advect.uniforms.dt, dt);
		gl.uniform1f(advect.uniforms.dissipation, VELOCITY_DISSIPATION);
		this.blit(velocity.write);
		velocity.swap();

		if (!this.linear) {
			gl.uniform2f(advect.uniforms.dyeTexelSize, dye.texelX, dye.texelY);
		}
		gl.uniform1i(advect.uniforms.uVelocity, velocity.read.attach(0));
		gl.uniform1i(advect.uniforms.uSource, dye.read.attach(1));
		gl.uniform1f(advect.uniforms.dissipation, DENSITY_DISSIPATION);
		this.blit(dye.write);
		dye.swap();
	}

	/** advances the sim by `dt` seconds and draws */
	step(dt: number) {
		this.time += dt;
		if (this.pointer.moved && this.fluidAmount > 0) {
			this.pointer.moved = false;
			this.splat();
		}
		this.simulate(dt);
		this.render();
	}

	render() {
		const { gl, palette, programs, dye } = this;
		if (!dye) {
			return;
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		const { display } = programs;
		display.bind();
		const u = display.uniforms;
		gl.uniform1i(u.uTexture, dye.read.attach(0));
		gl.uniform1f(u.u_time, this.time);
		gl.uniform2f(u.u_resolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
		gl.uniform1f(u.u_fluidAmount, this.fluidAmount);
		gl.uniform1f(
			u.u_pixelRatio,
			this.canvas.width / Math.max(this.canvas.clientWidth, 1)
		);
		gl.uniform1f(u.u_dark, palette.dark ? 1 : 0);
		gl.uniform3f(u.u_ditherDark, ...palette.ditherDark);
		gl.uniform3f(u.u_ditherLight, ...palette.ditherLight);
		gl.uniform3f(u.u_text, ...palette.text);
		gl.uniform3f(u.u_textTint, ...palette.textTint);
		gl.uniform3f(u.u_accent, ...palette.accent);
		gl.uniform3f(u.u_accentPale, ...palette.accentPale);
		if (this.maskTexture) {
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.maskTexture);
			gl.uniform1i(u.uTextMask, 1);
			gl.uniform1f(u.u_hasTextMask, 1);
		} else {
			gl.uniform1f(u.u_hasTextMask, 0);
		}
		if (this.overlayTexture) {
			gl.activeTexture(gl.TEXTURE2);
			gl.bindTexture(gl.TEXTURE_2D, this.overlayTexture);
			gl.uniform1i(u.uOverlay, 2);
			gl.uniform1f(u.u_hasOverlay, 1);
		} else {
			gl.uniform1f(u.u_hasOverlay, 0);
		}
		this.blit(null);
	}

	destroy() {
		this.freeDouble(this.dye);
		this.freeDouble(this.velocity);
		this.free(this.divergence);
		this.freeDouble(this.pressure);
		if (this.maskTexture) {
			this.gl.deleteTexture(this.maskTexture);
		}
		if (this.overlayTexture) {
			this.gl.deleteTexture(this.overlayTexture);
		}
		this.dye = null;
		this.velocity = null;
		/* no loseContext(): react remounts effects in dev, and a canvas
		   only ever hands back the same (now lost) context */
	}
}
