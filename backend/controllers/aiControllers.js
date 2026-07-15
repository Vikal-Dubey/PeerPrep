import ai, { GEMINI_MODEL } from "../utils/gemini.js";

export const generateQuestions = async (req, res) => {
  try {
    const { role, difficulty } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const prompt = `
    Generate 5 technical interview questions for a "${role}" position at
    "${difficulty || "medium"}" difficulty. Respond ONLY with valid JSON
    in exactly this shape, no markdown, no extra commentary:

    {
    "questions": ["...", "...", "...", "...", "..."]
    }
    `.trim();

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const cleaned = response.text.trim().replace(/^```json\s*|\s*```$/g, "");
    const result = JSON.parse(cleaned);

    res.status(200).json(result);
  } catch (err) {
    console.error("Question generation error:", err.message);
    res.status(500).json({ message: "Failed to generate questions" });
  }
};

export const evaluateAnswer = async (req, res) => {
  try {
    const { question, answer, code, language } = req.body;

    if (!question || (!answer && !code)) {
      return res.status(400).json({ message: "Question and an answer or code are required" });
    }

    const prompt = `
    You are a technical interviewer evaluating a candidate's response.

    Question: "${question}"

    ${code ? `Candidate's code (${language}):\n${code}` : `Candidate's answer:\n${answer}`}

    Respond ONLY with valid JSON in exactly this shape, no markdown, no extra commentary:

    {
    "score": <number 0-10>,
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."],
    "feedback": "..."
    }
    `.trim();

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const cleaned = response.text.trim().replace(/^```json\s*|\s*```$/g, "");
    const result = JSON.parse(cleaned);

    res.status(200).json(result);
  } catch (err) {
    console.error("Answer evaluation error:", err.message);
    res.status(500).json({ message: "Failed to evaluate answer" });
  }
};