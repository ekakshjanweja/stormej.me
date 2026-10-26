/* small motion helpers shared by the ring, the sky and the loader */

/** the house curve: quick out, long settle */
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

export const easeInOutCubic = (t: number) =>
	t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, t: number) =>
	from + (to - from) * t;

/** frame-rate independent smoothing toward a target */
export const damp = (from: number, to: number, rate: number, dt: number) =>
	lerp(from, to, 1 - Math.exp(-rate * dt));

/** wraps an angle into (-180, 180] */
export const wrapAngle = (deg: number) => {
	const wrapped = ((deg % 360) + 360) % 360;
	return wrapped > 180 ? wrapped - 360 : wrapped;
};

export const prefersReducedMotion = () =>
	typeof window !== "undefined" &&
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* park–miller: integer maths only, so node and the browser agree to the
   last digit (Math.sin does not, and that breaks hydration) */
const MODULUS = 2_147_483_647;
const MULTIPLIER = 16_807;

/** a tiny seeded rng, so server and client scatter things the same way */
export const seeded = (seed: number) => {
	let state = seed % MODULUS || 1;
	return () => {
		state = (state * MULTIPLIER) % MODULUS;
		return (state - 1) / (MODULUS - 1);
	};
};
