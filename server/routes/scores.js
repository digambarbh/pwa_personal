import { Router } from "express";
import MockScore from "../models/MockScore.js";

const router = Router();

router.get("/", async (req, res) => {
  const scores = await MockScore.find().sort({ date: -1 }).lean();
  res.json(scores);
});

router.post("/", async (req, res) => {
  const { type, score, maxScore, date, notes } = req.body;
  if (!type || score === undefined || !date) {
    return res.status(400).json({ error: "type, score, and date are required" });
  }

  const entry = await MockScore.create({
    type,
    score: Number(score),
    maxScore: maxScore ? Number(maxScore) : 100,
    date,
    notes: notes || "",
  });
  res.status(201).json(entry);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const result = await MockScore.findByIdAndDelete(id);
  if (!result) return res.status(404).json({ error: "Score entry not found" });
  res.json({ ok: true });
});

export default router;
