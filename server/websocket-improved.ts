import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/api/ws',
    perMessageDeflate: false,
    clientTracking: true
  });
  
  const clients = new Set<WebSocket>();

  wss.on("connection", (ws: WebSocket, req) => {
    console.log(`🔗 WebSocket client connected from ${req.socket.remoteAddress}`);
    clients.add(ws);

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to V-POWER TUNING'
    }));

    ws.on("message", (message) => {
      try {
        const messageStr = message.toString();
        
        // Skip invalid or empty messages
        if (!messageStr || messageStr.length === 0) {
          return;
        }

        const data = JSON.parse(messageStr);
        console.log("📨 WebSocket message received:", data.type || 'unknown');
        
        // Broadcast to all clients except sender
        clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            try {
              client.send(JSON.stringify(data));
            } catch (sendError) {
              console.error("❌ Error sending to client:", sendError);
              clients.delete(client);
            }
          }
        });
      } catch (error) {
        console.error("❌ WebSocket message parsing error:", error);
        // Don't close connection for parsing errors
      }
    });

    ws.on("close", (code, reason) => {
      console.log(`🔌 WebSocket client disconnected - Code: ${code}, Reason: ${reason?.toString()}`);
      clients.delete(ws);
    });

    ws.on("error", (error) => {
      console.error("❌ WebSocket connection error:", error.message);
      clients.delete(ws);
    });

    // Handle ping/pong for connection health
    ws.on("ping", () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.pong();
      }
    });
  });

  // Clean up dead connections periodically
  const cleanup = setInterval(() => {
    clients.forEach((client) => {
      if (client.readyState !== WebSocket.OPEN) {
        clients.delete(client);
      }
    });
  }, 30000); // Every 30 seconds

  // Broadcast function for server use
  const broadcast = (data: any) => {
    if (!data) return;
    
    const message = JSON.stringify(data);
    const deadClients = new Set<WebSocket>();
    
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error("❌ Broadcast error:", error);
          deadClients.add(client);
        }
      } else {
        deadClients.add(client);
      }
    });

    // Remove dead clients
    deadClients.forEach(client => clients.delete(client));
  };

  // Graceful shutdown
  const close = () => {
    clearInterval(cleanup);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.close(1000, 'Server shutdown');
      }
    });
    wss.close();
  };

  return { broadcast, close, clientCount: () => clients.size };
}