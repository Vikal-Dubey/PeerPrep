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
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg gap-10">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold text-text">PeerPrep</h1>
        <p className="text-muted text-sm font-mono mt-1">start or join a session</p>
      </div>

      {error && (
        <p className="bg-red-500/10 text-red-400 text-sm px-3 py-2 rounded border border-red-500/20">
          {error}
        </p>
      )}

      <button
        onClick={handleCreate}
        disabled={creating}
        className="bg-accent text-bg font-semibold px-8 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {creating ? "Creating..." : "Create Meeting"}
      </button>

      <div className="flex items-center gap-3 text-muted text-xs font-mono w-64">
        <div className="flex-1 h-px bg-border" />
        or
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={handleJoin} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter room code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="bg-surface border border-border text-text font-mono text-sm rounded-md px-3 py-2 focus:border-accent-cool outline-none w-48"
        />
        <button
          type="submit"
          className="bg-surface border border-border text-text px-4 py-2 rounded-md hover:border-accent-cool transition-colors"
        >
          Join
        </button>
      </form>
    </div>
  );
};

export default Dashboard;