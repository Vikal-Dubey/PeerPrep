import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import { logoutUser } from "../utils/api";
import { FaPlus, FaSignOutAlt, FaDoorOpen, FaUserCircle } from "react-icons/fa";

const Dashboard = () => {
  const { user, setUser } = useContext(DataContext);
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
    if (!joinCode.trim()) return;
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

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-display">
      {/* Top Header */}
      <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 cursor-pointer animate-fadeIn" onClick={() => navigate("/")}>
          <span className="text-2xl font-bold bg-gradient-to-r from-accent to-accent-cool bg-clip-text text-transparent">
            PeerPrep
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider border border-border px-1.5 py-0.5 rounded text-muted">
            Hub
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-4 animate-fadeIn">
            <div className="flex items-center gap-2 bg-bg border border-border rounded-lg px-3 py-1.5">
              <FaUserCircle className="text-accent w-4 h-4" />
              <span className="text-xs font-semibold text-text">{user.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-muted hover:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
            >
              <FaSignOutAlt className="w-3.5 h-3.5" />
              Log Out
            </button>
          </div>
        )}
      </header>

      {/* Main content grid */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl flex flex-col gap-8 items-center">
          <div className="text-center space-y-2 max-w-md animate-fadeIn">
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome to PeerPrep workspace</h1>
            <p className="text-muted text-sm leading-relaxed">
              Create an instant interview room, share the room code with your peer, and start coding collaboratively with integrated video call and AI evaluation.
            </p>
          </div>

          {error && (
            <div className="w-full max-w-lg bg-rose-500/10 text-rose-400 text-sm px-4 py-3 rounded-lg border border-rose-500/20 text-center animate-shake">
              {error}
            </div>
          )}

          {/* Action Boxes */}
          <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
            {/* Create Meeting Card */}
            <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between items-start gap-4 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all group">
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-text">Host Session</h3>
                <p className="text-xs text-muted leading-relaxed">Instantly generate a room and start an interview session.</p>
              </div>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full bg-accent hover:bg-accent/90 text-bg font-extrabold text-sm py-2.5 rounded-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-accent/15"
              >
                {creating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FaPlus className="w-3 h-3" />
                    Create Meeting
                  </>
                )}
              </button>
            </div>

            {/* Join Meeting Card */}
            <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between items-start gap-4 hover:border-accent-cool/40 hover:shadow-lg hover:shadow-accent-cool/5 transition-all group">
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-text">Join Session</h3>
                <p className="text-xs text-muted leading-relaxed">Enter a unique session code shared by your peer.</p>
              </div>
              <form onSubmit={handleJoin} className="w-full flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Enter room code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full bg-bg border border-border text-text font-mono text-sm rounded-lg px-3.5 py-2 focus:border-accent-cool/60 outline-none transition-all placeholder:text-muted/40 text-center"
                />
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="w-full bg-surface hover:bg-accent-cool hover:text-white border border-border hover:border-accent-cool text-text font-extrabold text-sm py-2.5 rounded-lg active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaDoorOpen className="w-3.5 h-3.5" />
                  Join Room
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;