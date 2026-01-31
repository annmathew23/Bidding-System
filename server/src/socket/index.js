import { registerBidPlacedHandler } from "./bid.handlers.js";

export default function registerBidHandlers(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    registerBidPlacedHandler(io, socket);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}
