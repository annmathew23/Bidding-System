import { items } from "../store/items.store.js";
import { getItemLock } from "../lock/items.locks.js";

export function registerBidHandlers(io, socket) {
  socket.on("BID_PLACED", async (payload, ack) => {
    const { itemId, bidderId, amount } = payload || {};

    if (!itemId || !bidderId || typeof amount !== "number") {
      return ack?.({ ok: false, code: "BAD_REQUEST", message: "Invalid payload" });
    }

    const lock = getItemLock(itemId);

    await lock.runExclusive(async () => {
      const item = items.find((it) => it.id === itemId);
      if (!item) return ack?.({ ok: false, code: "NOT_FOUND", message: "Item not found" });

      const now = Date.now();

      if (now >= item.endTimeMs) {
        return ack?.({ ok: false, code: "AUCTION_ENDED", message: "Auction ended" });
      }

      if (amount <= item.currentBid) {
        return ack?.({ ok: false, code: "OUTBID", message: "Outbid" });
      }

      item.currentBid = amount;
      item.highestBidderId = bidderId;

      io.emit("UPDATE_BID", {
        itemId: item.id,
        currentBid: item.currentBid,
        highestBidderId: item.highestBidderId,
        serverTimeMs: now,
      });

      return ack?.({ ok: true });
    });
  });
}
