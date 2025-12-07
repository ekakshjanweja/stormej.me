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

  // UI State (managed locally)
  const [isChatMode, setIsChatMode] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [localCursorPos, setLocalCursorPos] = useState({ x: 0, y: 0 });
  const [sentMessages, setSentMessages] = useState<
    Array<{ text: string; timestamp: number }>
  >([]);

  const lastUpdateRef = useRef<number>(0);
  const throttleMs = 16; // ~60fps for smoother updates

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

  // Track last sent position for heartbeat
  const lastSentPosRef = useRef({ x: 0, y: 0 });

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const now = Date.now();

      // Always update local cursor position for display
      setLocalCursorPos({ x: e.clientX, y: e.clientY });

      if (now - lastUpdateRef.current < throttleMs) return;
      lastUpdateRef.current = now;

      // Calculate position as percentage of viewport
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;

      // Store last sent position for heartbeat
      lastSentPosRef.current = { x, y };

      // Pass current message so other users can see it while typing
      sendCursorPosition(x, y, isChatMode ? currentMessage : undefined);
    },
    [sendCursorPosition, isChatMode, currentMessage]
  );

  // Heartbeat: send cursor position every 5 seconds to keep alive
  useEffect(() => {
    const heartbeat = setInterval(() => {
      const { x, y } = lastSentPosRef.current;
      if (x > 0 || y > 0) {
        sendCursorPosition(x, y, isChatMode ? currentMessage : undefined);
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
          // Exit chat mode, clear message
          setCurrentMessage("");
          setIsChatMode(false);
          return;
        }

        if (e.key === "Enter" && currentMessage.trim()) {
          // Send message and add to local sent messages
          const messageText = currentMessage.trim();
          sendMessage(messageText);
          setSentMessages((prev) => [
            ...prev.slice(-2), // Keep last 2 + new = 3 max
            { text: messageText, timestamp: Date.now() },
          ]);
          setCurrentMessage("");
          return;
        }

        if (e.key === "Backspace") {
          setCurrentMessage((prev) => prev.slice(0, -1));
          return;
        }

        // Only add printable characters
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          if (currentMessage.length < 100) {
            // Limit message length
            setCurrentMessage((prev) => prev + e.key);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isChatMode, currentMessage, sendMessage]);

  // Mouse move listener
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  if (!user) return null;

  // Filter cursors: only show those on same path and not current user
  // Cursors are removed when user closes browser (via leave event)
  const activeCursors = cursors.filter(
    (cursor) => cursor.userId !== user.userId && cursor.path === pathname
  );

  // Check if there's anyone else on the same page
  const hasOthersOnSamePage = activeCursors.length > 0;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      aria-hidden="true"
    >
      {/* Other users' cursors */}
      {activeCursors.map((cursor) => {
        const x =
          (cursor.x / 100) *
          (typeof window !== "undefined" ? window.innerWidth : 0);
        const y =
          (cursor.y / 100) *
          (typeof window !== "undefined" ? window.innerHeight : 0);

        const hasContent = cursor.messages.length > 0 || cursor.currentTyping;

        return (
          <div
            key={cursor.userId}
            className="absolute transition-all duration-75 ease-out"
            style={{
              left: x,
              top: y,
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
                  {/* Show last 3 messages */}
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
                  {/* Show current typing */}
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

      {/* Current user's cursor - only show if others are on same page */}
      {hasOthersOnSamePage && (
        <div
          className="absolute transition-all duration-75 ease-out"
          style={{
            left: localCursorPos.x,
            top: localCursorPos.y,
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
              {/* Show sent messages */}
              {sentMessages.map((msg, idx) => (
                <CursorMessage
                  key={msg.timestamp}
                  className={idx < sentMessages.length - 1 ? "opacity-60" : ""}
                >
                  {msg.text}
                </CursorMessage>
              ))}
              {/* Show typing indicator in chat mode */}
              {isChatMode && (
                <CursorMessage className="opacity-80 italic">
                  {currentMessage || (
                    <span className="opacity-60">type a message...</span>
                  )}
                  <span className="animate-pulse">|</span>
                </CursorMessage>
              )}
              {/* Show hint if not in chat mode and no messages */}
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
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-secondary/90 backdrop-blur-sm border border-border text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2">
          {hasOthersOnSamePage ? (
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
