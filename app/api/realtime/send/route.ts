import { NextRequest, NextResponse } from "next/server";
import {
  updateCursor,
  removeCursor,
  getCursors,
  type CursorPosition,
} from "@/lib/realtime-store";

export const dynamic = "force-dynamic";

const MAX_MESSAGES_PER_CURSOR = 3;

interface CursorPayload {
  userId: string;
  name: string;
  color: string;
  x: number;
  y: number;
  currentTyping?: string; // Text being typed (not yet sent)
  path: string; // Current route path
}

interface SendMessagePayload {
  userId: string;
  message: string;
}

interface LeavePayload {
  userId: string;
}

type SendRequest =
  | { type: "cursor"; payload: CursorPayload }
  | { type: "send_message"; payload: SendMessagePayload }
  | { type: "leave"; payload: LeavePayload };

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SendRequest;

    switch (body.type) {
      case "cursor": {
        // Get existing cursor to preserve messages
        const existingCursors = getCursors();
        const existingCursor = existingCursors.find(
          (c) => c.userId === body.payload.userId
        );

        const cursor: CursorPosition = {
          userId: body.payload.userId,
          name: body.payload.name,
          color: body.payload.color,
          x: body.payload.x,
          y: body.payload.y,
          lastUpdate: Date.now(),
          currentTyping: body.payload.currentTyping,
          messages: existingCursor?.messages || [],
          path: body.payload.path,
        };
        updateCursor(cursor);
        return NextResponse.json({ success: true });
      }

      case "send_message": {
        // Find existing cursor and add message to its history
        const existingCursors = getCursors();
        const existingCursor = existingCursors.find(
          (c) => c.userId === body.payload.userId
        );

        if (existingCursor) {
          const newMessage = {
            text: body.payload.message,
            timestamp: Date.now(),
          };

          // Add new message and keep only last 3
          const messages = [...existingCursor.messages, newMessage].slice(
            -MAX_MESSAGES_PER_CURSOR
          );

          const updatedCursor: CursorPosition = {
            ...existingCursor,
            currentTyping: undefined, // Clear typing after sending
            messages,
            lastUpdate: Date.now(),
          };
          updateCursor(updatedCursor);
        }
        return NextResponse.json({ success: true });
      }

      case "leave": {
        removeCursor(body.payload.userId);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid event type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing realtime event:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
