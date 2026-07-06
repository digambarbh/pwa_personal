import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";
import Task from "./models/Task.js";
import { WEEK_DATA } from "./weekData.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing. Copy .env.example to .env and fill it in first.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log("Connected to MongoDB");

  console.log("Clearing existing tasks...");
  await Task.deleteMany({});

  const ops = [];
  for (const [week, data] of Object.entries(WEEK_DATA)) {
    for (const d of data.days) {
      const taskId = `${week}-day${d.day}`;
      ops.push(
        Task.updateOne(
          { taskId },
          { $setOnInsert: { taskId, week: Number(week), day: d.day, done: false } },
          { upsert: true }
        )
      );
    }
  }

  await Promise.all(ops);
  const count = await Task.countDocuments();
  console.log(`Seed complete. ${count} task documents in collection.`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  if (err.message.includes("querySrv") || err.message.includes("ETIMEOUT")) {
    console.error("\nThis looks like a DNS/network issue with the SRV lookup.");
    console.error("Fix: in .env, comment out the mongodb+srv:// line and use the");
    console.error("standard mongodb:// connection string instead (see .env.example, Option B).");
    console.error("Also try switching to mobile hotspot to confirm it's your WiFi/DNS blocking it.");
  }
  process.exit(1);
});
