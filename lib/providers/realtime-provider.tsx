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
import { REALTIME_CONSTANTS } from "@shared/constants";

const {
  MESSAGE_EXPIRY_MS,
  STORAGE_KEY,
  RECONNECT_INITIAL_MS,
  RECONNECT_MAX_MS,
} = REALTIME_CONSTANTS;

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
    currentTyping?: string,
    scrollX?: number,
    scrollY?: number
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

// Pending cursor update type
interface PendingCursorUpdate {
  percentX: number;
  percentY: number;
  anchor?: CursorAnchor;
  currentTyping?: string;
  scrollX: number;
  scrollY: number;
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserIdentity | null>(null);
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Fix #5: Queue pending updates when disconnected
  const pendingCursorUpdateRef = useRef<PendingCursorUpdate | null>(null);
  const pendingMessagesRef = useRef<string[]>([]);

  // Fix #8: Exponential backoff for reconnection
  const retryCountRef = useRef(0);

  // Initialize user identity
  useEffect(() => {
    setUser(getOrCreateIdentity());
  }, []);

  const connect = useCallback(() => {
    if (!user) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Determine WS URL
    let wsUrl = process.env.NEXT_PUBLIC_WS_URL;

    // If running on localhost, prefer local backend unless explicitly overridden
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      wsUrl = "ws://localhost:8787/ws";
    }

    // Fallback
    if (!wsUrl) {
      wsUrl = "ws://localhost:8787/ws";
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected to", wsUrl);
      setIsConnected(true);
      retryCountRef.current = 0; // Reset retry count on successful connection

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

      // Flush pending cursor update (Fix #5: race condition)
      if (pendingCursorUpdateRef.current) {
        const { percentX, percentY, anchor, currentTyping, scrollX, scrollY } =
          pendingCursorUpdateRef.current;
        ws.send(
          JSON.stringify({
            type: "cursor",
            payload: {
              userId: user.userId,
              name: user.name,
              color: user.color,
              percentX,
              percentY,
              scrollX,
              scrollY,
              anchor,
              currentTyping: currentTyping || undefined,
              path: pathname,
              messages: [],
              lastUpdate: Date.now(),
            },
          })
        );
        pendingCursorUpdateRef.current = null;
      }

      // Flush pending messages (Fix #5: race condition)
      pendingMessagesRef.current.forEach((message) => {
        ws.send(
          JSON.stringify({
            type: "message",
            payload: {
              id: crypto.randomUUID(),
              userId: user.userId,
              name: user.name,
              text: message,
              color: user.color,
              timestamp: Date.now(),
            },
          })
        );
      });
      pendingMessagesRef.current = [];
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
                  return { ...c, messages: newMessages.slice(-3) };
                }
                return c;
              })
            );
            break;
          case "user_join":
            // User will be added on first cursor update
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

      // Fix #8: Exponential backoff for reconnection
      const delay = Math.min(
        RECONNECT_INITIAL_MS * Math.pow(2, retryCountRef.current),
        RECONNECT_MAX_MS
      );
      retryCountRef.current++;
      console.log(
        `WebSocket disconnected, reconnecting in ${delay}ms (attempt ${retryCountRef.current})`
      );
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [user, pathname]);

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
      currentTyping?: string,
      scrollX?: number,
      scrollY?: number
    ) => {
      // Update activity time
      lastActivityRef.current = Date.now();

      if (!user) return;

      // Fix #5: Queue update if not connected (will be flushed on reconnect)
      if (
        !isConnected ||
        !wsRef.current ||
        wsRef.current.readyState !== WebSocket.OPEN
      ) {
        pendingCursorUpdateRef.current = {
          percentX,
          percentY,
          anchor,
          currentTyping,
          scrollX: scrollX ?? 0,
          scrollY: scrollY ?? 0,
        };
        connect();
        return;
      }

      const payload = {
        userId: user.userId,
        name: user.name,
        color: user.color,
        percentX,
        percentY,
        scrollX: scrollX ?? 0,
        scrollY: scrollY ?? 0,
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
    [user, isConnected, pathname, connect]
  );

  // Send message to server
  const sendMessage = useCallback(
    (message: string) => {
      // Update activity time
      lastActivityRef.current = Date.now();

      if (!user) return;

      // Fix #5: Queue message if not connected (will be flushed on reconnect)
      if (
        !isConnected ||
        !wsRef.current ||
        wsRef.current.readyState !== WebSocket.OPEN
      ) {
        pendingMessagesRef.current.push(message);
        connect();
        return;
      }

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
    [user, isConnected, connect]
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
