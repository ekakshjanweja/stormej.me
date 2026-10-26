"use client";

import { useEffect, useRef, useState } from "react";
import { reducedMotion } from "../_lib/gsap";

/* a stable-fluids sim (advect, divergence, a few jacobi steps, subtract
   the gradient) on a 256px grid. the cursor stirs it; the display pass
   turns speed into a faint sage wake that multiplies over the page */

const SIM_RESOLUTION = 256;
const PRESSURE_ITERATIONS = 4;
const VELOCITY_DISSIPATION = 0.95;
const SPLAT_RADIUS = 0.0025;
const SPLAT_FORCE = 6000;
const MIN_DELTA = 0.0005;
const MAX_DPR = 1.5;

const VERTEX = `#version 300 es
precision highp float;
in vec2 aPosition;
uniform vec2 texelSize;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
void main () {
	vUv = aPosition * 0.5 + 0.5;
	vL = vUv - vec2(texelSize.x, 0.0);
	vR = vUv + vec2(texelSize.x, 0.0);
	vT = vUv + vec2(0.0, texelSize.y);
	vB = vUv - vec2(0.0, texelSize.y);
	gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const HEADER = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
in vec2 vL;
in vec2 vR;
in vec2 vT;
in vec2 vB;
out vec4 outColor;
`;

const SPLAT = `${HEADER}
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
	vec2 p = vUv - point;
	p.x *= aspectRatio;
	vec3 splat = exp(-dot(p, p) / radius) * color;
	outColor = vec4(texture(uTarget, vUv).xyz + splat, 1.0);
}`;

const ADVECT = `${HEADER}
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main () {
	vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
	outColor = vec4(dissipation * texture(uSource, coord).xyz, 1.0);
}`;

const DIVERGENCE = `${HEADER}
uniform sampler2D uVelocity;
void main () {
	vec2 c = texture(uVelocity, vUv).xy;
	float l = vL.x < 0.0 ? -c.x : texture(uVelocity, vL).x;
	float r = vR.x > 1.0 ? -c.x : texture(uVelocity, vR).x;
	float t = vT.y > 1.0 ? -c.y : texture(uVelocity, vT).y;
	float b = vB.y < 0.0 ? -c.y : texture(uVelocity, vB).y;
	outColor = vec4(0.5 * (r - l + t - b), 0.0, 0.0, 1.0);
}`;

const CLEAR = `${HEADER}
uniform sampler2D uTexture;
uniform float value;
void main () {
	outColor = value * texture(uTexture, vUv);
}`;

const PRESSURE = `${HEADER}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main () {
	float l = texture(uPressure, vL).x;
	float r = texture(uPressure, vR).x;
	float t = texture(uPressure, vT).x;
	float b = texture(uPressure, vB).x;
	float divergence = texture(uDivergence, vUv).x;
	outColor = vec4((l + r + b + t - divergence) * 0.25, 0.0, 0.0, 1.0);
}`;

const GRADIENT = `${HEADER}
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main () {
	float l = texture(uPressure, vL).x;
	float r = texture(uPressure, vR).x;
	float t = texture(uPressure, vT).x;
	float b = texture(uPressure, vB).x;
	vec2 velocity = texture(uVelocity, vUv).xy - vec2(r - l, t - b);
	outColor = vec4(velocity, 0.0, 1.0);
}`;

/* speed, the edges of the wake, and a fine shimmer inside it. the page
   behind is multiplied, so white is "nothing" */
const DISPLAY = `${HEADER}
uniform sampler2D uVelocity;
uniform float time;
uniform vec3 tintA;
uniform vec3 tintB;
uniform vec3 tintC;
void main () {
	float speed = clamp(length(texture(uVelocity, vUv).xy) / 900.0, 0.0, 1.0);
	float sl = length(texture(uVelocity, vL).xy);
	float sr = length(texture(uVelocity, vR).xy);
	float st = length(texture(uVelocity, vT).xy);
	float sb = length(texture(uVelocity, vB).xy);
	float edge = clamp((abs(sr - sl) + abs(st - sb)) / 120.0, 0.0, 1.0);
	float spark = smoothstep(0.55, 1.0, sin(vUv.x * 90.0 + time * 3.0) * sin(vUv.y * 70.0 - time * 2.0)) * speed;
	float alpha = clamp(speed * 0.9 + edge * 0.6 + spark * 0.35, 0.0, 0.85);
	/* the palette's own colours: its light glow in the slow middle, its
	   accent as the wake quickens and along its edges, so the trail always
	   reads as the colour that's chosen (green, orange, orchid) */
	vec3 tint = mix(mix(tintA, tintC, speed), tintC, edge);
	outColor = vec4(tint * alpha, alpha);
}`;

interface Target {
	fbo: WebGLFramebuffer;
	height: number;
	texture: WebGLTexture;
	width: number;
}

interface DoubleTarget {
	read: Target;
	swap: () => void;
	write: Target;
}

interface Program {
	program: WebGLProgram;
	uniforms: Record<string, WebGLUniformLocation | null>;
}

const compile = (
	gl: WebGL2RenderingContext,
	type: number,
	source: string
): WebGLShader => {
	const shader = gl.createShader(type);
	if (!shader) {
		throw new Error("could not create a shader");
	}
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(shader) ?? "shader failed to compile");
	}
	return shader;
};

const UNIFORM_NAMES = [
	"aspectRatio",
	"color",
	"dissipation",
	"dt",
	"point",
	"radius",
	"texelSize",
	"time",
	"uDivergence",
	"uPressure",
	"uSource",
	"uTarget",
	"uTexture",
	"uVelocity",
	"tintA",
	"tintB",
	"tintC",
	"value",
];

const link = (
	gl: WebGL2RenderingContext,
	vertex: WebGLShader,
	fragment: string
): Program => {
	const program = gl.createProgram();
	gl.attachShader(program, vertex);
	gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment));
	gl.bindAttribLocation(program, 0, "aPosition");
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(gl.getProgramInfoLog(program) ?? "program failed to link");
	}
	const uniforms: Program["uniforms"] = {};
	for (const name of UNIFORM_NAMES) {
		uniforms[name] = gl.getUniformLocation(program, name);
	}
	return { program, uniforms };
};

const createTarget = (
	gl: WebGL2RenderingContext,
	width: number,
	height: number,
	internalFormat: number,
	format: number
): Target => {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		internalFormat,
		width,
		height,
		0,
		format,
		gl.HALF_FLOAT,
		null
	);
	const fbo = gl.createFramebuffer();
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
	return { fbo, height, texture, width };
};

const createDouble = (
	gl: WebGL2RenderingContext,
	width: number,
	height: number,
	internalFormat: number,
	format: number
): DoubleTarget => {
	const pair = {
		read: createTarget(gl, width, height, internalFormat, format),
		swap: () => {
			const { read, write } = pair;
			pair.read = write;
			pair.write = read;
		},
		write: createTarget(gl, width, height, internalFormat, format),
	};
	return pair;
};

/** sets up the sim on `canvas` and returns a stop function, or null if the
    browser can't render to half-float textures */
type Rgb = [number, number, number];

/* lilac, peach, orange: what the trail is tinted with if a theme's glows
   can't be read */
const FALLBACK_TINTS: Rgb[] = [
	[0.91, 0.71, 0.96],
	[0.94, 0.62, 0.54],
	[0.89, 0.38, 0.18],
];

const HEX = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

const rgbOf = (value: string, fallback: Rgb): Rgb => {
	const match = HEX.exec(value.trim());
	if (!match) {
		return fallback;
	}
	const [, r = "0", g = "0", b = "0"] = match;
	return [
		Number.parseInt(r, 16) / 255,
		Number.parseInt(g, 16) / 255,
		Number.parseInt(b, 16) / 255,
	];
};

/** the palette's light glow, mid glow and accent, as the shader wants them */
const readTints = (): Rgb[] => {
	const style = getComputedStyle(document.documentElement);
	return ["--glow-1", "--glow-2", "--sage"].map((name, index) =>
		rgbOf(style.getPropertyValue(name), FALLBACK_TINTS[index] ?? [1, 1, 1])
	);
};

const startFluid = (canvas: HTMLCanvasElement) => {
	const gl = canvas.getContext("webgl2", {
		alpha: true,
		antialias: false,
		depth: false,
		premultipliedAlpha: true,
		stencil: false,
	});
	if (!gl?.getExtension("EXT_color_buffer_float")) {
		return null;
	}

	const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
	const programs = {
		advect: link(gl, vertex, ADVECT),
		clear: link(gl, vertex, CLEAR),
		display: link(gl, vertex, DISPLAY),
		divergence: link(gl, vertex, DIVERGENCE),
		gradient: link(gl, vertex, GRADIENT),
		pressure: link(gl, vertex, PRESSURE),
		splat: link(gl, vertex, SPLAT),
	};

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

	let simWidth = 0;
	let simHeight = 0;
	let velocity: DoubleTarget;
	let pressure: DoubleTarget;
	let divergence: Target;

	const resize = () => {
		const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
		canvas.width = Math.round(window.innerWidth * dpr);
		canvas.height = Math.round(window.innerHeight * dpr);
		const aspect = canvas.width / canvas.height;
		const width =
			aspect > 1 ? Math.round(SIM_RESOLUTION * aspect) : SIM_RESOLUTION;
		const height =
			aspect > 1 ? SIM_RESOLUTION : Math.round(SIM_RESOLUTION / aspect);
		if (width === simWidth && height === simHeight) {
			return;
		}
		simWidth = width;
		simHeight = height;
		velocity = createDouble(gl, width, height, gl.RG16F, gl.RG);
		pressure = createDouble(gl, width, height, gl.R16F, gl.RED);
		divergence = createTarget(gl, width, height, gl.R16F, gl.RED);
	};
	resize();

	const draw = (target: Target | null) => {
		if (target) {
			gl.viewport(0, 0, target.width, target.height);
			gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
		} else {
			gl.viewport(0, 0, canvas.width, canvas.height);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	};

	const activate = (program: Program) => {
		// biome-ignore lint/correctness/useHookAtTopLevel: webgl's useProgram, not a react hook
		gl.useProgram(program.program);
		gl.uniform2f(
			program.uniforms.texelSize ?? null,
			1 / simWidth,
			1 / simHeight
		);
		return program.uniforms;
	};

	const bind = (
		location: WebGLUniformLocation | null | undefined,
		unit: number,
		texture: WebGLTexture
	) => {
		gl.activeTexture(gl.TEXTURE0 + unit);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(location ?? null, unit);
	};

	const pointer = { dx: 0, dy: 0, x: 0, y: 0 };
	const onMove = (event: PointerEvent) => {
		const x = event.clientX / window.innerWidth;
		const y = 1 - event.clientY / window.innerHeight;
		if (pointer.x !== 0 || pointer.y !== 0) {
			pointer.dx += x - pointer.x;
			pointer.dy += y - pointer.y;
		}
		pointer.x = x;
		pointer.y = y;
	};

	const splat = () => {
		const aspect = canvas.width / canvas.height;
		const uniforms = activate(programs.splat);
		bind(uniforms.uTarget, 0, velocity.read.texture);
		gl.uniform1f(uniforms.aspectRatio ?? null, aspect);
		gl.uniform2f(uniforms.point ?? null, pointer.x, pointer.y);
		gl.uniform3f(
			uniforms.color ?? null,
			pointer.dx * SPLAT_FORCE,
			pointer.dy * SPLAT_FORCE,
			0
		);
		gl.uniform1f(
			uniforms.radius ?? null,
			aspect > 1 ? SPLAT_RADIUS * aspect : SPLAT_RADIUS
		);
		draw(velocity.write);
		velocity.swap();
	};

	const step = (dt: number) => {
		let uniforms = activate(programs.divergence);
		bind(uniforms.uVelocity, 0, velocity.read.texture);
		draw(divergence);

		uniforms = activate(programs.clear);
		bind(uniforms.uTexture, 0, pressure.read.texture);
		gl.uniform1f(uniforms.value ?? null, 0.8);
		draw(pressure.write);
		pressure.swap();

		uniforms = activate(programs.pressure);
		bind(uniforms.uDivergence, 0, divergence.texture);
		for (let i = 0; i < PRESSURE_ITERATIONS; i += 1) {
			bind(uniforms.uPressure, 1, pressure.read.texture);
			draw(pressure.write);
			pressure.swap();
		}

		uniforms = activate(programs.gradient);
		bind(uniforms.uPressure, 0, pressure.read.texture);
		bind(uniforms.uVelocity, 1, velocity.read.texture);
		draw(velocity.write);
		velocity.swap();

		uniforms = activate(programs.advect);
		bind(uniforms.uVelocity, 0, velocity.read.texture);
		bind(uniforms.uSource, 0, velocity.read.texture);
		gl.uniform1f(uniforms.dt ?? null, dt);
		gl.uniform1f(uniforms.dissipation ?? null, VELOCITY_DISSIPATION);
		draw(velocity.write);
		velocity.swap();
	};

	/* the trail follows the colour theme, and changes when it does */
	let tints = readTints();
	const themeWatch = new MutationObserver(() => {
		tints = readTints();
	});
	themeWatch.observe(document.documentElement, {
		attributeFilter: ["data-theme"],
		attributes: true,
	});

	const render = (time: number) => {
		const uniforms = activate(programs.display);
		bind(uniforms.uVelocity, 0, velocity.read.texture);
		gl.uniform1f(uniforms.time ?? null, time);
		const [a = [1, 1, 1], b = [1, 1, 1], c = [1, 1, 1]] = tints;
		gl.uniform3f(uniforms.tintA ?? null, a[0], a[1], a[2]);
		gl.uniform3f(uniforms.tintB ?? null, b[0], b[1], b[2]);
		gl.uniform3f(uniforms.tintC ?? null, c[0], c[1], c[2]);
		draw(null);
	};

	let frame = 0;
	let last = performance.now();
	const tick = (now: number) => {
		const dt = Math.min((now - last) / 1000, 1 / 30);
		last = now;
		if (Math.hypot(pointer.dx, pointer.dy) > MIN_DELTA) {
			splat();
		}
		pointer.dx = 0;
		pointer.dy = 0;
		step(dt);
		render(now / 1000);
		frame = requestAnimationFrame(tick);
	};
	frame = requestAnimationFrame(tick);

	const onVisibility = () => {
		cancelAnimationFrame(frame);
		if (!document.hidden) {
			last = performance.now();
			frame = requestAnimationFrame(tick);
		}
	};

	window.addEventListener("pointermove", onMove, { passive: true });
	window.addEventListener("resize", resize);
	document.addEventListener("visibilitychange", onVisibility);
	return () => {
		cancelAnimationFrame(frame);
		themeWatch.disconnect();
		window.removeEventListener("pointermove", onMove);
		window.removeEventListener("resize", resize);
		document.removeEventListener("visibilitychange", onVisibility);
		gl.getExtension("WEBGL_lose_context")?.loseContext();
	};
};

export function FluidTrail() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		const fine = window.matchMedia("(pointer: fine)").matches;
		setEnabled(fine && !reducedMotion());
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!(enabled && canvas)) {
			return;
		}
		let stop: (() => void) | null = null;
		try {
			stop = startFluid(canvas);
		} catch {
			/* no webgl2, or a driver that won't compile: the page is fine without */
			stop = null;
		}
		return () => stop?.();
	}, [enabled]);

	if (!enabled) {
		return null;
	}

	return <canvas className="fluid" ref={canvasRef} />;
}
