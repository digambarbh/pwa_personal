import express from "express";
import Subscription from "../models/Subscription.js";
import webpush from "../utils/webpush.js";

const router = express.Router();

router.post("/subscribe", async (req, res) => {
  try {
    await Subscription.findOneAndUpdate(
      { endpoint: req.body.endpoint },
      req.body,
      { upsert: true, new: true }
    );
    res.status(201).json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

router.post("/test", async (req, res) => {
  try {
    const subs = await Subscription.find();
    const payload = JSON.stringify({ title: "Test", body: "Push notifications are working." });
    await Promise.allSettled(
      subs.map((s) => webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload))
    );
    res.json({ sent: subs.length });
  } catch {
    res.status(500).json({ error: "Failed to send" });
  }
});

export default router;