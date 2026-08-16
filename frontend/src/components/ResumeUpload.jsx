import { useState, useEffect, useRef } from "react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

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
    if (score >= 80) return "bg-accent-cool text-accent-cool";
    if (score >= 60) return "bg-amber-500 text-amber-400";
    return "bg-error text-error";
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-5 text-text shadow-xl font-display">
      <div className="select-none">
        <h2 className="text-base font-bold tracking-wide flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cool opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cool"></span>
          </span>
          ATS resume analyzer
        </h2>
        <p className="text-muted text-[10px] mt-1 uppercase tracking-wider">Upload candidate resume PDF for compliance scanning</p>
      </div>

      <div className="flex flex-col gap-3">
        {/* Custom Drag & Drop / Click zone */}
        <div
          onClick={triggerFileInput}
          className={`border border-dashed rounded-lg p-5 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all ${
            file
              ? "border-accent-cool/55 bg-accent-cool/5"
              : "border-border hover:border-accent-cool/50 hover:bg-bg/25"
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
            className={`w-7 h-7 transition-colors ${file ? "text-accent-cool" : "text-muted"}`}
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
            <div className="text-center font-sans">
              <p className="text-xs font-semibold text-text truncate max-w-[220px]" title={file.name}>
                {file.name}
              </p>
              <p className="text-[10px] text-muted mt-0.5">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
              </p>
            </div>
          ) : (
            <div className="text-center select-none font-sans">
              <p className="text-xs font-bold text-text/80">Select candidate resume PDF</p>
              <p className="text-[10px] text-muted/65 mt-1 uppercase tracking-wider">Maximum file size: 5MB</p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-error text-[10px] leading-normal bg-error/5 border border-error/20 px-3 py-1.5 rounded-md font-sans">
            {error}
          </p>
        )}

        {file && (
          <div className="flex gap-2 select-none font-sans">
            <button
              onClick={handleUpload}
              disabled={analyzing}
              className="flex-1 bg-accent-cool text-bg font-bold text-xs py-2.5 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-accent-cool/10 cursor-pointer"
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                  Running scanner...
                </span>
              ) : (
                "Start ATS analysis"
              )}
            </button>
            <button
              onClick={() => setFile(null)}
              disabled={analyzing}
              className="bg-bg border border-border text-muted hover:text-text px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="border-t border-border/80 pt-4 flex flex-col gap-4 animate-fadeIn font-sans">
          {/* File Name & Score */}
          <div className="flex flex-col gap-2.5 bg-bg/50 border border-border rounded-lg p-4">
            <div className="flex justify-between items-center gap-4">
              <span className="text-xs font-bold truncate max-w-[180px] text-text/95" title={uploadedFileName}>
                📄 {uploadedFileName}
              </span>
              <span className={`text-xs font-bold ${getScoreColor(result.score).split(" ")[1]}`}>
                ATS match: {result.score}%
              </span>
            </div>
            {/* Score Bar */}
            <div className="w-full bg-bg h-2 rounded-full overflow-hidden border border-border select-none">
              <div
                className={`h-full transition-all duration-500 ${getScoreColor(result.score).split(" ")[0]}`}
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>

          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <div className="bg-accent-cool/5 border border-accent-cool/20 rounded-lg p-3.5">
              <p className="text-[10px] font-bold text-accent-cool font-mono uppercase tracking-wider mb-2 select-none">Strengths</p>
              <ul className="space-y-1 text-xs text-text/80 pl-2 leading-relaxed">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent-cool mt-1 shrink-0">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {result.weaknesses?.length > 0 && (
            <div className="bg-error/5 border border-error/20 rounded-lg p-3.5">
              <p className="text-[10px] font-bold text-error font-mono uppercase tracking-wider mb-2 select-none">Weaknesses</p>
              <ul className="space-y-1 text-xs text-text/80 pl-2 leading-relaxed">
                {result.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-error mt-1 shrink-0">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3.5">
              <p className="text-[10px] font-bold text-accent font-mono uppercase tracking-wider mb-2 select-none font-semibold">ATS suggestions</p>
              <ul className="space-y-1 text-xs text-text/80 pl-2 leading-relaxed font-sans">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent mt-1 shrink-0">•</span>
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