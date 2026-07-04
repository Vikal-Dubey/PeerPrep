import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/rooms`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      navigate(`/room/${data.code}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/rooms/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: joinCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      navigate(`/room/${data.code}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 gap-8">
      <h1 className="text-3xl font-bold text-blue-600">PeerPrep</h1>

      {error && (
        <p className="bg-red-100 text-red-600 text-sm p-2 rounded">{error}</p>
      )}

      <button
        onClick={handleCreate}
        disabled={creating}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {creating ? "Creating..." : "Create Meeting"}
      </button>

      <form onSubmit={handleJoin} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter room code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
        >
          Join Meeting
        </button>
      </form>
    </div>
  );
};

export default Dashboard;