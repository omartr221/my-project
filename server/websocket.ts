import { WebSocketServer, WebSocket } from "ws";

export function setupWebSocket(wss: WebSocketServer) {
  const clients = new Set<WebSocket>();

  wss.on("connection", (ws: WebSocket) => {
    console.log("🔗 WebSocket client connected");
    clients.add(ws);

    ws.on("message", (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("📨 WebSocket message received:", data);
        
        // Broadcast to all clients except sender
        clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error("❌ WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      console.log("🔌 WebSocket client disconnected");
      clients.delete(ws);
    });

    ws.on("error", (error) => {
      console.error("❌ WebSocket error:", error);
      clients.delete(ws);
    });
  });

  // Broadcast function for server use
  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  return { broadcast };
}