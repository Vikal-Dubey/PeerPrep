import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ResumeUpload = ({ socket, roomId }) => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      setFile(null);
      return;
    }
    setError("");
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch(`${API_URL}/api/resume/analyze`, {
        method: "POST",
        credentials: "include",
        body: formData, // no Content-Type header — browser sets multipart boundary automatically
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      setResult(data);

      // Share the result with the other participant in the room
      socket.emit("resume-analysis", { roomId, result: data, fileName: file.name });
    } catch {
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
      <h2 className="font-semibold text-sm">Resume Analysis</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="text-sm"
      />

      {error && <p className="text-red-600 text-xs">{error}</p>}

      <button
        onClick={handleUpload}
        disabled={!file || analyzing}
        className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded disabled:opacity-50 self-start"
      >
        {analyzing ? "Analyzing..." : "Analyze Resume"}
      </button>

      {result && (
        <div className="border-t pt-3 text-sm">
          <p className="font-semibold">ATS Score: {result.score}/100</p>

          {result.strengths?.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-green-700">Strengths:</p>
              <ul className="list-disc list-inside text-gray-600">
                {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {result.weaknesses?.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-red-700">Weaknesses:</p>
              <ul className="list-disc list-inside text-gray-600">
                {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          {result.suggestions?.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-blue-700">Suggestions:</p>
              <ul className="list-disc list-inside text-gray-600">
                {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;