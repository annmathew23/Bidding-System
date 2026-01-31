import express from "express";
import cors from "cors";
import itemsRoutes from "./routes/items.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Backend is running ✅ Try /health or /items");
});

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/items", itemsRoutes);

export default app;
