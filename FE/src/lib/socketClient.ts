import { io, Socket } from "socket.io-client";

// Get base URL (e.g., http://localhost:3000)
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false, // We'll connect manually when needed
    });

    socket.on("connect", () => {
      console.log("[Socket.io] Connected");
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.io] Disconnected: ${reason}`);
    });

    socket.on("connect_error", (err) => {
      console.error(`[Socket.io] Connection error: ${err.message}`);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
