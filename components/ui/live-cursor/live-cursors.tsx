"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRealtime } from "@/lib/providers/realtime-provider";
import { REALTIME_CONSTANTS } from "@shared/constants";

import { RemoteCursor } from "./remote-cursor";
import { UserCursor } from "./user-cursor";
import { ChatModeIndicator } from "./chat-mode-indicator";
import { MobileChatButton, MobileChatModal } from "./mobile-chat";
import { useCursorTracking } from "./use-cursor-tracking";
import {
  getActiveMessages,
  resolveAnchorPosition,
  isInViewport,
} from "./utils";

const { MESSAGE_EXPIRY_MS } = REALTIME_CONSTANTS;

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
  const [localScroll, setLocalScroll] = useState({ x: 0, y: 0 });

  // Refs
  const currentMessageRef = useRef(currentMessage);
  currentMessageRef.current = currentMessage;
  const userCursorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cursor tracking hook
  const { posRef } = useCursorTracking({
    isTouchDevice,
    isChatMode,
    currentMessage,
    sendCursorPosition,
    userCursorRef,
  });

  // Detect touch device & init scroll
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
    setLocalScroll({ x: window.scrollX, y: window.scrollY });
  }, []);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () =>
      setLocalScroll({ x: window.scrollX, y: window.scrollY });
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Focus input on mobile chat open
  useEffect(() => {
    if (isChatMode && isTouchDevice && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatMode, isTouchDevice]);

  // Clean up expired messages
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setSentMessages((prev) =>
        prev.filter((msg) => now - msg.timestamp < MESSAGE_EXPIRY_MS)
      );
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Send message helper
  const addMessage = useCallback(
    (text: string) => {
      sendMessage(text);
      setSentMessages((prev) => {
        const now = Date.now();
        const active = prev.filter(
          (msg) => now - msg.timestamp < MESSAGE_EXPIRY_MS
        );
        return [...active.slice(-2), { text, timestamp: now }];
      });
      setCurrentMessage("");
    },
    [sendMessage]
  );

  // Keyboard handler (desktop only)
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

      if (!isChatMode) return;

      e.preventDefault();
      e.stopPropagation();

      if (e.key === "Escape") {
        setCurrentMessage("");
        setIsChatMode(false);
      } else if (e.key === "Enter" && currentMessageRef.current.trim()) {
        addMessage(currentMessageRef.current.trim());
      } else if (e.key === "Backspace") {
        setCurrentMessage((prev) => prev.slice(0, -1));
      } else if (
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        currentMessageRef.current.length < 100
      ) {
        setCurrentMessage((prev) => prev + e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isChatMode, isTouchDevice, addMessage]);

  // Memoized computations
  const now = Date.now();

  const visibleCursors = useMemo(() => {
    if (!user) return [];
    return cursors
      .filter((c) => c.userId !== user.userId && c.path === pathname)
      .map((cursor) => {
        let pos: { x: number; y: number } | null = null;

        if (cursor.anchor) {
          const anchorPos = resolveAnchorPosition(cursor.anchor);
          if (anchorPos && isInViewport(anchorPos.x, anchorPos.y)) {
            pos = anchorPos;
          }
        }

        if (!pos) {
          const x =
            cursor.percentX * window.innerWidth +
            (cursor.scrollX ?? 0) -
            localScroll.x;
          const y =
            cursor.percentY * window.innerHeight +
            (cursor.scrollY ?? 0) -
            localScroll.y;
          if (isInViewport(x, y)) pos = { x, y };
        }

        return { ...cursor, resolvedPos: pos };
      })
      .filter((c) => c.resolvedPos !== null) as Array<
      (typeof cursors)[0] & { resolvedPos: { x: number; y: number } }
    >;
  }, [cursors, user, pathname, localScroll]);

  const hasOthersOnSamePath = Boolean(
    visibleCursors.length > 0 ||
      (user &&
        cursors.some((c) => c.userId !== user.userId && c.path === pathname))
  );

  const activeUserMessages = useMemo(
    () => getActiveMessages(sentMessages, now),
    [sentMessages, now]
  );
  const shouldHideCursor = !isTouchDevice && hasOthersOnSamePath;

  if (!user) return null;

  return (
    <>
      {shouldHideCursor && <style>{`* { cursor: none !important; }`}</style>}

      {/* Other users' cursors */}
      <div
        className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
        aria-hidden="true"
      >
        {visibleCursors.map((cursor) => (
          <RemoteCursor key={cursor.userId} cursor={cursor} now={now} />
        ))}
      </div>

      {/* Current user's cursor */}
      {!isTouchDevice && hasOthersOnSamePath && (
        <UserCursor
          ref={userCursorRef}
          color={user.color}
          name={user.name}
          messages={activeUserMessages}
          isChatMode={isChatMode}
          currentMessage={currentMessage}
          position={posRef.current}
        />
      )}

      {/* Desktop chat mode indicator */}
      {!isTouchDevice && isChatMode && (
        <ChatModeIndicator hasOthersOnSamePath={hasOthersOnSamePath} />
      )}

      {/* Mobile chat button */}
      {isTouchDevice && !isChatMode && hasOthersOnSamePath && (
        <MobileChatButton onClick={() => setIsChatMode(true)} />
      )}

      {/* Mobile chat modal */}
      {isTouchDevice && isChatMode && (
        <MobileChatModal
          ref={inputRef}
          currentMessage={currentMessage}
          onMessageChange={setCurrentMessage}
          onSend={() =>
            currentMessage.trim() && addMessage(currentMessage.trim())
          }
          onClose={() => {
            setIsChatMode(false);
            setCurrentMessage("");
          }}
          hasOthersOnSamePath={hasOthersOnSamePath}
          messages={activeUserMessages}
          userColor={user.color}
        />
      )}
    </>
  );
}
