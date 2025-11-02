// NeuQuantix AI Tutor (Frontend)
// Sends question to backend (server.js) which securely calls OpenAI API

const askBtn = document.getElementById("askBtn");
const userInput = document.getElementById("userInput");
const outputDiv = document.getElementById("output");

// 🎯 Handle Ask AI button click
askBtn.addEventListener("click", async () => {
  const question = userInput.value.trim();

  if (!question) {
    outputDiv.innerHTML = "⚠️ Please enter a question!";
    return;
  }

  outputDiv.innerHTML =
    "<span class='loading'>🤔 Thinking deeply using NLM framework...</span>";

  try {
    // const response = await fetch("http://localhost:3000/ask", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ question }),

const response = await fetch("https://nqxxbackend-production.up.railway.app/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),

    });
    

    const data = await response.json();

    if (data.error) {
      outputDiv.innerHTML = `❌ Error: ${data.error}`;
      return;
    }

    const answer = data.answer;
    console.log("AI Answer:", answer);

    const sections = extractNLMSections(answer);

    // 🎨 Display as modern single-column cards
    outputDiv.innerHTML = `
      <h3 class="nlm-title">🧠 NeuQuantix Learning Model (NLM) Response</h3>
      <div class="cards-container">
        ${Object.entries(sections)
          .map(
            ([title, text]) => `
              <div class="card">
                <h3>${title}</h3>
                <p>${text}</p>
              </div>`
          )
          .join("")}
      </div>
    `;
  } catch (error) {
    console.error("Frontend Error:", error);
    outputDiv.innerHTML =
      "❌ Error connecting to server. Please check the console.";
  }
});

// 🧩 Extracts 13 NLM sections from AI answer (more flexible version)
function extractNLMSections(answerText) {
  const titles = [
    "Concept Definition",
    "Visualization",
    "Logic / Derivation",
    "Step-by-Step Solution",
    "Relation",
    "Function / Purpose",
    "Examples",
    "Common Mistakes",
    "Analogy",
    "Related Problems",
    "Real-World Link",
    "Summary / Key Takeaway",
    "Extension",
  ];

  const sections = {};
  let currentTitle = null;

  // Normalize formatting (remove **, ###, extra spaces)
  const cleanText = answerText.replace(/\*\*|##+|\*/g, "").trim();

  cleanText.split(/\n+/).forEach((line) => {
    const foundTitle = titles.find((t) =>
      line.toLowerCase().includes(t.toLowerCase())
    );
    if (foundTitle) {
      currentTitle = foundTitle;
      sections[currentTitle] = "";
    } else if (currentTitle) {
      sections[currentTitle] += line + " ";
    }
  });

  // Fill missing ones gracefully
  titles.forEach((t) => {
    if (!sections[t] || sections[t].trim() === "")
      sections[t] = "— Not provided —";
  });

  return sections;
}
