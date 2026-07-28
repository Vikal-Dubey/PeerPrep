import { useState, useEffect, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ResumeUpload = ({ socket, roomId }) => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleResumeUpdate = ({ result: analysisResult, fileName }) => {
      setResult(analysisResult);
      setUploadedFileName(fileName || "Peer's Resume");
    };

    socket.on("resume-analysis-update", handleResumeUpdate);
    return () => {
      socket.off("resume-analysis-update", handleResumeUpdate);
    };
  }, [socket]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.type !== "application/pdf") {
        setError("Only PDF files are supported for resume analysis.");
        setFile(null);
        return;
      }
      setError("");
      setFile(selected);
    }
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
        body: formData,
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      setResult(data);
      setUploadedFileName(file.name);

      // Share the result with the other participant in the room
      socket.emit("resume-analysis", { roomId, result: data, fileName: file.name });
    } catch (err) {
      console.error(err);
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-emerald-500 text-emerald-400";
    if (score >= 60) return "bg-amber-500 text-amber-400";
    return "bg-rose-500 text-rose-400";
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-5 text-text shadow-xl">
      <div>
        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-cool animate-pulse" />
          ATS Resume Analyzer
        </h2>
        <p className="text-muted text-xs font-mono mt-1">Upload a PDF resume to get real-time scores and insights</p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Custom Drag & Drop / Click zone */}
        <div
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            file
              ? "border-accent-cool/50 bg-accent-cool/5"
              : "border-border hover:border-accent-cool hover:bg-bg/40"
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          <svg
            className={`w-8 h-8 transition-colors ${file ? "text-accent-cool" : "text-muted"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {file ? (
            <div className="text-center">
              <p className="text-sm font-medium text-text">{file.name}</p>
              <p className="text-xs text-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB • PDF</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-text/90">Click to select resume PDF</p>
              <p className="text-xs text-muted mt-0.5">Maximum size: 5MB</p>
            </div>
          )}
        </div>

        {error && <p className="text-rose-400 text-xs font-mono">{error}</p>}

        {file && (
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={analyzing}
              className="flex-1 bg-accent-cool text-white font-bold text-sm py-2 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing ATS Compatibility...
                </span>
              ) : (
                "Start ATS Analysis"
              )}
            </button>
            <button
              onClick={() => setFile(null)}
              disabled={analyzing}
              className="bg-bg border border-border text-muted hover:text-text px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="border-t border-border pt-4 flex flex-col gap-4 animate-fadeIn">
          {/* File Name & Score */}
          <div className="flex flex-col gap-2 bg-bg/50 border border-border rounded-lg p-4">
            <div className="flex justify-between items-center gap-2">
              <span className="text-sm font-bold truncate max-w-[200px]" title={uploadedFileName}>
                📄 {uploadedFileName}
              </span>
              <span className={`text-sm font-mono font-bold ${getScoreColor(result.score).split(" ")[1]}`}>
                ATS Score: {result.score}/100
              </span>
            </div>
            {/* Score Bar */}
            <div className="w-full bg-bg h-2.5 rounded-full overflow-hidden border border-border">
              <div
                className={`h-full transition-all duration-500 ${getScoreColor(result.score).split(" ")[0]}`}
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>

          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
              <p className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider mb-2">Strengths</p>
              <ul className="space-y-1.5 text-sm text-text/80 pl-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1 shrink-0 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {result.weaknesses?.length > 0 && (
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-3">
              <p className="text-xs font-bold text-rose-400 font-mono uppercase tracking-wider mb-2">Weaknesses</p>
              <ul className="space-y-1.5 text-sm text-text/80 pl-2">
                {result.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1 shrink-0 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div className="bg-accent-cool/5 border border-accent-cool/20 rounded-lg p-3">
              <p className="text-xs font-bold text-accent-cool font-mono uppercase tracking-wider mb-2">ATS Suggestions</p>
              <ul className="space-y-1.5 text-sm text-text/80 pl-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent-cool mt-1 shrink-0 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;