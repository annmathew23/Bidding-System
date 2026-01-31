import http from "http";
import app from "./app.js";
import { Server } from "socket.io";

// 1. Create HTTP server from Express app
const httpServer = http.createServer(app);

// 2. Attach Socket.io to the HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// 3. Socket connection
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// 4. Start server (Render needs process.env.PORT)
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
