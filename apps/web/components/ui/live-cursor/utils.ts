import { REALTIME_CONSTANTS } from "@shared/constants";
import type { CursorAnchor } from "@/lib/realtime-store";

const { MESSAGE_EXPIRY_MS } = REALTIME_CONSTANTS;

// Memoized contrast color calculation with cache
const contrastCache = new Map<string, string>();

export function getContrastColor(hexColor: string): string {
  if (!hexColor || typeof hexColor !== "string") return "#ffffff";

  const cached = contrastCache.get(hexColor);
  if (cached) return cached;

  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) return "#ffffff";

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return "#ffffff";

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const result = luminance > 0.6 ? "#000000" : "#ffffff";

  contrastCache.set(hexColor, result);
  return result;
}

// Find the nearest element with data-cursor-anchor attribute
export function findNearestAnchor(
  clientX: number,
  clientY: number
): CursorAnchor | null {
  const element = document.elementFromPoint(clientX, clientY);
  if (!element) return null;

  let current: Element | null = element;
  while (current) {
    const anchorId = current.getAttribute("data-cursor-anchor");
    if (anchorId) {
      const rect = current.getBoundingClientRect();
      return {
        selector: `[data-cursor-anchor="${anchorId}"]`,
        relativeX: (clientX - rect.left) / rect.width,
        relativeY: (clientY - rect.top) / rect.height,
      };
    }
    current = current.parentElement;
  }
  return null;
}

// Resolve an anchor to screen coordinates
export function resolveAnchorPosition(
  anchor: CursorAnchor
): { x: number; y: number } | null {
  const element = document.querySelector(anchor.selector);
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width * anchor.relativeX,
    y: rect.top + rect.height * anchor.relativeY,
  };
}

// Check if position is within viewport
export function isInViewport(x: number, y: number, margin = 50): boolean {
  return (
    x >= -margin &&
    x <= window.innerWidth + margin &&
    y >= -margin &&
    y <= window.innerHeight + margin
  );
}

// Filter active messages (not expired, max 3)
export function getActiveMessages(
  messages: Array<{ text: string; timestamp: number }>,
  now: number
) {
  return messages
    .filter((msg) => now - msg.timestamp < MESSAGE_EXPIRY_MS)
    .slice(-3);
}
