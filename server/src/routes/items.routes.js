import { Router } from "express";
import { items, addItem } from "../store/items.store.js";

const router = Router();

// GET /items
router.get("/", (req, res) => {
  try {
    const now = Date.now();
    res.status(200).json({
      serverTimeMs: now,
      items: items.map((it) => ({
        ...it,
        ended: now >= it.endTimeMs,
      })),
    });
  } catch (e) {
    console.error("GET /items failed:", e);
    res.status(500).json({ message: "Failed to fetch items" });
  }
});

// POST /items
router.post("/", (req, res) => {
  try {
    const { title, startingPrice, durationMs } = req.body || {};

    if (
      !title ||
      typeof startingPrice !== "number" ||
      Number.isNaN(startingPrice) ||
      typeof durationMs !== "number" ||
      Number.isNaN(durationMs) ||
      durationMs <= 0
    ) {
      return res.status(400).json({
        message: "title (string), startingPrice (number), durationMs (number) required",
      });
    }

    const created = addItem({ title, startingPrice, durationMs });

    // Return the same shape frontend expects
    const now = Date.now();
    return res.status(201).json({
      ...created,
      ended: now >= created.endTimeMs,
    });
  } catch (e) {
    console.error("POST /items failed:", e);
    return res.status(500).json({ message: "Failed to create item" });
  }
});

export default router;
