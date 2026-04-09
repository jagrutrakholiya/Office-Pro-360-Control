import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (socket?.connected) return socket;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const baseUrl = apiUrl.replace(/\/api$/, "");
  const token = typeof window !== "undefined" ? localStorage.getItem("cp_token") : null;

  if (!token) return null;

  // Parse token to get userId
  let userId: string | null = null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    userId = payload.id || payload.userId || payload._id;
  } catch {}

  socket = io(baseUrl, {
    auth: { userId, token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 3000,
    reconnectionAttempts: 10,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export default getSocket;
