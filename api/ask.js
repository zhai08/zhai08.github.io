const PROFILE_CONTEXT = `
Zihan Zhai is an undergraduate researcher at the University of North Carolina at Chapel Hill.
She is pursuing a B.S.P.H. in Biostatistics, a B.S. in Biology, and a minor in Pharmaceutical Sciences. GPA: 3.93.
Email: zhai08@unc.edu. A full CV is available upon request; do not claim that a public CV is downloadable.

Long-term motivation:
- Zihan first became interested in life science because of a long-horizon fascination with longevity: whether aging and life-limiting disease could become measurable, targetable, and eventually treatable.
- If visitors ask about "immortality" or "anti-aging drugs", answer carefully: her ultimate dream is to contribute to science that pushes toward radically extended healthy life, but her practical research framing is gerotherapeutics, aging biology, chemical biology, pharmacology, target engagement, screening, protein fate, and rigorous experimental systems. Do not imply that any current project already proves an anti-aging therapy.
- A concise version of her research identity is: mechanism-to-gerotherapeutics. She wants to connect molecular perturbation, target engagement, cellular response, and organismal phenotype, then apply that causal reasoning to interventions that preserve function during aging.

Research:
- SGC-UNC: targeted therapeutic strategies for fibrolamellar carcinoma, especially selective degradation strategies around the DNAJ-PKAc fusion oncoprotein. Methods include NanoBRET target engagement, luminescent protein-abundance/degradation reporters, thermal-response assays, and PGK1/PGK2 inhibitor target-engagement profiling. Link: https://www.sgc-unc.org/
- Jenson Lab: molecular interactions between T5 bacteriophage and host CBASS defense systems. Work centers on CRISPR-Cas13a phage genome engineering, crRNA and homologous-recombination donor design, molecular cloning, mutant verification, and functional screening to identify phage factors that alter CBASS sensitivity. Link: https://jensonlab.org/
- Maddox Lab: PAR polarity proteins in adult C. elegans germline structure, oocyte development, and septin localization through RNAi-mediated knockdown and fluorescent reporter strains. Link: https://asmlab.web.unc.edu/
- iGEM GreatBay_SZ 2021: ARTAG, a DNA-barcoding and CRISPR-Cas12a anti-counterfeiting platform for artwork authentication. Honors included Global Finalist Top 10, Global Gold, Best Wiki Nominee, and Best Presentation Nominee. Link: https://2021.igem.org/Team:GreatBay_SZ

Publication and manuscripts:
- MacKenzie, K. R., et al., Zhai, Z., et al., Young, D. W. "PGK Isozyme-Selective Inhibitors from Parallel DNA-Encoded Library Screening." Manuscript submitted to Nature Chemistry, 2026.8.
- Zhai, Z. "Polarity Protein Depletion Reveals Distinct Contributions of PAR Factors to Adult Germline Structure in C. elegans." UNC JOURney, 2026.5.
- Zhai, Z., et al. "Identification and Functional Validation of Candidate Anti-CBASS Factors in T5 Bacteriophage." Manuscript in preparation.

Education:
- University of North Carolina at Chapel Hill, 2023-present.
- University of Oxford, non-matriculated exchange in Biomedical Science, 2024.
- Chongqing Nankai Secondary School, 2020-2023.

Skills and interests:
- Molecular cloning, CRISPR-Cas9/Cas13a systems, NanoBRET, NaLTSA, RNAi knockdown, fluorescence microscopy, AlphaFold-based structural analysis, sequence alignment, phylogenetic analysis, R, SAS, GraphPad Prism, C++, and Python.
- Interests outside research include Chinese classical literature, mythology, Han costume culture, and travel.
- Long-term scientific interests include longevity therapeutics, aging biology, pharmacology, and drug discovery.

Honors:
- UNC Summer Undergraduate Research Fellowship, 2026.
- UNC Dean's List, 2023-2026.
- iGEM Global Finalist and Global Gold.
- British Biology Olympiad Global Gold, 2022.
- Canadian Chemistry Contest Global Merit / Gold Award, 2022.
- BPhO Senior Physics Challenge Global Gold, 2022.
- AMC 12 Distinction.
`;

const allowedOrigins = new Set([
  "https://zhai08.github.io",
  "http://localhost:3000",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
]);

const requestCounts = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 12;

function setCors(req, res) {
  const origin = req.headers.origin;
  if (
    allowedOrigins.has(origin) ||
    (origin && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin))
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function getClientId(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  return String(Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || req.socket.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
}

function isRateLimited(clientId) {
  const now = Date.now();
  const current = requestCounts.get(clientId);

  if (!current || current.resetAt <= now) {
    requestCounts.set(clientId, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

function extractText(data) {
  if (typeof data.output_text === "string") return data.output_text.trim();

  const parts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") parts.push(content.text);
      if (typeof content.refusal === "string") parts.push(content.refusal);
    }
  }

  return parts.join("\n").trim();
}

module.exports = async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "OPENAI_API_KEY is not configured." });
    return;
  }

  const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
  if (!question) {
    res.status(400).json({ error: "Question is required." });
    return;
  }

  if (question.length > 600) {
    res.status(400).json({ error: "Question is too long." });
    return;
  }

  if (isRateLimited(getClientId(req))) {
    res.status(429).json({ error: "Too many questions. Please try again shortly." });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
        max_output_tokens: 500,
        reasoning: { effort: "none" },
        input: [
          {
            role: "system",
            content:
              "You answer questions for Zihan Zhai's personal website. Use only the supplied profile context. Do not invent private details, admissions outcomes, unpublished results beyond the context, phone numbers, addresses, or exact availability. If asked about unrelated topics, briefly redirect to Zihan's education, research, skills, honors, publications, or contact. Answer in English, concisely and professionally. Include relevant links when useful."
          },
          {
            role: "user",
            content: `Profile context:\n${PROFILE_CONTEXT}\n\nVisitor question:\n${question}`
          }
        ]
      })
    });

    if (!response.ok) {
      const details = await response.text();
      console.error(`OpenAI API error ${response.status}: ${details}`);
      res.status(502).json({ error: "AI service is temporarily unavailable." });
      return;
    }

    const data = await response.json();
    const answer = extractText(data);

    if (!answer) {
      console.error("OpenAI API returned no visible text", {
        status: data.status,
        incomplete_details: data.incomplete_details,
        output: data.output
      });
      res.status(502).json({ error: "AI service returned no answer." });
      return;
    }

    res.status(200).json({
      answer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI service is temporarily unavailable." });
  }
};
