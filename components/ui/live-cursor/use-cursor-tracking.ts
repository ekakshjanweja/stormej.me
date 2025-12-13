"use client";

import { useEffect, useRef, useCallback } from "react";
import { REALTIME_CONSTANTS } from "@shared/constants";
import { findNearestAnchor } from "./utils";

const { CURSOR_THROTTLE_MS } = REALTIME_CONSTANTS;

interface UseCursorTrackingProps {
  isTouchDevice: boolean;
  isChatMode: boolean;
  currentMessage: string;
  sendCursorPosition: (
    percentX: number,
    percentY: number,
    anchor?: { selector: string; relativeX: number; relativeY: number },
    currentTyping?: string,
    scrollX?: number,
    scrollY?: number
  ) => void;
  userCursorRef: React.RefObject<HTMLDivElement | null>;
}

export function useCursorTracking({
  isTouchDevice,
  isChatMode,
  currentMessage,
  sendCursorPosition,
  userCursorRef,
}: UseCursorTrackingProps) {
  const posRef = useRef({ x: 0, y: 0 });
  const currentMessageRef = useRef(currentMessage);
  currentMessageRef.current = currentMessage;
  const lastSentRef = useRef({
    percentX: 0,
    percentY: 0,
    scrollX: 0,
    scrollY: 0,
    time: 0,
  });
  const rafRef = useRef<number | null>(null);

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        posRef.current = { x: clientX, y: clientY };

        if (userCursorRef.current) {
          userCursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
        }

        const percentX = clientX / window.innerWidth;
        const percentY = clientY / window.innerHeight;
        const { scrollX, scrollY } = window;
        const now = Date.now();
        const last = lastSentRef.current;

        const posChanged =
          Math.abs(percentX - last.percentX) > 0.0005 ||
          Math.abs(percentY - last.percentY) > 0.0005 ||
          Math.abs(scrollX - last.scrollX) > 1 ||
          Math.abs(scrollY - last.scrollY) > 1;

        if (posChanged && now - last.time >= CURSOR_THROTTLE_MS) {
          lastSentRef.current = {
            percentX,
            percentY,
            scrollX,
            scrollY,
            time: now,
          };
          const anchor = findNearestAnchor(clientX, clientY);
          sendCursorPosition(
            percentX,
            percentY,
            anchor ?? undefined,
            !isTouchDevice && isChatMode && currentMessageRef.current
              ? "typing"
              : undefined,
            scrollX,
            scrollY
          );
        }
      });
    },
    [sendCursorPosition, isChatMode, isTouchDevice, userCursorRef]
  );

  // Mouse/touch handlers
  useEffect(() => {
    if (isTouchDevice) {
      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          updatePosition(e.touches[0].clientX, e.touches[0].clientY);
        }
      };
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      return () => window.removeEventListener("touchmove", handleTouchMove);
    } else {
      const handleMouseMove = (e: MouseEvent) =>
        updatePosition(e.clientX, e.clientY);
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [updatePosition, isTouchDevice]);

  // Mobile virtual position on chat open
  useEffect(() => {
    if (isChatMode && isTouchDevice) {
      posRef.current = {
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.35,
      };
      sendCursorPosition(
        0.5,
        0.35,
        undefined,
        undefined,
        window.scrollX,
        window.scrollY
      );
    }
  }, [isChatMode, isTouchDevice, sendCursorPosition]);

  // Heartbeat
  useEffect(() => {
    const heartbeat = setInterval(() => {
      if (isTouchDevice && isChatMode) {
        sendCursorPosition(
          0.5,
          0.35,
          undefined,
          undefined,
          window.scrollX,
          window.scrollY
        );
        return;
      }

      const { x, y } = posRef.current;
      if (x > 0 || y > 0) {
        const percentX = x / window.innerWidth;
        const percentY = y / window.innerHeight;
        const anchor = findNearestAnchor(x, y);
        sendCursorPosition(
          percentX,
          percentY,
          anchor ?? undefined,
          !isTouchDevice && isChatMode && currentMessageRef.current
            ? "typing"
            : undefined,
          window.scrollX,
          window.scrollY
        );
      }
    }, 5000);
    return () => clearInterval(heartbeat);
  }, [sendCursorPosition, isChatMode, isTouchDevice]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { posRef };
}
