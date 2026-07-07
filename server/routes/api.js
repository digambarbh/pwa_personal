import { Router } from "express";
import Task from "../models/Task.js";
import StreakDay from "../models/StreakDay.js";
import DailyMetric from "../models/DailyMetric.js";
import Settings from "../models/Settings.js";
import StudySession from "../models/StudySession.js";
import Report from "../models/Report.js";
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

router.get("/metrics", async (req, res) => {
  const metrics = await DailyMetric.find().sort({ date: -1 }).lean();
  res.json(metrics);
});

router.get("/metrics/today", async (req, res) => {
  const date = req.query.date || todayStr();
  const metric = await DailyMetric.findOne({ date });
  res.json(metric || { date, points: 0, logs: [] });
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

router.post("/metrics/today/log", async (req, res) => {
  const { date, label, points } = req.body;
  const targetDate = date || todayStr();
  
  if (!label || !points) {
    return res.status(400).json({ error: "Label and points are required" });
  }

  const metric = await DailyMetric.findOneAndUpdate(
    { date: targetDate },
    { 
      $push: { logs: { label, points: Number(points) } },
      $inc: { points: Number(points) }
    },
    { new: true, upsert: true }
  );
  res.json(metric);
});

router.put("/metrics/log/:date/:logId", async (req, res) => {
  const { date, logId } = req.params;
  const { label, points } = req.body;
  
  const metric = await DailyMetric.findOne({ date });
  if (!metric) return res.status(404).json({ error: "Metric not found" });
  
  const log = metric.logs.id(logId);
  if (!log) return res.status(404).json({ error: "Log not found" });
  
  // Update total points
  metric.points = metric.points - log.points + Number(points);
  
  // Update log
  log.label = label;
  log.points = Number(points);
  
  await metric.save();
  res.json(metric);
});

router.delete("/metrics/log/:date/:logId", async (req, res) => {
  const { date, logId } = req.params;
  
  const metric = await DailyMetric.findOne({ date });
  if (!metric) return res.status(404).json({ error: "Metric not found" });
  
  const log = metric.logs.id(logId);
  if (!log) return res.status(404).json({ error: "Log not found" });
  
  metric.points -= log.points;
  log.deleteOne();
  
  await metric.save();
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

// --- Reports ---

router.get("/reports/check", async (req, res) => {
  // 1. Return any existing unacknowledged report
  const unackReport = await Report.findOne({ acknowledged: false });
  if (unackReport) return res.json({ shouldShow: true, report: unackReport });

  // 2. Check last report date
  const lastReportSetting = await Settings.findOne({ key: "lastReportDate" });
  const lastDate = lastReportSetting ? new Date(lastReportSetting.value) : new Date(0);
  const now = new Date();
  
  const diffHours = (now - lastDate) / (1000 * 60 * 60);
  if (diffHours < 72) {
    return res.json({ shouldShow: false });
  }

  // 3. Generate new report
  const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
  const startDateStr = `${threeDaysAgo.getFullYear()}-${String(threeDaysAgo.getMonth() + 1).padStart(2, "0")}-${String(threeDaysAgo.getDate()).padStart(2, "0")}`;

  // Study minutes
  const sessions = await StudySession.find({ createdAt: { $gte: threeDaysAgo } }).lean();
  const totalMinutes = sessions.reduce((acc, s) => acc + (s.minutes || 0), 0);

  // Tasks completed
  const tasksCompleted = await Task.countDocuments({ completedAt: { $gte: threeDaysAgo } });

  // Points earned
  const metrics = await DailyMetric.find({ createdAt: { $gte: threeDaysAgo } }).lean();
  const pointsEarned = metrics.reduce((acc, m) => acc + (m.points || 0), 0);

  // Next task
  const nextTask = await Task.findOne({ done: false }).sort({ week: 1, day: 1 }).lean();
  let nextTaskLabel = "You are done with all tasks!";
  if (nextTask) {
    const wd = WEEK_DATA[nextTask.week];
    if (wd) {
      const d = wd.days.find(day => day.day === nextTask.day);
      if (d) nextTaskLabel = `W${nextTask.week} D${nextTask.day}: ${d.topics}`;
    }
  }

  // Generate Message
  let message = "";
  if (totalMinutes < 180) {
    message = "Reality Check: You're slacking. 3 days passed and you barely studied. Placements are coming, wake up.";
  } else if (totalMinutes < 420) {
    message = "Reality Check: You're doing okay, but okay isn't enough to stand out. Push harder.";
  } else {
    message = "Reality Check: Great work! You're consistently grinding. Keep this exact momentum going.";
  }

  const report = new Report({
    startDate: threeDaysAgo,
    endDate: now,
    totalMinutes,
    tasksCompleted,
    pointsEarned,
    message,
    nextTaskLabel,
    acknowledged: false
  });
  await report.save();

  // Update lastReportDate
  await Settings.findOneAndUpdate(
    { key: "lastReportDate" },
    { $set: { value: now.toISOString() } },
    { new: true, upsert: true }
  );

  res.json({ shouldShow: true, report });
});

router.post("/reports/ack/:id", async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ error: "Not found" });
  report.acknowledged = true;
  await report.save();
  res.json(report);
});

router.get("/reports", async (req, res) => {
  const reports = await Report.find({ acknowledged: true }).sort({ createdAt: -1 }).lean();
  res.json(reports);
});

export default router;
