import axios from "axios";
import { languageIdMap } from "../utils/languageMap.js";

export const runCode = async (req, res) => {
  try {
    const { code, language, input } = req.body;

    const languageId = languageIdMap[language];
    if (!languageId) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    // Submit code and wait for result in one call
    const response = await axios.post(
      `https://${process.env.JUDGE0_API_HOST}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: code,
        language_id: languageId,
        stdin: input || "",
      },
      {
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
          "X-RapidAPI-Host": process.env.JUDGE0_API_HOST,
        },
      }
    );

    const { stdout, stderr, compile_output, status } = response.data;

    res.status(200).json({
      stdout: stdout || null,
      stderr: stderr || null,
      compile_output: compile_output || null,
      status: status?.description || "Unknown",
    });
  } catch (err) {
    console.error("Judge0 error:", err.response?.data || err.message);
    res.status(500).json({ message: "Code execution failed" });
  }
};