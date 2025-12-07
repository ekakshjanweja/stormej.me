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

const MESSAGE_EXPIRY = 30000; // 30 seconds

export function LiveCursors() {
  const { cursors, user, pathname, sendCursorPosition, sendMessage } =
    useRealtime();

  // UI State
  const [isChatMode, setIsChatMode] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [sentMessages, setSentMessages] = useState<
    Array<{ text: string; timestamp: number }>
  >([]);

  // Use refs for positions to avoid re-renders on every mouse move
  const viewportPosRef = useRef({ x: 0, y: 0 }); // clientX, clientY
  const [displayPos, setDisplayPos] = useState({ x: 0, y: 0 }); // For rendering
  const lastSentRef = useRef({ x: 0, y: 0, scrollX: 0, scrollY: 0, time: 0 });
  const rafRef = useRef<number | null>(null);

  // Scroll position as state (for viewport bounds filtering)
  const [scroll, setScroll] = useState({ x: 0, y: 0 });

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

  // Unified position update function using RAF for smooth batching
  const updatePosition = useCallback(
    (
      viewportX: number,
      viewportY: number,
      scrollX: number,
      scrollY: number
    ) => {
      // Cancel any pending RAF
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        // Update display position (viewport-relative for rendering)
        setDisplayPos({ x: viewportX, y: viewportY });
        viewportPosRef.current = { x: viewportX, y: viewportY };

        // Calculate document-relative position for server
        const docX = viewportX + scrollX;
        const docY = viewportY + scrollY;

        // Throttle server updates (every 16ms = ~60fps)
        const now = Date.now();
        const last = lastSentRef.current;
        const posChanged =
          Math.abs(docX - last.x) > 1 ||
          Math.abs(docY - last.y) > 1 ||
          scrollX !== last.scrollX ||
          scrollY !== last.scrollY;

        if (posChanged && now - last.time >= 16) {
          lastSentRef.current = {
            x: docX,
            y: docY,
            scrollX,
            scrollY,
            time: now,
          };
          sendCursorPosition(
            docX,
            docY,
            isChatMode ? currentMessage : undefined
          );
        }
      });
    },
    [sendCursorPosition, isChatMode, currentMessage]
  );

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY, window.scrollX, window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [updatePosition]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      setScroll({ x: scrollX, y: scrollY });

      // Update position with current viewport pos + new scroll
      updatePosition(
        viewportPosRef.current.x,
        viewportPosRef.current.y,
        scrollX,
        scrollY
      );
    };

    // Set initial scroll
    setScroll({ x: window.scrollX, y: window.scrollY });

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [updatePosition]);

  // Heartbeat every 5 seconds
  useEffect(() => {
    const heartbeat = setInterval(() => {
      const { x, y } = viewportPosRef.current;
      if (x > 0 || y > 0) {
        const docX = x + window.scrollX;
        const docY = y + window.scrollY;
        sendCursorPosition(docX, docY, isChatMode ? currentMessage : undefined);
      }
    }, 5000);
    return () => clearInterval(heartbeat);
  }, [sendCursorPosition, isChatMode, currentMessage]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Enter chat mode with /
      if (e.key === "/" && !isTyping && !isChatMode) {
        e.preventDefault();
        e.stopPropagation();
        setIsChatMode(true);
        return;
      }

      // In chat mode, capture all keypresses
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
  }, [isChatMode, currentMessage, sendMessage]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!user) return null;

  // Viewport bounds
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;

  // Check if anyone else is on the same path (for showing your own cursor)
  const hasOthersOnSamePath = cursors.some(
    (cursor) => cursor.userId !== user.userId && cursor.path === pathname
  );

  // Filter cursors to only those visible in viewport (for rendering others)
  const visibleCursors = cursors.filter((cursor) => {
    if (cursor.userId === user.userId) return false;
    if (cursor.path !== pathname) return false;

    // Convert doc position to viewport position
    const viewportX = cursor.x - scroll.x;
    const viewportY = cursor.y - scroll.y;

    // Check if in viewport (with some margin for cursor size)
    return (
      viewportX >= -50 &&
      viewportX <= viewportWidth + 50 &&
      viewportY >= -50 &&
      viewportY <= viewportHeight + 50
    );
  });

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      aria-hidden="true"
    >
      {/* Other users' cursors */}
      {visibleCursors.map((cursor) => {
        // Convert to viewport position for display
        const x = cursor.x - scroll.x;
        const y = cursor.y - scroll.y;
        const hasContent = cursor.messages.length > 0 || cursor.currentTyping;

        return (
          <div
            key={cursor.userId}
            className="absolute will-change-transform"
            style={{
              transform: `translate3d(${x}px, ${y}px, 0)`,
              transition: "transform 80ms cubic-bezier(0.22, 1, 0.36, 1)",
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

      {/* Current user's cursor - only show if others on same page */}
      {hasOthersOnSamePath && (
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
                  className={idx < sentMessages.length - 1 ? "opacity-60" : ""}
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
      )}

      {/* Chat mode indicator */}
      {isChatMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-lg bg-secondary/95 backdrop-blur-md border border-border/50 shadow-lg text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-3 duration-300">
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
    </div>
  );
}

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
