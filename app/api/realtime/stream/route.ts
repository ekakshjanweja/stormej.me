import { addClient, type RealtimeEvent } from "@/lib/realtime-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (event: RealtimeEvent) => {
        try {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch {
          // Client disconnected
        }
      };

      // Add this client to the broadcast list
      const cleanup = addClient(sendEvent);

      // Send a heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Handle client disconnect
      const checkClosed = setInterval(() => {
        try {
          // Try to send empty comment to check connection
          controller.enqueue(encoder.encode(""));
        } catch {
          clearInterval(heartbeat);
          clearInterval(checkClosed);
          cleanup();
        }
      }, 5000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
