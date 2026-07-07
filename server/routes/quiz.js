import { Router } from "express";
import QuizResult from "../models/QuizResult.js";

const router = Router();

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
    prompt += `Generate exactly ${qCount} questions. Return ONLY a JSON array of objects, where each object has 'question' (string), 'options' (array of 4 strings), and 'answer' (the exact string of the correct option). Do not include any markdown formatting or \`\`\`json tags, just the raw JSON array.`;

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.CLIENT_ORIGIN || "http://localhost:5173",
        "X-Title": "Placement Tracker"
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-lite-preview-02-05:free",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!openRouterRes.ok) {
      const errorText = await openRouterRes.text();
      throw new Error(`OpenRouter API error: ${openRouterRes.status} - ${errorText}`);
    }

    const data = await openRouterRes.json();
    let responseText = data.choices[0].message.content.trim();
    
    // Clean up markdown block if the model ignores the instruction
    if (responseText.startsWith("```json")) {
      responseText = responseText.replace(/^```json\n?/, "").replace(/```$/, "").trim();
    } else if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```\n?/, "").replace(/```$/, "").trim();
    }

    const quizData = JSON.parse(responseText);
    res.json(quizData);
  } catch (error) {
    console.error("Quiz generation error:", error);
    if (error.message && error.message.includes("429")) {
      return res.status(429).json({ error: "OpenRouter API rate limit exceeded. Please wait and try again." });
    }
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
