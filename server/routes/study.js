import { Router } from "express";
import StudySession from "../models/StudySession.js";

const router = Router();

router.get("/", async (req, res) => {
  const sessions = await StudySession.find().sort({ date: -1 }).lean();
  res.json(sessions);
});

router.post("/", async (req, res) => {
  const { date, minutes, label } = req.body;
  if (!date || !minutes || minutes <= 0) {
    return res.status(400).json({ error: "date and a positive minutes value are required" });
  }
  const session = await StudySession.create({ date, minutes: Number(minutes), label: label || "" });
  res.status(201).json(session);
});

router.get("/summary", async (req, res) => {
  const sessions = await StudySession.find().lean();
  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);

  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const todayMinutes = sessions.filter((s) => s.date === today).reduce((sum, s) => sum + s.minutes, 0);

  const uniqueDays = new Set(sessions.map((s) => s.date)).size;

  res.json({ totalMinutes, todayMinutes, daysStudied: uniqueDays });
});

export default router;
