import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import QuizResult from "../models/QuizResult.js";

const router = Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

router.post("/generate", async (req, res) => {
  try {
    const { topic, content, numQuestions = 5 } = req.body;
    const qCount = parseInt(numQuestions) || 5;
    
    let prompt = `Generate a multiple-choice quiz about '${topic}'. `;
    if (content) {
      prompt += `Base the questions strictly on this content:\n${content}\n\n`;
    }
    prompt += `Generate exactly ${qCount} questions. Return ONLY a JSON array of objects, where each object has 'question' (string), 'options' (array of 4 strings), and 'answer' (the exact string of the correct option).`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const quizData = JSON.parse(response.text);
    res.json(quizData);
  } catch (error) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate quiz. Please try again." });
  }
});

router.post("/results", async (req, res) => {
  try {
    const { topic, score, maxScore, date } = req.body;
    const result = await QuizResult.create({
      topic,
      score,
      maxScore,
      date: date || todayStr()
    });
    res.json(result);
  } catch (error) {
    console.error("Save quiz error:", error);
    res.status(500).json({ error: "Failed to save quiz result" });
  }
});

router.get("/results", async (req, res) => {
  try {
    const results = await QuizResult.find().sort({ createdAt: -1 }).lean();
    res.json(results);
  } catch (error) {
    console.error("Fetch quiz results error:", error);
    res.status(500).json({ error: "Failed to fetch quiz results" });
  }
});

export default router;
