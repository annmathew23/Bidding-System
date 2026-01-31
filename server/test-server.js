import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ connected as", socket.id);

  // Try a bid: itemId "1", bidderId "abin", amount 60
  socket.emit(
    "BID_PLACED",
    { itemId: "1", bidderId: "abin", amount: 60 },
    (ack) => {
      console.log("ACK:", ack);
      socket.disconnect();
    }
  );
});

socket.on("UPDATE_BID", (data) => {
  console.log("UPDATE_BID received:", data);
});

socket.on("connect_error", (err) => {
  console.log("connect_error:", err.message);
});
