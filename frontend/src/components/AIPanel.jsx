import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const AIPanel = ({ socket, roomId }) => {
  const [role, setRole] = useState("Frontend Developer");
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [loadingEval, setLoadingEval] = useState(false);

  const handleGenerateQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role, difficulty: "medium" }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      // Broadcast the generated questions so both participants see them
      socket.emit("ai-questions", { roomId, questions: data.questions });
    } catch (err) {
      console.error("Failed to generate questions:", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedQuestion || !answer) return;
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
      socket.emit("ai-evaluation", { roomId, evaluation: data, question: selectedQuestion });
    } catch (err) {
      console.error("Failed to evaluate answer:", err);
    } finally {
      setLoadingEval(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-4">
      <h2 className="font-semibold text-sm">AI Interviewer</h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Frontend Developer"
          className="border rounded px-2 py-1 text-sm flex-1"
        />
        <button
          onClick={handleGenerateQuestions}
          disabled={loadingQuestions}
          className="bg-blue-600 text-white text-sm px-3 py-1 rounded disabled:opacity-50"
        >
          {loadingQuestions ? "Generating..." : "Generate Questions"}
        </button>
      </div>

      {questions.length > 0 && (
        <ul className="text-sm space-y-1">
          {questions.map((q, i) => (
            <li key={i}>
              <button
                onClick={() => setSelectedQuestion(q)}
                className={`text-left w-full p-2 rounded hover:bg-gray-100 ${
                  selectedQuestion === q ? "bg-blue-50 border border-blue-300" : ""
                }`}
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedQuestion && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500">Evaluating: {selectedQuestion}</p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Candidate's spoken/typed answer..."
            className="border rounded px-2 py-1 text-sm h-20"
          />
          <button
            onClick={handleEvaluate}
            disabled={loadingEval}
            className="bg-green-600 text-white text-sm px-3 py-1 rounded disabled:opacity-50 self-start"
          >
            {loadingEval ? "Evaluating..." : "Evaluate Answer"}
          </button>
        </div>
      )}

      {evaluation && (
        <div className="border-t pt-3 text-sm">
          <p className="font-semibold">Score: {evaluation.score}/10</p>
          <p className="mt-1 text-gray-700">{evaluation.feedback}</p>
          {evaluation.strengths?.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-green-700">Strengths:</p>
              <ul className="list-disc list-inside text-gray-600">
                {evaluation.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {evaluation.weaknesses?.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-red-700">Weaknesses:</p>
              <ul className="list-disc list-inside text-gray-600">
                {evaluation.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIPanel;