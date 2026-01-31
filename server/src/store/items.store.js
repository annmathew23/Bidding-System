import crypto from "crypto";

export const items = [
  {
    id: "1",
    title: "Vintage Camera",
    startingPrice: 50,
    currentBid: 50,
    highestBidderId: null,
    endTimeMs: Date.now() + 5 * 60 * 1000,
  },
  {
    id: "2",
    title: "Signed Jersey",
    startingPrice: 100,
    currentBid: 100,
    highestBidderId: null,
    endTimeMs: Date.now() + 7 * 60 * 1000,
  },
];

export function addItem({ title, startingPrice, durationMs }) {
  const now = Date.now();
  const item = {
    id: crypto.randomUUID(),
    title,
    startingPrice,
    currentBid: startingPrice,
    highestBidderId: null,
    endTimeMs: now + durationMs,
  };

  items.push(item);
  return item;
}
