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
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize user identity
  useEffect(() => {
    setUser(getOrCreateIdentity());
  }, []);

  const connect = useCallback(() => {
    if (!user) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Default to localhost:8787 for dev if env var is not set
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8787/ws";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Announce join
      ws.send(
        JSON.stringify({
          type: "user_join",
          payload: { userId: user.userId, name: user.name, color: user.color },
        })
      );
    };

    ws.onmessage = (event) => {
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
          case "message":
            // Messages are attached to cursors in the backend state,
            // but we might receive them as separate events too.
            // The backend broadcasts 'message' type.
            // We need to find the cursor and update its messages.
            setCursors((prev) =>
              prev.map((c) => {
                if (c.userId === data.payload.userId) {
                  const newMessages = [
                    ...c.messages,
                    {
                      text: data.payload.text,
                      timestamp: data.payload.timestamp,
                    },
                  ];
                  return { ...c, messages: newMessages.slice(-3) }; // Keep last 3
                }
                return c;
              })
            );
            break;
          case "user_join":
            // We don't need to do much, the next cursor update will add them,
            // but we can ensure they exist?
            // Actually, 'user_join' payload in my backend implementation just has basic info.
            // The backend 'init' sends full cursor objects.
            // Let's just wait for a cursor update or handle it if we want to show a notification.
            break;
          case "user_leave":
            setCursors((prev) =>
              prev.filter((c) => c.userId !== data.payload.userId)
            );
            break;
        }
      } catch (error) {
        console.error("Error parsing WS event:", error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      // Reconnect after 3s
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [user]);

  // Connect to WebSocket
  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

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

  // Send cursor position to server
  const sendCursorPosition = useCallback(
    (
      percentX: number,
      percentY: number,
      anchor?: CursorAnchor,
      currentTyping?: string
    ) => {
      if (!user || !isConnected || !wsRef.current) return;

      const payload = {
        userId: user.userId,
        name: user.name,
        color: user.color,
        percentX,
        percentY,
        anchor,
        currentTyping: currentTyping || undefined,
        path: pathname,
        messages: [], // Backend handles messages history
        lastUpdate: Date.now(),
      };

      wsRef.current.send(
        JSON.stringify({
          type: "cursor",
          payload,
        })
      );
    },
    [user, isConnected, pathname]
  );

  // Send message to server
  const sendMessage = useCallback(
    (message: string) => {
      if (!user || !isConnected || !wsRef.current) return;

      const payload = {
        id: crypto.randomUUID(),
        userId: user.userId,
        name: user.name,
        text: message,
        color: user.color,
        timestamp: Date.now(),
      };

      wsRef.current.send(
        JSON.stringify({
          type: "message",
          payload,
        })
      );
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
