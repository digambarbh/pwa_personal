import { Router } from "express";
import Task from "../models/Task.js";
import StreakDay from "../models/StreakDay.js";
import DailyMetric from "../models/DailyMetric.js";
import Settings from "../models/Settings.js";
import { WEEK_DATA, PHASES } from "../weekData.js";

const router = Router();

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

router.get("/roadmap", (req, res) => {
  res.json({ weekData: WEEK_DATA, phases: PHASES });
});

router.get("/tasks", async (req, res) => {
  const tasks = await Task.find().sort({ week: 1 }).lean();
  res.json(tasks);
});

router.put("/tasks/:taskId/toggle", async (req, res) => {
  const { taskId } = req.params;
  const task = await Task.findOne({ taskId });
  if (!task) return res.status(404).json({ error: "Task not found" });

  task.done = !task.done;
  task.completedAt = task.done ? new Date() : null;
  await task.save();
  res.json(task);
});

router.get("/progress", async (req, res) => {
  const total = await Task.countDocuments();
  const done = await Task.countDocuments({ done: true });
  res.json({ total, done, pct: total ? Math.round((done / total) * 100) : 0 });
});

router.get("/streak", async (req, res) => {
  const days = await StreakDay.find().sort({ date: 1 }).lean();
  res.json(days.map((d) => d.date));
});

router.post("/streak/checkin", async (req, res) => {
  const date = req.body.date || todayStr();
  await StreakDay.updateOne({ date }, { $setOnInsert: { date } }, { upsert: true });
  const days = await StreakDay.find().sort({ date: 1 }).lean();
  res.json(days.map((d) => d.date));
});

router.post("/reset", async (req, res) => {
  await Task.updateMany({}, { done: false, completedAt: null });
  await StreakDay.deleteMany({});
  await DailyMetric.deleteMany({});
  res.json({ ok: true });
});

router.get("/metrics/today", async (req, res) => {
  const date = req.query.date || todayStr();
  const metric = await DailyMetric.findOne({ date });
  res.json(metric || { date, points: 0 });
});

router.post("/metrics/today", async (req, res) => {
  const { date, points } = req.body;
  const targetDate = date || todayStr();
  const metric = await DailyMetric.findOneAndUpdate(
    { date: targetDate },
    { $set: { points } },
    { new: true, upsert: true }
  );
  res.json(metric);
});

router.get("/settings/:key", async (req, res) => {
  const setting = await Settings.findOne({ key: req.params.key });
  res.json(setting || { key: req.params.key, value: null });
});

router.post("/settings", async (req, res) => {
  const { key, value } = req.body;
  const setting = await Settings.findOneAndUpdate(
    { key },
    { $set: { value } },
    { new: true, upsert: true }
  );
  res.json(setting);
});

export default router;
