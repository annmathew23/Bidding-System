import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { setupSocket } from "./socket/index.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setupSocket(io);

server.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
