const askBtn = document.getElementById("askBtn");
const userInput = document.getElementById("userInput");
const outputDiv = document.getElementById("output");

askBtn.addEventListener("click", async () => {
  const question = userInput.value.trim();

  if (!question) {
    outputDiv.innerHTML = "⚠️ Please enter a question!";
    return;
  }

  outputDiv.innerHTML = "<span class='loading'>🤔 Thinking deeply using NLM framework...</span>";

  try {
    const response = await fetch("http://localhost:3000/ask", {
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
    const sections = extractNLMSections(answer);

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
    outputDiv.innerHTML = "❌ Error connecting to server. Make sure backend is running.";
  }
});

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
  const cleanText = answerText.replace(/\*\*|##+|\*/g, "").trim();

  cleanText.split(/\n+/).forEach((line) => {
    const foundTitle = titles.find((t) => line.toLowerCase().includes(t.toLowerCase()));
    if (foundTitle) {
      currentTitle = foundTitle;
      sections[currentTitle] = "";
    } else if (currentTitle) {
      sections[currentTitle] += line + " ";
    }
  });

  titles.forEach((t) => {
    if (!sections[t] || sections[t].trim() === "") sections[t] = "— Not provided —";
  });

  return sections;
}
