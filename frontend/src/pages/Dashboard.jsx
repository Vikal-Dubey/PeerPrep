import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import { logoutUser } from "../utils/api";
import { FaPlus, FaSignOutAlt, FaDoorOpen, FaUserCircle, FaLinkedin, FaGithub } from "react-icons/fa";

const Dashboard = () => {
  const { user, setUser } = useContext(DataContext);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

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
      <main className="flex-1 flex flex-col items-center p-6 gap-16 max-w-4xl mx-auto w-full">
        <div className="w-full flex flex-col gap-8 items-center mt-6">
          <div className="text-center space-y-3 max-w-lg animate-fadeIn">
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-text via-text-light to-muted bg-clip-text text-transparent">
              Ace Your Interviews with Confidence
            </h1>
            <p className="text-muted text-sm leading-relaxed max-w-md mx-auto">
              Practice with real-time video, a collaborative code editor, and AI-powered feedback — all in one room.
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
                    Start an Interview
                  </>
                )}
              </button>
            </div>

            {/* Join Meeting Card */}
            <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between items-start gap-4 hover:border-accent-cool/40 hover:shadow-lg hover:shadow-accent-cool/5 transition-all group">
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-text">Join Session</h3>
                <p className="text-xs text-muted leading-relaxed">Enter a room code shared by your peer.</p>
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
                  Join an Interview
                </button>
              </form>
            </div>
          </div>

          {/* Our Features Section */}
          <section className="w-full border-t border-border/40 pt-12 mt-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-text to-muted bg-clip-text text-transparent">
              Our Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-surface border border-border/60 rounded-xl p-5 flex flex-col gap-3 hover:border-accent/40 transition-all hover:translate-y-[-2px]">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-lg">
                  🎥
                </div>
                <h4 className="font-bold text-sm text-text">Audio and Video Calls</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Communicate seamlessly with crystal-clear audio and video.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-surface border border-border/60 rounded-xl p-5 flex flex-col gap-3 hover:border-accent/40 transition-all hover:translate-y-[-2px]">
                <div className="w-10 h-10 rounded-lg bg-accent-cool/10 flex items-center justify-center text-accent-cool text-lg">
                  💻
                </div>
                <h4 className="font-bold text-sm text-text">Collaborative Code Editor</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Code together in real-time with syntax highlighting and autocompletion.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-surface border border-border/60 rounded-xl p-5 flex flex-col gap-3 hover:border-accent/40 transition-all hover:translate-y-[-2px]">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 text-lg">
                  📝
                </div>
                <h4 className="font-bold text-sm text-text">Text Editor</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Take notes and plan your solutions with our integrated text editor.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="w-full border-t border-border/40 pt-12 mt-6 animate-fadeIn">
            <h2 className="text-2xl font-bold text-center mb-10 bg-gradient-to-r from-text to-muted bg-clip-text text-transparent">
              How it works
            </h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center p-6 bg-surface/40 border border-border/40 rounded-xl gap-3.5 group hover:border-accent/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-accent/5 cursor-pointer animate-fadeIn">
                <div className="w-12 h-12 rounded-full border border-border bg-surface flex items-center justify-center font-mono font-black text-base text-accent group-hover:bg-accent group-hover:text-bg group-hover:scale-110 transition-all duration-300">
                  1
                </div>
                <h4 className="font-bold text-base text-text font-mono">Sign Up</h4>
                <p className="text-sm text-muted/80 max-w-[200px] leading-relaxed font-mono">
                  Create an account to get started.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center p-6 bg-surface/40 border border-border/40 rounded-xl gap-3.5 group hover:border-accent-cool/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-accent-cool/5 cursor-pointer animate-fadeIn">
                <div className="w-12 h-12 rounded-full border border-border bg-surface flex items-center justify-center font-mono font-black text-base text-accent-cool group-hover:bg-accent-cool group-hover:text-bg group-hover:scale-110 transition-all duration-300">
                  2
                </div>
                <h4 className="font-bold text-base text-text font-mono">Create or Join</h4>
                <p className="text-sm text-muted/80 max-w-[200px] leading-relaxed font-mono">
                  Start or join an interview session.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center p-6 bg-surface/40 border border-border/40 rounded-xl gap-3.5 group hover:border-purple-500/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-purple-500/5 cursor-pointer animate-fadeIn">
                <div className="w-12 h-12 rounded-full border border-border bg-surface flex items-center justify-center font-mono font-black text-base text-purple-400 group-hover:bg-purple-400 group-hover:text-bg group-hover:scale-110 transition-all duration-300">
                  3
                </div>
                <h4 className="font-bold text-base text-text font-mono">Practice</h4>
                <p className="text-sm text-muted/80 max-w-[200px] leading-relaxed font-mono">
                  Use our tools to sharpen your interview skills.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-surface border-t border-border mt-auto px-6 py-10 text-sm text-muted font-mono w-full">
        <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row justify-between gap-10">
          <div className="space-y-2">
            <span className="text-lg font-bold text-text bg-gradient-to-r from-accent to-accent-cool bg-clip-text text-transparent">
              PeerPrep
            </span>
            <p className="max-w-[280px] leading-relaxed text-sm text-muted/80">
              An agent-first ecosystem designed for peer technical interviews and real-time collaboration.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="flex flex-col gap-2.5">
              <span className="font-bold font-mono text-sm tracking-wide text-text uppercase">Quick Links</span>
              <a href="https://hire-sense-ai-drab.vercel.app/#privacy" target="_blank" rel="noreferrer" className="text-sm text-muted hover:text-accent transition-colors">Privacy Policy</a>
              <a href="https://hire-sense-ai-drab.vercel.app/#terms" target="_blank" rel="noreferrer" className="text-sm text-muted hover:text-accent transition-colors">Terms of Service</a>
              <a href="https://hire-sense-ai-drab.vercel.app/#contact" target="_blank" rel="noreferrer" className="text-sm text-muted hover:text-accent transition-colors">Contact Us</a>
              <a href="#" className="text-sm text-muted hover:text-accent transition-colors">Support</a>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold font-mono text-sm tracking-wide text-text uppercase">Follow Us</span>
              <div className="flex items-center gap-3">
                <a href="https://www.linkedin.com/in/vikal-dubey-682818325/" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center text-muted hover:text-accent-cool hover:border-accent-cool/60 hover:scale-110 active:scale-95 transition-all shadow-sm" title="LinkedIn Profile">
                  <FaLinkedin className="w-4 h-4" />
                </a>
                <a href="https://github.com/Vikal-Dubey" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center text-muted hover:text-text hover:border-text/60 hover:scale-110 active:scale-95 transition-all shadow-sm" title="GitHub Repository">
                  <FaGithub className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
              <span className="font-bold font-mono text-sm tracking-wide text-text uppercase">Contact Us</span>
              <span className="text-sm text-muted/80 select-all">Email: info@peerprep.com</span>
              <span className="text-sm text-muted/80">Phone: +123 456 7890</span>
              <span className="text-sm text-muted/80">Address: 123 Main Street, City, Country</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full border-t border-border/40 pt-6 mt-8 flex justify-center text-sm text-muted/90 font-medium font-mono">
          <span className="tracking-wide text-center text-text-light">&copy; 2026 PeerPrep. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;