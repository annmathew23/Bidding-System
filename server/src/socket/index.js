import { registerBidHandlers } from "./bid.handlers.js";

export function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    registerBidHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}
