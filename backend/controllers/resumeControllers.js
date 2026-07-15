import { PDFParse } from "pdf-parse";
import ai, { GEMINI_MODEL } from "../utils/gemini.js";

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume file uploaded" });
    }

    // Extract raw text from the PDF buffer
    const parser = new PDFParse({
        data: req.file.buffer,
    });

    const parsed = await parser.getText();

    await parser.destroy();

    const resumeText = parsed.text.slice(0, 8000);

    const prompt = `
    You are an ATS (Applicant Tracking System) resume evaluator.
    Analyze the following resume text and respond ONLY with valid JSON
    in exactly this shape, no markdown, no extra commentary:

    {
    "score": <number 0-100>,
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."],
    "suggestions": ["...", "..."]
    }

    Resume text:
    """
    ${resumeText}
    """
    `.trim();

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const raw = response.text.trim();
    // Strip accidental markdown code fences if the model adds them anyway
    const cleaned = raw.replace(/^```json\s*|\s*```$/g, "");
    const result = JSON.parse(cleaned);

    res.status(200).json(result);
  } catch (err) {
    console.error("Resume analysis error:", err.message);
    res.status(500).json({ message: "Failed to analyze resume" });
  }
};