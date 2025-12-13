"use client";

import { forwardRef, memo } from "react";
import {
  Cursor,
  CursorPointer,
  CursorBody,
  CursorName,
  CursorMessage,
} from "@/components/kibo-ui/cursor";
import { getContrastColor } from "./utils";

interface UserCursorProps {
  color: string;
  name: string;
  messages: Array<{ text: string; timestamp: number }>;
  isChatMode: boolean;
  currentMessage: string;
  position: { x: number; y: number };
}

export const UserCursor = memo(
  forwardRef<HTMLDivElement, UserCursorProps>(function UserCursor(
    { color, name, messages, isChatMode, currentMessage, position },
    ref
  ) {
    const contrast = getContrastColor(color);

    return (
      <div
        className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
        aria-hidden="true"
      >
        <div
          ref={ref}
          className="absolute will-change-transform"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          }}
        >
          <Cursor>
            <CursorPointer style={{ color }} />
            <CursorBody style={{ backgroundColor: color, color: contrast }}>
              <CursorName>{name}</CursorName>
              {messages.map((msg, idx) => (
                <CursorMessage
                  key={msg.timestamp}
                  className={idx < messages.length - 1 ? "opacity-60" : ""}
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
              {!isChatMode && messages.length === 0 && (
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
    );
  })
);
