import type { OgVariant } from "./render";

const VARIANTS: OgVariant[] = ["editorial", "dark", "mono", "minimal"];

export function parseVariant(value: string | null): OgVariant | null {
  if (!value) return null;
  return (VARIANTS as string[]).includes(value) ? (value as OgVariant) : null;
}
