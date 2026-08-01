import { createHmac, timingSafeEqual } from "node:crypto";

export const VAULT_COOKIE = "stormej_vault";
const GATE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const encoder = new TextEncoder();

export const keysMatch = (provided: string, expected: string) => {
	const a = encoder.encode(provided);
	const b = encoder.encode(expected);
	if (a.byteLength !== b.byteLength) {
		return false;
	}
	return timingSafeEqual(a, b);
};

export const sealVaultGate = (accessKey: string) => {
	const expiresAt = Math.floor(Date.now() / 1000) + GATE_TTL_SECONDS;
	const payload = String(expiresAt);
	const signature = createHmac("sha256", accessKey)
		.update(`vault:${payload}`)
		.digest("base64url");
	return {
		cookieValue: `${payload}.${signature}`,
		maxAge: GATE_TTL_SECONDS,
	};
};

export const vaultGateValid = (
	cookieValue: string | undefined,
	accessKey: string
) => {
	if (!(cookieValue && accessKey)) {
		return false;
	}

	const [payload, signature] = cookieValue.split(".");
	if (!(payload && signature)) {
		return false;
	}

	const expiresAt = Number(payload);
	if (!Number.isFinite(expiresAt) || expiresAt * 1000 < Date.now()) {
		return false;
	}

	const expected = createHmac("sha256", accessKey)
		.update(`vault:${payload}`)
		.digest("base64url");

	const a = encoder.encode(signature);
	const b = encoder.encode(expected);
	if (a.byteLength !== b.byteLength) {
		return false;
	}

	return timingSafeEqual(a, b);
};

export const vaultCookieOptions = (maxAge: number, secure: boolean) =>
	({
		httpOnly: true,
		maxAge,
		path: "/",
		sameSite: "Lax",
		secure,
	}) as const;
