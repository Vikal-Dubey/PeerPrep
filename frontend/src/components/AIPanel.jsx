import { useState, useEffect } from "react";
import { FaCopy, FaCheck } from "react-icons/fa";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

const AIPanel = ({ socket, roomId }) => {
  const [role, setRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [loadingEval, setLoadingEval] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopyQuestion = (questionText, index, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(questionText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Sync state over socket when other peer performs actions
  useEffect(() => {
    const handleQuestionsUpdate = (updatedQuestions) => {
      setQuestions(updatedQuestions);
      setEvaluation(null);
      setSelectedQuestion("");
      setAnswer("");
    };

    const handleEvaluationUpdate = ({ evaluation: evalData, question }) => {
      setSelectedQuestion(question);
      setEvaluation(evalData);
    };

    socket.on("ai-questions-update", handleQuestionsUpdate);
    socket.on("ai-evaluation-update", handleEvaluationUpdate);

    return () => {
      socket.off("ai-questions-update", handleQuestionsUpdate);
      socket.off("ai-evaluation-update", handleEvaluationUpdate);
    };
  }, [socket]);

  const handleGenerateQuestions = async () => {
    if (!role.trim()) return;
    setLoadingQuestions(true);
    setEvaluation(null);
    setSelectedQuestion("");
    setAnswer("");
    try {
      const res = await fetch(`${API_URL}/api/ai/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role, difficulty }),
      });
      const data = await res.json();
      const generatedQuestions = data.questions || [];
      setQuestions(generatedQuestions);
      
      // Broadcast the generated questions so the other participant sees them
      socket.emit("ai-questions", { roomId, questions: generatedQuestions });
    } catch (err) {
      console.error("Failed to generate questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedQuestion || !answer.trim()) return;
    setLoadingEval(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/evaluate-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question: selectedQuestion, answer }),
      });
      const data = await res.json();
      setEvaluation(data);
      
      // Broadcast evaluation so peer sees feedback and score
      socket.emit("ai-evaluation", { roomId, evaluation: data, question: selectedQuestion });
    } catch (err) {
      console.error("Failed to evaluate answer:", err);
    } finally {
      setLoadingEval(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-accent-cool border-accent-cool/30 bg-accent-cool/10";
    if (score >= 5) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-error border-error/30 bg-error/10";
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-5 text-text shadow-xl font-display">
      <div className="select-none">
        <h2 className="text-base font-bold tracking-wide flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          AI Assistant
        </h2>
        <p className="text-muted text-[10px] font-mono mt-1 uppercase tracking-wider">Generate questions & evaluate responses</p>
      </div>

      {/* Role and Difficulty selection */}
      <div className="flex flex-col gap-3 sm:flex-row select-none">
        <div className="flex-1 flex flex-col gap-1.5">
          <label className="text-muted text-[10px] font-mono uppercase tracking-wider">Target Job Position</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Frontend Developer"
            className="w-full bg-bg border border-border text-text text-sm rounded-lg px-3.5 py-2 outline-none focus:border-accent transition-all placeholder:text-muted/40 font-mono"
          />
        </div>
        <div className="w-full sm:w-32 flex flex-col gap-1.5">
          <label className="text-muted text-[10px] font-mono uppercase tracking-wider">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="bg-bg border border-border text-text text-sm rounded-lg px-3.5 py-2 outline-none focus:border-accent transition-all font-mono cursor-pointer"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerateQuestions}
        disabled={loadingQuestions || !role.trim()}
        className="w-full bg-accent hover:bg-accent/90 text-text-light font-bold text-xs py-2.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-accent/15 cursor-pointer select-none"
      >
        {loadingQuestions ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-text-light border-t-transparent rounded-full animate-spin" />
            Generating Technical Questions...
          </span>
        ) : (
          "Generate Questions"
        )}
      </button>

      {/* Questions list */}
      {questions.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border/80 pt-4">
          <span className="text-muted text-[10px] font-mono uppercase tracking-wider mb-1 select-none">Select a question to practice:</span>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {questions.map((q, i) => (
              <div
                key={i}
                onClick={() => {
                  setSelectedQuestion(q);
                  setEvaluation(null);
                  setAnswer("");
                }}
                className={`flex items-start justify-between gap-3 p-3 rounded-lg text-xs transition-all border cursor-pointer ${
                  selectedQuestion === q
                    ? "bg-accent/5 border-accent text-accent font-medium shadow-md shadow-accent/5"
                    : "bg-bg/40 border-border hover:bg-bg/80 hover:border-border text-text/85"
                }`}
              >
                <div className="flex gap-2 items-start flex-1">
                  <span className="bg-bg border border-border text-muted/80 text-[10px] font-mono px-1.5 py-0.5 rounded mt-0.5 shrink-0 select-none">
                    Q{i + 1}
                  </span>
                  <span className="leading-relaxed">{q}</span>
                </div>
                <button
                  onClick={(e) => handleCopyQuestion(q, i, e)}
                  className="p-1 rounded bg-bg border border-border text-muted hover:text-accent transition-colors cursor-pointer shrink-0"
                  title="Copy question"
                >
                  {copiedIndex === i ? (
                    <FaCheck className="w-2.5 h-2.5 text-accent-cool" />
                  ) : (
                    <FaCopy className="w-2.5 h-2.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer Form */}
      {selectedQuestion && (
        <div className="flex flex-col gap-3.5 border-t border-border/80 pt-4 animate-fadeIn">
          <div className="bg-bg/50 border border-border p-3 rounded-lg text-xs text-text/80 italic leading-relaxed flex justify-between items-start gap-4">
            <span className="flex-1">"{selectedQuestion}"</span>
            <button
              onClick={(e) => handleCopyQuestion(selectedQuestion, "selected", e)}
              className="p-1 rounded bg-bg border border-border text-muted hover:text-accent transition-colors shrink-0 cursor-pointer"
              title="Copy question"
            >
              {copiedIndex === "selected" ? (
                <FaCheck className="w-2.5 h-2.5 text-accent-cool" />
              ) : (
                <FaCopy className="w-2.5 h-2.5" />
              )}
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-muted text-[10px] font-mono uppercase tracking-wider select-none font-semibold">Your Response</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your coding response here for real-time AI evaluation scorecard..."
              className="bg-bg border border-border text-text text-xs rounded-lg px-3.5 py-2.5 h-24 outline-none focus:border-accent transition-all placeholder:text-muted/40 resize-none font-mono"
            />
          </div>
          <button
            onClick={handleEvaluate}
            disabled={loadingEval || !answer.trim()}
            className="w-full bg-accent hover:bg-accent/90 text-text-light font-bold text-xs py-2.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-accent/15 cursor-pointer select-none"
          >
            {loadingEval ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-text-light border-t-transparent rounded-full animate-spin" />
                Interviewer Analyzing...
              </span>
            ) : (
              "Evaluate Response"
            )}
          </button>
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && (
        <div className="border-t border-border/80 pt-4 flex flex-col gap-4.5 animate-fadeIn">
          <div className="flex items-center justify-between bg-bg/50 border border-border rounded-lg p-3 select-none">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-muted">Technical Evaluation Score</span>
            <div className={`px-3 py-1 rounded border text-xs font-mono font-bold ${getScoreColor(evaluation.score)}`}>
              {evaluation.score} / 10
            </div>
          </div>

          <p className="text-xs text-text/85 leading-relaxed bg-bg/25 p-3.5 rounded-lg border border-border/60">
            {evaluation.feedback}
          </p>

          {evaluation.strengths?.length > 0 && (
            <div className="bg-accent-cool/5 border border-accent-cool/20 rounded-lg p-3.5">
              <p className="text-[10px] font-bold text-accent-cool font-mono uppercase tracking-wider mb-2 select-none">Key Strengths</p>
              <ul className="space-y-1 text-xs text-text/80 pl-2 leading-relaxed">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent-cool mt-1 shrink-0">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.weaknesses?.length > 0 && (
            <div className="bg-error/5 border border-error/20 rounded-lg p-3.5">
              <p className="text-[10px] font-bold text-error font-mono uppercase tracking-wider mb-2 select-none">Areas for Improvement</p>
              <ul className="space-y-1 text-xs text-text/80 pl-2 leading-relaxed">
                {evaluation.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-error mt-1 shrink-0">•</span>
                    <span>{w}</span>
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

export default AIPanel;