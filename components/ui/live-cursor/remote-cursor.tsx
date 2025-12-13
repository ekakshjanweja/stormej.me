"use client";

import { memo } from "react";
import {
  Cursor,
  CursorPointer,
  CursorBody,
  CursorName,
  CursorMessage,
} from "@/components/kibo-ui/cursor";
import { getContrastColor, getActiveMessages } from "./utils";
import type { CursorPosition } from "@/lib/realtime-store";

interface RemoteCursorProps {
  cursor: CursorPosition & { resolvedPos: { x: number; y: number } };
  now: number;
}

export const RemoteCursor = memo(function RemoteCursor({
  cursor,
  now,
}: RemoteCursorProps) {
  const { x, y } = cursor.resolvedPos;
  const activeMessages = getActiveMessages(cursor.messages, now);
  const hasContent = activeMessages.length > 0 || cursor.currentTyping;
  const contrast = getContrastColor(cursor.color);

  return (
    <div
      className="absolute will-change-transform"
      style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}
    >
      <Cursor>
        <CursorPointer style={{ color: cursor.color }} />
        <CursorBody
          style={{ backgroundColor: cursor.color, color: contrast }}
          className={hasContent ? "" : "opacity-80"}
        >
          <CursorName>{cursor.name}</CursorName>
          {activeMessages.map((msg, idx) => (
            <CursorMessage
              key={msg.timestamp}
              className={idx < activeMessages.length - 1 ? "opacity-60" : ""}
            >
              {msg.text}
            </CursorMessage>
          ))}
          {cursor.currentTyping && (
            <CursorMessage className="opacity-80 italic">
              typing<span className="animate-pulse">...</span>
            </CursorMessage>
          )}
        </CursorBody>
      </Cursor>
    </div>
  );
});
