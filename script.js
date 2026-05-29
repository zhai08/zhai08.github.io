const root = document.documentElement;
const themeToggle = document.querySelector("#themeToggle");
const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  root.dataset.theme = savedTheme;
}

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  localStorage.setItem("theme", nextTheme);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const chatLog = document.querySelector("#chatLog");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const promptButtons = document.querySelectorAll("[data-question]");

const aiEndpoint = window.ZIHAN_AI_ENDPOINT || "";

const answers = [
  {
    keywords: ["research", "interest", "interests", "lab", "work", "science"],
    html:
      "Zihan works across three connected research areas: targeted degradation of the DNAJ-PKAc fusion oncoprotein at <a href=\"https://www.sgc-unc.org/\" target=\"_blank\" rel=\"noreferrer\">SGC-UNC</a>, bacteriophage-host defense at <a href=\"https://jensonlab.org/\" target=\"_blank\" rel=\"noreferrer\">Jenson Lab</a>, and PAR polarity proteins in adult C. elegans germline structure at <a href=\"https://asmlab.web.unc.edu/\" target=\"_blank\" rel=\"noreferrer\">Maddox Lab</a>."
  },
  {
    keywords: ["sgc", "flc", "fibrolamellar", "dnaj", "pkac", "nanobret", "degradation"],
    html:
      "At SGC-UNC, Zihan studies targeted therapeutic strategies for fibrolamellar carcinoma, focusing on selective degradation of the DNAJ-PKAc fusion oncoprotein. She designed a live-cell luminescent reporter system and optimized NanoBRET assays to evaluate degrader activity, compound engagement, and intracellular dynamics."
  },
  {
    keywords: ["jenson", "cbass", "phage", "bacteriophage", "t5", "alphafold", "snippy"],
    html:
      "In Jenson Lab, Zihan investigates molecular interactions between T5 bacteriophage and host CBASS defense systems. Her work centers on CRISPR-Cas13a phage genome engineering, crRNA and homologous-recombination donor design, mutant construction and verification, and screening engineered variants to identify phage factors that alter CBASS sensitivity."
  },
  {
    keywords: ["maddox", "elegans", "par", "polarity", "septin", "germline", "journey"],
    html:
      "In Maddox Lab, Zihan studies how par-1, par-2, and par-5 affect adult C. elegans germline organization, oocyte development, and septin localization. This work led to the UNC JOURney publication <em>Polarity Protein Depletion Reveals Distinct Contributions of PAR Factors to Adult Germline Structure in C. elegans</em>."
  },
  {
    keywords: ["igem", "greatbay", "artag", "synthetic", "barcode", "barcoding", "counterfeit"],
    html:
      "Zihan was a core member of <a href=\"https://2021.igem.org/Team:GreatBay_SZ\" target=\"_blank\" rel=\"noreferrer\">iGEM GreatBay_SZ 2021</a>. The team built ARTAG, a synthetic biology platform for artwork authentication using DNA barcoding and CRISPR-Cas12a detection. The project received Global Finalist Top 10, Global Gold, Best Wiki Nominee, and Best Presentation Nominee honors."
  },
  {
    keywords: ["education", "school", "major", "unc", "oxford", "gpa", "degree"],
    html:
      "Zihan is studying at the University of North Carolina at Chapel Hill, pursuing a B.S.P.H. in Biostatistics, a B.S. in Biology, and a minor in Pharmaceutical Sciences. Her GPA is 3.91. She also studied Biomedical Science at the University of Oxford as a non-matriculated exchange student in 2024."
  },
  {
    keywords: ["skill", "skills", "technique", "programming", "python", "sas", "r"],
    html:
      "Her toolkit includes molecular cloning, CRISPR-Cas9/Cas13a systems, NanoBRET, NaLTSA, RNAi knockdown, fluorescence microscopy, AlphaFold-based structural analysis, sequence alignment, phylogenetic analysis, R, SAS, GraphPad Prism, C++, and Python."
  },
  {
    keywords: ["award", "honor", "honors", "surf", "dean", "olympiad"],
    html:
      "Selected honors include the UNC Summer Undergraduate Research Fellowship, UNC Dean's List, iGEM Global Finalist and Global Gold, British Biology Olympiad Global Gold, Canadian Chemistry Contest Global Merit / Gold Award, BPhO Senior Physics Challenge Global Gold, and AMC 12 Distinction."
  },
  {
    keywords: ["contact", "email", "cv", "resume"],
    html:
      "You can reach Zihan at <a href=\"mailto:zhai_zihan@163.com\">zhai_zihan@163.com</a>. A full CV is available upon request."
  },
  {
    keywords: ["interest", "literature", "travel", "han", "hanfu", "culture"],
    html:
      "Beyond research, Zihan is interested in Chinese classical literature, mythology, Han costume culture, and travel. She previously served as president of Han Costume Club and organized campus cultural events."
  }
];

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    };
    return entities[char];
  });
}

function addMessage(role, html) {
  if (!chatLog) return;

  const message = document.createElement("div");
  message.className = `message ${role}`;
  message.innerHTML = `<p>${html}</p>`;
  chatLog.appendChild(message);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function localAnswer(question) {
  const normalized = question.toLowerCase();
  const match = answers.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))
  );

  if (match) return match.html;

  return "I can currently answer questions about Zihan's education, research experiences, iGEM project, skills, honors, and contact details. Try asking: What does she do at SGC-UNC? What was the iGEM project? What skills does she have?";
}

async function answerQuestion(question) {
  if (!aiEndpoint) {
    return localAnswer(question);
  }

  try {
    const response = await fetch(aiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    if (!response.ok) throw new Error("Request failed");

    const data = await response.json();
    return escapeHtml(data.answer || localAnswer(question));
  } catch {
    return localAnswer(question);
  }
}

async function submitQuestion(question) {
  const trimmed = question.trim();
  if (!trimmed) return;

  addMessage("user", escapeHtml(trimmed));
  if (chatInput) chatInput.value = "";

  addMessage("assistant", "Let me think...");
  const loadingNode = chatLog?.lastElementChild;
  const answer = await answerQuestion(trimmed);

  if (loadingNode) {
    loadingNode.innerHTML = `<p>${answer}</p>`;
  }
}

chatForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  submitQuestion(chatInput?.value || "");
});

promptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    submitQuestion(button.dataset.question || "");
  });
});
