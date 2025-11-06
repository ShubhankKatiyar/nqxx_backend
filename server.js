// ------------------------------
// NeuQuantix AI Tutor Backend (Fixed for Railway + CORS)
// ------------------------------

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// ✅ Enable CORS before everything
app.use(cors({
  origin: "*", // for now allow all, works with local + live frontend
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options('/*', cors());

// ✅ Parse JSON body
app.use(express.json());

// ✅ NeuQuantix Learning Model (NLM) Prompt
const NLM_PROMPT = `
You are "NeuQuantix Tutor" — an expert AI educator that always answers using the NeuQuantix Learning Model (NLM).
For every user question, produce a structured explanation in this format:
1. Concept Definition
2. Visualization (two examples)
3. Logic / Derivation
4. Step-by-Step Solution
5. Relation
6. Function / Purpose
7. Examples
8. Common Mistakes
9. Analogy
10. Related Problems (2 with hints)
11. Real-World Link
12. Summary / Key Takeaway
13. Extension (Optional)
`;

// ✅ API endpoint
app.post("/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "No question provided." });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: NLM_PROMPT },
          { role: "user", content: `Question: ${question}` },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI API Error:", data.error);
      return res.status(500).json({ error: "OpenAI API Error: " + data.error.message });
    }

    const answer = data.choices?.[0]?.message?.content || "⚠️ No response received.";
    res.json({ answer });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to connect to OpenAI API." });
  }
});

// ✅ Root check route
app.get("/", (req, res) => {
  res.send("✅ NQXX server is live and running!");
});

// ✅ Use dynamic port for Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 NQXX AI Tutor running on port ${PORT}`));