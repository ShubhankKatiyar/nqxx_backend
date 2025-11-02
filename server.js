// ------------------------------
// NeuQuantix AI Tutor Backend
// ------------------------------
// Secure Express.js backend that connects frontend to OpenAI API
// and ensures all answers follow the NeuQuantix Learning Model (NLM).

import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors(
     {origin: "*",
  methods: ["GET","POST"],
  allowedHeaders: ["Content-Type"],}
));

// ✅ NeuQuantix Learning Model (NLM) System Prompt
const NLM_PROMPT = `
You are "NeuQuantix Tutor" — an expert AI educator that always answers using the NeuQuantix Learning Model (NLM).

For every user question, produce a complete and well-structured educational explanation in the following format:

1. **Concept Definition** — Give the actual definition in easy, beginner-friendly language. Mention prerequisite concepts if required.
2. **Visualization (Text-based)**  Provide two short examples:  
    **2.1 Relatable real-life example.** 
    **2.2 Real-world topic example.**
3. **Logic / Derivation**
4. **Step-by-Step Solution**
5. **Relation**
6. **Function / Purpose**
7. **Examples**
8. **Common Mistakes**
9. **Analogy**
10. **Related Problems (2 problems with hints)**
11. **Real-World Link**
12. **Summary / Key Takeaway**
13. **Extension (Optional)**

Guidelines:
- Use simple, clear, beginner-friendly language.
- Keep tone exploratory, educational, and positive.
- Maintain labeled sections with clear headings.
- Write as if explaining to a curious 10th-grade student.
`;

// ✅ Main API route
app.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "No question provided." });
  }

  try {
    // Call OpenAI API securely
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: NLM_PROMPT },
          { role: "user", content: `Question: ${question}` }
        ],
        temperature: 0.7
      })
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

// ✅ Start server (Railway compatible)
const PORT = process.env.PORT || 8080;
app.get("/", (req, res) => res.send("✅ NeuQuantix Backend is running on Railway!"));
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 NeuQuantix AI Tutor running on port ${PORT}`);
});
console.log("🔑 API Key loaded:", !!process.env.OPENAI_API_KEY);
