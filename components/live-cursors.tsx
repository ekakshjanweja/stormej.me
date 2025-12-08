"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  Cursor,
  CursorPointer,
  CursorBody,
  CursorName,
  CursorMessage,
} from "@/components/kibo-ui/cursor";
import { useRealtime } from "@/lib/providers/realtime-provider";
import { type CursorAnchor, type CursorPosition } from "@/lib/realtime-store";
import { MessageCircle, X } from "lucide-react";

const MESSAGE_EXPIRY = 30000; // 30 seconds

// Find the nearest element with data-cursor-anchor attribute
function findNearestAnchor(
  clientX: number,
  clientY: number
): CursorAnchor | null {
  const element = document.elementFromPoint(clientX, clientY);
  if (!element) return null;

  // Walk up the DOM tree to find an anchor
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
function resolveAnchorPosition(
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
function isInViewport(x: number, y: number, margin = 50): boolean {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  return (
    x >= -margin &&
    x <= viewportWidth + margin &&
    y >= -margin &&
    y <= viewportHeight + margin
  );
}

export function LiveCursors() {
  const { cursors, user, pathname, sendCursorPosition, sendMessage } =
    useRealtime();

  // UI State
  const [isChatMode, setIsChatMode] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [sentMessages, setSentMessages] = useState<
    Array<{ text: string; timestamp: number }>
  >([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Position refs
  const viewportPosRef = useRef({ x: 0, y: 0 });
  const [displayPos, setDisplayPos] = useState({ x: 0, y: 0 });
  const lastSentRef = useRef({ percentX: 0, percentY: 0, scrollX: 0, scrollY: 0, time: 0 });
  const rafRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, forceUpdate] = useState(0); // For triggering re-renders on scroll

  // Detect touch device and Firefox
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    // Detect Firefox browser
  }, []);

  // Focus input when chat mode opens on mobile
  useEffect(() => {
    if (isChatMode && isTouchDevice && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatMode, isTouchDevice]);

  // Clean up expired sent messages
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setSentMessages((prev) =>
        prev.filter((msg) => now - msg.timestamp < MESSAGE_EXPIRY)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Unified position update function
  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        setDisplayPos({ x: clientX, y: clientY });
        viewportPosRef.current = { x: clientX, y: clientY };

        // Calculate percentage-based position
        const percentX = clientX / window.innerWidth;
        const percentY = clientY / window.innerHeight;
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        // Find nearest anchor element
        const anchor = findNearestAnchor(clientX, clientY);

        // Throttle server updates (8ms = ~120fps for ultra-smooth real-time)
        const now = Date.now();
        const last = lastSentRef.current;
        const posChanged =
          Math.abs(percentX - last.percentX) > 0.0005 ||
          Math.abs(percentY - last.percentY) > 0.0005 ||
          Math.abs(scrollX - last.scrollX) > 1 ||
          Math.abs(scrollY - last.scrollY) > 1;

        if (posChanged && now - last.time >= 8) {
          lastSentRef.current = { percentX, percentY, scrollX, scrollY, time: now };
          // Desktop users can show typing state, mobile users don't
          sendCursorPosition(
            percentX,
            percentY,
            anchor ?? undefined,
            !isTouchDevice && isChatMode ? currentMessage : undefined,
            scrollX,
            scrollY
          );
        }
      });
    },
    [sendCursorPosition, isChatMode, currentMessage, isTouchDevice]
  );

  // Handle mouse move
  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [updatePosition, isTouchDevice]);

  // Handle touch move for mobile
  useEffect(() => {
    if (!isTouchDevice) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePosition(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => window.removeEventListener("touchmove", handleTouchMove);
  }, [updatePosition, isTouchDevice]);

  // Force re-render on scroll to update cursor positions in real-time
  useEffect(() => {
    const handleScroll = () => {
      forceUpdate((n) => n + 1);
      // Also send updated position on scroll
      const { x, y } = viewportPosRef.current;
      if (x > 0 || y > 0) {
        const percentX = x / window.innerWidth;
        const percentY = y / window.innerHeight;
        sendCursorPosition(
          percentX,
          percentY,
          undefined,
          undefined,
          window.scrollX,
          window.scrollY
        );
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sendCursorPosition]);

  // Sync position on mobile (without typing state - messages only shown when sent)
  useEffect(() => {
    if (isTouchDevice && isChatMode) {
      const now = Date.now();
      const last = lastSentRef.current;

      // Throttle updates - don't send currentMessage for mobile (only show sent messages)
      if (now - last.time >= 100) {
        lastSentRef.current = { percentX: 0.5, percentY: 0.35, scrollX: window.scrollX, scrollY: window.scrollY, time: now };
        sendCursorPosition(0.5, 0.35, undefined, undefined, window.scrollX, window.scrollY);
      }
    }
  }, [isTouchDevice, isChatMode, sendCursorPosition]);

  // Send virtual position when entering chat mode on mobile
  useEffect(() => {
    if (isChatMode && isTouchDevice) {
      // Set a virtual position in the center-top area
      // This ensures visibility on both desktop and mobile
      const virtualX = window.innerWidth * 0.5;
      const virtualY = window.innerHeight * 0.35;

      viewportPosRef.current = { x: virtualX, y: virtualY };

      // Don't send currentMessage for mobile - messages only shown when sent
      sendCursorPosition(
        0.5, // 50% width
        0.35, // 35% height
        undefined,
        undefined,
        window.scrollX,
        window.scrollY
      );
    }
  }, [isChatMode, isTouchDevice, sendCursorPosition]);

  // Heartbeat every 5 seconds
  useEffect(() => {
    const heartbeat = setInterval(() => {
      // If on mobile and in chat mode, force the virtual position (no typing state)
      if (isTouchDevice && isChatMode) {
        sendCursorPosition(0.5, 0.35, undefined, undefined, window.scrollX, window.scrollY);
        return;
      }

      const { x, y } = viewportPosRef.current;
      if (x > 0 || y > 0) {
        const percentX = x / window.innerWidth;
        const percentY = y / window.innerHeight;
        const anchor = findNearestAnchor(x, y);
        // Desktop users can show typing state, mobile users don't
        sendCursorPosition(
          percentX,
          percentY,
          anchor ?? undefined,
          !isTouchDevice && isChatMode ? currentMessage : undefined,
          window.scrollX,
          window.scrollY
        );
      }
    }, 5000);
    return () => clearInterval(heartbeat);
  }, [sendCursorPosition, isChatMode, currentMessage, isTouchDevice]);

  // Handle keyboard events (desktop only)
  useEffect(() => {
    if (isTouchDevice) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.key === "/" && !isTyping && !isChatMode) {
        e.preventDefault();
        e.stopPropagation();
        setIsChatMode(true);
        return;
      }

      if (isChatMode) {
        e.preventDefault();
        e.stopPropagation();

        if (e.key === "Escape") {
          setCurrentMessage("");
          setIsChatMode(false);
          return;
        }

        if (e.key === "Enter" && currentMessage.trim()) {
          const messageText = currentMessage.trim();
          sendMessage(messageText);
          setSentMessages((prev) => [
            ...prev.slice(-2),
            { text: messageText, timestamp: Date.now() },
          ]);
          setCurrentMessage("");
          return;
        }

        if (e.key === "Backspace") {
          setCurrentMessage((prev) => prev.slice(0, -1));
          return;
        }

        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (currentMessage.length < 100) {
            setCurrentMessage((prev) => prev + e.key);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isChatMode, currentMessage, sendMessage, isTouchDevice]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Handle mobile message send
  const handleMobileSend = () => {
    if (currentMessage.trim()) {
      const messageText = currentMessage.trim();
      sendMessage(messageText);
      setSentMessages((prev) => [
        ...prev.slice(-2),
        { text: messageText, timestamp: Date.now() },
      ]);
      setCurrentMessage("");
    }
  };

  if (!user) return null;

  // Check if anyone else is on the same path
  const hasOthersOnSamePath = cursors.some(
    (cursor) => cursor.userId !== user.userId && cursor.path === pathname
  );

  // Resolve cursor positions and filter visible ones
  const resolvePosition = (
    cursor: CursorPosition
  ): { x: number; y: number } | null => {
    // Try anchor-based position first
    if (cursor.anchor) {
      const anchorPos = resolveAnchorPosition(cursor.anchor);
      if (anchorPos && isInViewport(anchorPos.x, anchorPos.y)) {
        return anchorPos;
      }
    }

    // Calculate scroll offset difference
    // If sender scrolled more than us, their cursor should appear lower on our screen
    // If we scrolled more than sender, their cursor should appear higher
    const scrollOffsetX = window.scrollX - (cursor.scrollX ?? 0);
    const scrollOffsetY = window.scrollY - (cursor.scrollY ?? 0);

    // Fallback to percentage-based position, adjusted for scroll difference
    const x = cursor.percentX * window.innerWidth + scrollOffsetX;
    const y = cursor.percentY * window.innerHeight + scrollOffsetY;

    if (isInViewport(x, y)) {
      return { x, y };
    }

    return null;
  };

  // Filter and map cursors with resolved positions
  const visibleCursors = cursors
    .filter(
      (cursor) => cursor.userId !== user.userId && cursor.path === pathname
    )
    .map((cursor) => ({
      ...cursor,
      resolvedPos: resolvePosition(cursor),
    }))
    .filter((cursor) => cursor.resolvedPos !== null);

  // Determine if we should hide the native cursor (not for Firefox - has compatibility issues)
  const shouldHideCursor = !isTouchDevice && hasOthersOnSamePath;

  return (
    <>
      {/* Hide native cursor when live cursor is shown */}
      {shouldHideCursor && (
        <style>{`* { cursor: none !important; }`}</style>
      )}
      <div
        className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
        aria-hidden="true"
      >
        {/* Other users' cursors */}
        {visibleCursors.map((cursor) => {
          const { x, y } = cursor.resolvedPos!;
          const hasContent = cursor.messages.length > 0 || cursor.currentTyping;

          return (
            <div
              key={cursor.userId}
              className="absolute will-change-transform cursor-smooth"
              style={{
                transform: `translate3d(${x}px, ${y}px, 0)`,
              }}
            >
              <Cursor>
                <CursorPointer style={{ color: cursor.color }} />
                {hasContent && (
                  <CursorBody
                    style={{
                      backgroundColor: cursor.color,
                      color: getContrastColor(cursor.color),
                    }}
                  >
                    <CursorName>{cursor.name}</CursorName>
                    {cursor.messages.map((msg, idx) => (
                      <CursorMessage
                        key={msg.timestamp}
                        className={
                          idx < cursor.messages.length - 1 ? "opacity-60" : ""
                        }
                      >
                        {msg.text}
                      </CursorMessage>
                    ))}
                    {cursor.currentTyping && (
                      <CursorMessage className="opacity-80 italic">
                        {cursor.currentTyping}
                        <span className="animate-pulse">|</span>
                      </CursorMessage>
                    )}
                  </CursorBody>
                )}
                {!hasContent && (
                  <CursorBody
                    style={{
                      backgroundColor: cursor.color,
                      color: getContrastColor(cursor.color),
                    }}
                    className="opacity-80"
                  >
                    <CursorName>{cursor.name}</CursorName>
                  </CursorBody>
                )}
              </Cursor>
            </div>
          );
        })}

        {/* Current user's cursor - only show on desktop if others on same page */}
      </div>

      {/* Current user's cursor wrapper - separate z-index so it's above navbar */}
      {/* Disabled for Firefox due to compatibility issues */}
      {!isTouchDevice && hasOthersOnSamePath && (
        <div
          className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute will-change-transform"
            style={{
              transform: `translate3d(${displayPos.x}px, ${displayPos.y}px, 0)`,
            }}
          >
            <Cursor>
              <CursorPointer style={{ color: user.color }} />
              <CursorBody
                style={{
                  backgroundColor: user.color,
                  color: getContrastColor(user.color),
                }}
              >
                <CursorName>{user.name}</CursorName>
                {sentMessages.map((msg, idx) => (
                  <CursorMessage
                    key={msg.timestamp}
                    className={
                      idx < sentMessages.length - 1 ? "opacity-60" : ""
                    }
                  >
                    {msg.text}
                  </CursorMessage>
                ))}
                {isChatMode && (
                  <CursorMessage className="opacity-80 italic">
                    {currentMessage || (
                      <span className="opacity-60">type a message...</span>
                    )}
                    <span className="animate-pulse">|</span>
                  </CursorMessage>
                )}
                {!isChatMode && sentMessages.length === 0 && (
                  <CursorMessage className="opacity-60 text-[10px]">
                    press{" "}
                    <kbd className="px-1 py-0.5 rounded bg-black/20 mx-0.5">
                      /
                    </kbd>{" "}
                    to chat
                  </CursorMessage>
                )}
              </CursorBody>
            </Cursor>
          </div>
        </div>
      )}

      {/* Desktop chat mode indicator */}
      {!isTouchDevice && isChatMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-lg bg-secondary/95 backdrop-blur-md border border-border/50 shadow-lg text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-3 duration-300 z-50">
          {hasOthersOnSamePath ? (
            <>
              <span className="font-medium">Chat mode</span> · Type to chat ·{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-background border text-xs">
                Enter
              </kbd>{" "}
              to send ·{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-background border text-xs">
                Esc
              </kbd>{" "}
              to exit
            </>
          ) : (
            <>
              <span className="font-medium">No one else here</span> · Wait for
              others to join ·{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-background border text-xs">
                Esc
              </kbd>{" "}
              to exit
            </>
          )}
        </div>
      )}

      {/* Mobile floating chat button */}
      {isTouchDevice && !isChatMode && hasOthersOnSamePath && (
        <button
          onClick={() => setIsChatMode(true)}
          className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Open chat"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      )}

      {/* Mobile chat modal */}
      {isTouchDevice && isChatMode && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 bg-background/95 backdrop-blur-md border-t border-border shadow-lg animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <button
              onClick={() => {
                setIsChatMode(false);
                setCurrentMessage("");
              }}
              className="p-2 rounded-full hover:bg-accent transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && currentMessage.trim()) {
                  handleMobileSend();
                }
              }}
              placeholder={
                hasOthersOnSamePath
                  ? "Type a message..."
                  : "No one else here yet..."
              }
              maxLength={100}
              className="flex-1 px-4 py-2 rounded-lg bg-accent/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleMobileSend}
              disabled={!currentMessage.trim()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              Send
            </button>
          </div>
          {/* Show recent messages */}
          {sentMessages.length > 0 && (
            <div className="mt-3 max-w-lg mx-auto space-y-1">
              {sentMessages.map((msg) => (
                <div
                  key={msg.timestamp}
                  className="text-xs text-muted-foreground px-2"
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: user.color }}
                  />
                  {msg.text}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function getContrastColor(hexColor: string): string {
  // Handle edge cases
  if (!hexColor || typeof hexColor !== 'string') {
    return "#ffffff";
  }

  const hex = hexColor.replace("#", "");

  // Validate hex format
  if (hex.length !== 6) {
    return "#ffffff";
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Check for NaN
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return "#ffffff";
  }

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Use threshold of 0.6 to prefer white text (more readable on colored backgrounds)
  return luminance > 0.6 ? "#000000" : "#ffffff";
}
