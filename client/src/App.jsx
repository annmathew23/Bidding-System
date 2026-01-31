import { useEffect, useRef, useState } from "react";
import { getItems, createItemApi } from "./api/items.api";
import { useserverTimeoffset } from "./hooks/useserverTimeoffset";
import Countdown from "./components/Countdown";
import { socket } from "./socket/socket";

export default function App() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  // create-item form state
  const [title, setTitle] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [durationMin, setDurationMin] = useState("");

  // bidder identity
  const [bidderId] = useState(() => crypto.randomUUID());

  // server time sync
  const { sync, serverNowMs } = useserverTimeoffset();

  // outbid logic (only show outbid if YOU have bid before)
  const [myLastBid, setMyLastBid] = useState({});

  // flash cleanup
  const flashTimeoutsRef = useRef(new Map());

  // initial load
  useEffect(() => {
    getItems()
      .then((data) => {
        sync(data.serverTimeMs);
        setItems(data.items);
      })
      .catch((e) => setError(e.message));
  }, [sync]);

  // sockets: connect + listen
  useEffect(() => {
    socket.connect();

    const onUpdateBid = (data) => {
      sync(data.serverTimeMs);

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== data.itemId) return item;

          const isMine = data.highestBidderId === bidderId;

          return {
            ...item,
            currentBid: data.currentBid,
            highestBidderId: data.highestBidderId,
            _flash: isMine ? "green" : "red",
          };
        })
      );

      const existing = flashTimeoutsRef.current.get(data.itemId);
      if (existing) clearTimeout(existing);

      const t = setTimeout(() => {
        setItems((prev) =>
          prev.map((item) =>
            item.id === data.itemId ? { ...item, _flash: null } : item
          )
        );
        flashTimeoutsRef.current.delete(data.itemId);
      }, 250);

      flashTimeoutsRef.current.set(data.itemId, t);
    };

    socket.on("UPDATE_BID", onUpdateBid);

    return () => {
      socket.off("UPDATE_BID", onUpdateBid);
      socket.disconnect();

      flashTimeoutsRef.current.forEach((t) => clearTimeout(t));
      flashTimeoutsRef.current.clear();
    };
  }, [bidderId, sync]);

  // bid action
  function placeBid(item) {
    const amount = item.currentBid + 10;

    socket.emit("BID_PLACED", { itemId: item.id, bidderId, amount }, (ack) => {
      if (ack?.ok) {
        setMyLastBid((prev) => ({ ...prev, [item.id]: amount }));
      } else {
        console.log("Bid rejected:", ack);
      }
    });
  }

  // create item from UI
  async function createItem(e) {
    e.preventDefault();
    setError("");

    const payload = {
      title: title.trim(),
      startingPrice: Number(startingPrice),
      durationMs: Number(durationMin) * 60 * 1000,
    };

    if (
      !payload.title ||
      Number.isNaN(payload.startingPrice) ||
      Number.isNaN(payload.durationMs) ||
      payload.durationMs <= 0
    ) {
      setError("Enter valid title, starting price, and duration minutes.");
      return;
    }

    try {
      const created = await createItemApi(payload);

      // add to list (already includes ended)
      setItems((prev) => [...prev, created]);

      // reset form
      setTitle("");
      setStartingPrice("");
      setDurationMin("");
    } catch (e2) {
      setError(e2.message);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Live Auctions</h1>

      <p style={{ color: "#888", marginTop: 4, fontSize: 13 }}>
        Your bidderId: {bidderId.slice(0, 8)}
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form
        onSubmit={createItem}
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
        }}
      >
        <h3 style={{ margin: 0 }}>Create Auction Item</h3>

        <input
          placeholder="Item title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginTop: 8 }}
        />

        <input
          type="number"
          placeholder="Starting price"
          value={startingPrice}
          onChange={(e) => setStartingPrice(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginTop: 8 }}
        />

        <input
          type="number"
          placeholder="Duration (minutes)"
          value={durationMin}
          onChange={(e) => setDurationMin(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginTop: 8 }}
        />

        <button
          type="submit"
          style={{
            marginTop: 12,
            padding: 10,
            fontWeight: 700,
            width: "100%",
            background: "#111",
            color: "white",
            borderRadius: 8,
            border: "1px solid #111",
            cursor: "pointer",
          }}
        >
          Create Auction
        </button>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        {items.map((item) => {
          const isWinning = item.highestBidderId === bidderId && !item.ended;
          const isOutbid =
            myLastBid[item.id] != null &&
            item.highestBidderId &&
            item.highestBidderId !== bidderId &&
            !item.ended;

          return (
            <div
              key={item.id}
              style={{
                border: `2px solid ${
                  item._flash === "green"
                    ? "#22c55e"
                    : item._flash === "red"
                    ? "#ef4444"
                    : "#e5e7eb"
                }`,
                borderRadius: 12,
                padding: 16,
                transition: "border-color 150ms ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700 }}>{item.title}</div>
                <Countdown endTimeMs={item.endTimeMs} serverNowMs={serverNowMs} />
              </div>

              <div style={{ marginTop: 10, fontSize: 18 }}>
                Current bid:{" "}
                <span
                  style={{
                    fontWeight: 800,
                    color:
                      item._flash === "green"
                        ? "#22c55e"
                        : item._flash === "red"
                        ? "#ef4444"
                        : "white",
                    transition: "color 150ms ease",
                  }}
                >
                  ${item.currentBid}
                </span>
              </div>

              <div style={{ marginTop: 8 }}>
                {isWinning && (
                  <span style={{ color: "#16a34a", fontWeight: 700 }}>
                    Winning
                  </span>
                )}
                {isOutbid && (
                  <span style={{ color: "#dc2626", fontWeight: 700 }}>
                    Outbid
                  </span>
                )}
                {item.ended && (
                  <span style={{ color: "#999", fontWeight: 700 }}>
                    Ended
                  </span>
                )}
              </div>

              <button
                onClick={() => placeBid(item)}
                disabled={item.ended}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "10px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: item.ended ? "#333" : "#111",
                  color: "white",
                  cursor: item.ended ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                Bid +$10
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
