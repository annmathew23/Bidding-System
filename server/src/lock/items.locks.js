import { Mutex } from "async-mutex";

const locks = new Map();

export function getItemLock(itemId) {
  if (!locks.has(itemId)) locks.set(itemId, new Mutex());
  return locks.get(itemId);
}
