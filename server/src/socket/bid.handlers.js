import { items } from "../store/items.store.js";

export function registerBidPlacedHandler(io, socket) {
  socket.on("BID_PLACED", ({ itemId, amount, bidderId }, ack) => {
    const item = items.find((i) => i.id === itemId);

    if (!item) {
      return ack?.({ ok: false, error: "Item not found" });
    }

    if (Date.now() > item.endsAt) {
      return ack?.({ ok: false, error: "Auction ended" });
    }

    if (amount <= item.currentBid) {
      return ack?.({ ok: false, error: "Outbid" });
    }


    item.currentBid = amount;
    item.highestBidderId = bidderId;

    io.emit("UPDATE_BID", {
      itemId,
      currentBid: item.currentBid,
      highestBidderId: bidderId,
      serverTimeMs: Date.now(),
    });

    ack?.({ ok: true });
  });
}
