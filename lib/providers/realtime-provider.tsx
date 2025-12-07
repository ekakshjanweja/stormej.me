"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { LiveCursors } from "@/components/live-cursors";
import {
  type CursorPosition,
  type CursorAnchor,
  type RealtimeEvent,
  generateRandomName,
  generateRandomColor,
  generateUserId,
} from "@/lib/realtime-store";

interface UserIdentity {
  userId: string;
  name: string;
  color: string;
}

interface RealtimeContextValue {
  cursors: CursorPosition[];
  user: UserIdentity | null;
  pathname: string;
  sendCursorPosition: (
    percentX: number,
    percentY: number,
    anchor?: CursorAnchor,
    currentTyping?: string
  ) => void;
  sendMessage: (message: string) => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}

const STORAGE_KEY = "stormej.realtime.identity";
const MESSAGE_EXPIRY_MS = 30000; // 30 seconds

function getOrCreateIdentity(): UserIdentity {
  if (typeof window === "undefined") {
    return {
      userId: generateUserId(),
      name: generateRandomName(),
      color: generateRandomColor(),
    };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid stored data, create new
    }
  }

  const identity: UserIdentity = {
    userId: generateUserId(),
    name: generateRandomName(),
    color: generateRandomColor(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  return identity;
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserIdentity | null>(null);
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Initialize user identity
  useEffect(() => {
    setUser(getOrCreateIdentity());
  }, []);

  // Connect to SSE stream
  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource("/api/realtime/stream");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as RealtimeEvent;

        switch (data.type) {
          case "init":
            setCursors(data.payload.cursors);
            break;
          case "cursor":
            setCursors((prev) => {
              const filtered = prev.filter(
                (c) => c.userId !== data.payload.userId
              );
              return [...filtered, data.payload];
            });
            break;
          case "user_leave":
            setCursors((prev) =>
              prev.filter((c) => c.userId !== data.payload.userId)
            );
            break;
        }
      } catch (error) {
        console.error("Error parsing SSE event:", error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    // Notify server when leaving
    const handleBeforeUnload = () => {
      if (user) {
        navigator.sendBeacon(
          "/api/realtime/send",
          JSON.stringify({ type: "leave", payload: { userId: user.userId } })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      eventSource.close();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user]);

  // Clean up expired messages from cursors
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCursors((prev) =>
        prev.map((cursor) => {
          const validMessages = cursor.messages.filter(
            (msg) => now - msg.timestamp < MESSAGE_EXPIRY_MS
          );

          if (validMessages.length !== cursor.messages.length) {
            return { ...cursor, messages: validMessages };
          }
          return cursor;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Send cursor position to server (fire-and-forget for low latency)
  const sendCursorPosition = useCallback(
    (
      percentX: number,
      percentY: number,
      anchor?: CursorAnchor,
      currentTyping?: string
    ) => {
      if (!user || !isConnected) return;

      // Fire-and-forget: don't await, just send
      fetch("/api/realtime/send", {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cursor",
          payload: {
            userId: user.userId,
            name: user.name,
            color: user.color,
            percentX,
            percentY,
            anchor,
            currentTyping: currentTyping || undefined,
            path: pathname,
          },
        }),
      }).catch(() => {
        // Silently fail for cursor updates
      });
    },
    [user, isConnected, pathname]
  );

  // Send message to server
  const sendMessage = useCallback(
    async (message: string) => {
      if (!user || !isConnected) return;

      try {
        await fetch("/api/realtime/send", {
          method: "POST",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "send_message",
            payload: {
              userId: user.userId,
              message,
            },
          }),
        });
      } catch {
        // Silently fail
      }
    },
    [user, isConnected]
  );

  const contextValue: RealtimeContextValue = {
    cursors,
    user,
    pathname,
    sendCursorPosition,
    sendMessage,
  };

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
      {user && <LiveCursors />}
    </RealtimeContext.Provider>
  );
}
