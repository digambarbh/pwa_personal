import cron from "node-cron";
import Subscription from "../models/Subscription.js";
import webpush from "./webpush.js";

export default function startReminderScheduler() {
  cron.schedule(
    "0 20 * * *", // 8 PM IST daily — change to adjust time
    async () => {
      const subs = await Subscription.find();
      if (!subs.length) return;
      const payload = JSON.stringify({
        title: "Placement Tracker",
        body: "Don't forget to log today's progress and keep your streak alive.",
      });
      await Promise.allSettled(
        subs.map((s) => webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload))
      );
    },
    { timezone: "Asia/Kolkata" }
  );
}