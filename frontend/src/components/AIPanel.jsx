import { useState, useEffect } from "react";
import { FaCopy, FaCheck } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
    if (score >= 8) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 5) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-5 text-text shadow-xl">
      <div>
        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          AI Mock Interviewer
        </h2>
        <p className="text-muted text-xs font-mono mt-1">Generate questions & evaluate responses collaboratively</p>
      </div>

      {/* Role and Difficulty selection */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-muted text-xs font-mono">Position / Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Frontend Developer"
            className="w-full bg-bg border border-border text-text text-sm rounded-md px-3 py-2 outline-none focus:border-accent-cool transition-all placeholder:text-muted/50"
          />
        </div>
        <div className="w-full sm:w-32 flex flex-col gap-1">
          <label className="text-muted text-xs font-mono">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="bg-bg border border-border text-text text-sm rounded-md px-3 py-2 outline-none focus:border-accent-cool transition-all"
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
        className="w-full bg-accent text-bg font-bold text-sm py-2 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loadingQuestions ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
            Generating Technical Questions...
          </span>
        ) : (
          "Generate Questions"
        )}
      </button>

      {/* Questions list */}
      {questions.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <span className="text-muted text-xs font-mono uppercase tracking-wider mb-1">Select a Question to Answer:</span>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {questions.map((q, i) => (
              <div
                key={i}
                onClick={() => {
                  setSelectedQuestion(q);
                  setEvaluation(null);
                  setAnswer("");
                }}
                className={`flex items-start justify-between gap-3 p-3 rounded-lg text-sm transition-all border cursor-pointer ${
                  selectedQuestion === q
                    ? "bg-accent-cool/10 border-accent-cool text-accent-cool font-medium shadow-md shadow-accent-cool/5"
                    : "bg-bg/40 border-border/80 hover:bg-bg/85 hover:border-border text-text/90"
                }`}
              >
                <div className="flex gap-2.5 items-start flex-1">
                  <span className="bg-bg border border-border text-muted text-xs font-mono px-2 py-0.5 rounded-md mt-0.5 shrink-0">
                    Q{i + 1}
                  </span>
                  <span>{q}</span>
                </div>
                <button
                  onClick={(e) => handleCopyQuestion(q, i, e)}
                  className="p-1.5 rounded bg-bg/50 border border-border text-muted hover:text-accent transition-colors hover:bg-bg cursor-pointer shrink-0"
                  title="Copy question text"
                >
                  {copiedIndex === i ? (
                    <FaCheck className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <FaCopy className="w-3 h-3" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer Form */}
      {selectedQuestion && (
        <div className="flex flex-col gap-3 border-t border-border pt-4 animate-fadeIn">
          <div className="bg-bg/60 border border-border p-3 rounded-lg text-sm text-text/80 italic font-medium leading-relaxed flex justify-between items-start gap-4">
            <span className="flex-1">"{selectedQuestion}"</span>
            <button
              onClick={(e) => handleCopyQuestion(selectedQuestion, "selected", e)}
              className="p-1.5 rounded bg-bg/85 border border-border text-muted hover:text-accent transition-colors shrink-0 cursor-pointer"
              title="Copy question text"
            >
              {copiedIndex === "selected" ? (
                <FaCheck className="w-3 h-3 text-emerald-400" />
              ) : (
                <FaCopy className="w-3 h-3" />
              )}
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-muted text-xs font-mono">Your / Candidate's Response</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your spoken or typed answer here for real-time AI evaluation..."
              className="bg-bg border border-border text-text text-sm rounded-md px-3 py-2 h-24 outline-none focus:border-accent-cool transition-all placeholder:text-muted/40 resize-none"
            />
          </div>
          <button
            onClick={handleEvaluate}
            disabled={loadingEval || !answer.trim()}
            className="w-full bg-accent-cool text-white font-bold text-sm py-2 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loadingEval ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Interviewer Reviewing...
              </span>
            ) : (
              "Evaluate Response"
            )}
          </button>
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && (
        <div className="border-t border-border pt-4 flex flex-col gap-3 animate-fadeIn">
          <div className="flex items-center justify-between bg-bg/50 border border-border rounded-lg p-3">
            <span className="text-sm font-semibold">Evaluation Result</span>
            <div className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${getScoreColor(evaluation.score)}`}>
              Score: {evaluation.score} / 10
            </div>
          </div>

          <p className="text-sm text-text/90 leading-relaxed bg-bg/30 p-3 rounded-lg border border-border/50">
            {evaluation.feedback}
          </p>

          {evaluation.strengths?.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
              <p className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider mb-2">Strengths</p>
              <ul className="space-y-1 text-sm text-text/80 pl-2">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1 shrink-0 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.weaknesses?.length > 0 && (
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-3">
              <p className="text-xs font-bold text-rose-400 font-mono uppercase tracking-wider mb-2">Areas for Improvement</p>
              <ul className="space-y-1 text-sm text-text/80 pl-2">
                {evaluation.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1 shrink-0 font-bold">•</span>
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