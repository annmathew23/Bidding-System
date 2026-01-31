import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import registerBidHandlers from "./socket/index.js"; 

const httpServer = http.createServer(app);

const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN || "").trim();

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});


registerBidHandlers(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
