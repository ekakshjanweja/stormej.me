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
import { LiveCursors } from "@/components/ui/live-cursor/live-cursors";
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
  PING_INTERVAL_MS,
  VISIBILITY_RECONNECT_DELAY_MS,
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

  // Queue pending updates when disconnected
  const pendingCursorUpdateRef = useRef<PendingCursorUpdate | null>(null);
  const pendingMessagesRef = useRef<string[]>([]);

  // Exponential backoff for reconnection
  const retryCountRef = useRef(0);

  // Track connection state to prevent duplicate connections
  const isConnectingRef = useRef(false);

  // Ping interval ref
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timeout for visibility debounce
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use ref for pathname to avoid callback recreation
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // Track if tab is visible
  const isVisibleRef = useRef(true);

  // Track if browser is online
  const isOnlineRef = useRef(true);

  // Initialize user identity
  useEffect(() => {
    const identity = getOrCreateIdentity();
    // Append session ID to make userId unique per tab
    // This prevents cursor conflicts when opening multiple tabs
    const sessionUserId = `${identity.userId}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;
    setUser({ ...identity, userId: sessionUserId });
  }, []);

  // Helper to get WebSocket URL
  const getWsUrl = useCallback(() => {
    let wsUrl = process.env.NEXT_PUBLIC_WS_URL;

    // If running on localhost, prefer local backend unless explicitly overridden
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      wsUrl = "ws://localhost:8787/ws";
    }

    // Fallback
    if (!wsUrl) {
      wsUrl = "ws://localhost:8787/ws";
    }

    return wsUrl;
  }, []);

  // Cleanup function for connection resources
  const cleanup = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (visibilityTimeoutRef.current) {
      clearTimeout(visibilityTimeoutRef.current);
      visibilityTimeoutRef.current = null;
    }
  }, []);

  // Disconnect function - gracefully close connection
  const disconnect = useCallback(
    (sendLeave = false) => {
      cleanup();
      isConnectingRef.current = false;

      if (wsRef.current) {
        // Send user_leave before closing if requested and connection is open
        if (sendLeave && wsRef.current.readyState === WebSocket.OPEN && user) {
          try {
            wsRef.current.send(
              JSON.stringify({
                type: "user_leave",
                payload: { userId: user.userId },
              })
            );
          } catch {
            // Ignore send errors during disconnect
          }
        }

        // Remove event handlers to prevent reconnection attempts
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }

      setIsConnected(false);
    },
    [cleanup, user]
  );

  const connect = useCallback(() => {
    if (!user) return;

    // Prevent duplicate connections
    if (isConnectingRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    // Don't connect if tab is hidden or browser is offline
    if (!isVisibleRef.current || !isOnlineRef.current) return;

    isConnectingRef.current = true;
    const wsUrl = getWsUrl();

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected to", wsUrl);
      setIsConnected(true);
      isConnectingRef.current = false;
      retryCountRef.current = 0; // Reset retry count on successful connection

      // Clear any pending reconnects/pings but NOT visibility timeout
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);

      // Announce join
      ws.send(
        JSON.stringify({
          type: "user_join",
          payload: { userId: user.userId, name: user.name, color: user.color },
        })
      );

      // Start ping interval to keep connection alive
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({ type: "ping" }));
          } catch {
            // Connection might be stale, force reconnect
            ws.close();
          }
        }
      }, PING_INTERVAL_MS);

      // Flush pending cursor update
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
              path: pathnameRef.current,
              messages: [],
              lastUpdate: Date.now(),
            },
          })
        );
        pendingCursorUpdateRef.current = null;
      }

      // Flush pending messages
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
            // Only add message to OTHER users' cursors, not our own
            // (we handle our own messages via sentMessages state in live-cursors.tsx)
            if (data.payload.userId !== user?.userId) {
              setCursors((prev) =>
                prev.map((c) => {
                  if (c.userId === data.payload.userId) {
                    // Check if message already exists (deduplicate by timestamp)
                    const messageExists = c.messages.some(
                      (msg) => msg.timestamp === data.payload.timestamp
                    );
                    if (messageExists) {
                      return c; // Don't add duplicate
                    }

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
            }
            break;
          case "user_join":
            // User will be added on first cursor update
            break;
          case "user_leave":
            setCursors((prev) =>
              prev.filter((c) => c.userId !== data.payload.userId)
            );
            break;
          case "pong":
            // Server acknowledged our ping, connection is healthy
            break;
        }
      } catch (error) {
        console.error("Error parsing WS event:", error);
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      wsRef.current = null;
      isConnectingRef.current = false;

      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      // Don't clear visibility timeout here as it might be controlling this

      // Don't reconnect if tab is hidden or browser is offline
      if (!isVisibleRef.current || !isOnlineRef.current) {
        console.log(
          "WebSocket disconnected, not reconnecting (tab hidden or offline)"
        );
        return;
      }

      // Don't reconnect if this was a clean close (code 1000)
      if (event.code === 1000) {
        console.log("WebSocket closed cleanly");
        return;
      }

      // Exponential backoff for reconnection
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
      isConnectingRef.current = false;
      ws.close();
    };
  }, [user, getWsUrl, cleanup]);

  // Connect to WebSocket
  useEffect(() => {
    connect();
    return () => {
      disconnect(false);
    };
  }, [connect, disconnect]);

  // Handle visibility change - disconnect when hidden, reconnect when visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      isVisibleRef.current = isVisible;

      // Clear any existing visibility timeout
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
        visibilityTimeoutRef.current = null;
      }

      if (isVisible) {
        // Tab became visible - reconnect after a short delay
        visibilityTimeoutRef.current = setTimeout(() => {
          if (isVisibleRef.current && !wsRef.current) {
            retryCountRef.current = 0; // Reset retry count
            connect();
          }
        }, VISIBILITY_RECONNECT_DELAY_MS);
      } else {
        // Tab became hidden - disconnect after a short delay
        visibilityTimeoutRef.current = setTimeout(() => {
          if (!isVisibleRef.current) {
            disconnect(true);
          }
        }, VISIBILITY_RECONNECT_DELAY_MS);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [connect, disconnect]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log("Browser came online");
      isOnlineRef.current = true;
      retryCountRef.current = 0; // Reset retry count
      connect();
    };

    const handleOffline = () => {
      console.log("Browser went offline");
      isOnlineRef.current = false;
      // Cancel any pending reconnection attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial state
    isOnlineRef.current = navigator.onLine;

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [connect]);

  // Handle page unload - send user_leave before closing
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN && user) {
        // Use sendBeacon for reliability during page unload
        // Fall back to sync WebSocket send if sendBeacon isn't available
        const payload = JSON.stringify({
          type: "user_leave",
          payload: { userId: user.userId },
        });

        try {
          wsRef.current.send(payload);
        } catch {
          // Ignore errors during unload
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
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

      // Queue update if not connected (will be flushed on reconnect)
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
        path: pathnameRef.current,
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
    [user, isConnected, connect]
  );

  // Send message to server
  const sendMessage = useCallback(
    (message: string) => {
      // Update activity time
      lastActivityRef.current = Date.now();

      if (!user) return;

      // Queue message if not connected (will be flushed on reconnect)
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
