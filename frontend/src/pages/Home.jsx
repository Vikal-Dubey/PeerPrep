import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import { logoutUser } from "../utils/api";
import { FaLinkedin, FaGithub, FaCode, FaVideo, FaRobot, FaTerminal, FaBook, FaFileAlt } from "react-icons/fa";

const Home = () => {
  const { user, setUser, authChecked } = useContext(DataContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate("/");
  };

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-muted font-mono text-xs">Initializing PeerPrep...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-display selection:bg-accent/20 selection:text-accent">
      {/* Premium Navbar */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 px-6 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-accent via-purple-400 to-accent-cool bg-clip-text text-transparent">
            PeerPrep
          </span>
          <span className="text-[9px] uppercase font-mono tracking-widest border border-border px-1.5 py-0.5 rounded text-muted font-semibold bg-bg">
            SaaS
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-xs text-muted font-mono hidden sm:inline-block">
                Logged in as <span className="text-text font-bold">{user.username}</span>
              </span>
              <Link
                to="/dashboard"
                className="bg-accent hover:bg-accent/90 text-text-light font-bold text-xs px-4 py-2 rounded-lg transition-all active:scale-95"
              >
                Go to dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-muted hover:text-error transition-colors font-bold font-mono cursor-pointer"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs text-muted hover:text-text font-bold transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="bg-accent hover:bg-accent/90 text-text-light font-bold text-xs px-4 py-2 rounded-lg transition-all active:scale-95 shadow-lg shadow-accent/10"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-6 py-20 max-w-5xl mx-auto w-full gap-24">
        <section className="text-center space-y-6 max-w-2xl flex flex-col items-center animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-mono font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            AI-powered developer workspace
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-text leading-[1.1] font-display">
            Your interview.<br/>Your workspace.
          </h1>
          
          <p className="text-muted text-base md:text-lg max-w-lg leading-relaxed">
            Practice technical interviews together with real-time coding, video collaboration, AI feedback, and code execution.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-accent hover:bg-accent/90 text-text-light font-bold text-sm px-6 py-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-accent/15"
              >
                Enter dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-accent hover:bg-accent/90 text-text-light font-bold text-sm px-6 py-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-accent/15"
                >
                  Start an interview
                </Link>
                <Link
                  to="/signup"
                  className="bg-surface border border-border hover:border-accent-cool/40 hover:bg-surface-elevated text-text font-bold text-sm px-6 py-3 rounded-lg transition-all active:scale-95"
                >
                  Join a room
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="w-full space-y-8 border-t border-border/40 pt-16">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Everything you need for better interviews</h2>
            <p className="text-muted text-sm max-w-md mx-auto">A unified interface mapping live actions directly to candidates and interviewers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-surface border border-border/60 hover:border-accent/40 rounded-xl p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <FaCode className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-text group-hover:text-accent transition-colors">Live collaborative coding</h4>
                <p className="text-xs text-muted leading-relaxed">Code simultaneously with cursor tracking, edits syncing, and auto-completions in Monaco editor.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface border border-border/60 hover:border-accent-cool/40 rounded-xl p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-cool/5 transition-all duration-300 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-accent-cool/10 border border-accent-cool/20 flex items-center justify-center text-accent-cool">
                <FaVideo className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-text group-hover:text-accent-cool transition-colors">Video interviews</h4>
                <p className="text-xs text-muted leading-relaxed">Integrated low-latency WebRTC video and audio streams to communicate cleanly during problem solving.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface border border-border/60 hover:border-accent/40 rounded-xl p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <FaRobot className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-text group-hover:text-accent transition-colors">AI interview feedback</h4>
                <p className="text-xs text-muted leading-relaxed">Get Google Gemini-powered reviews, interview grading scorecards, and custom code hints instantly.</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-surface border border-border/60 hover:border-accent-cool/40 rounded-xl p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-cool/5 transition-all duration-300 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-accent-cool/10 border border-accent-cool/20 flex items-center justify-center text-accent-cool">
                <FaTerminal className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-text group-hover:text-accent-cool transition-colors">Code execution</h4>
                <p className="text-xs text-muted leading-relaxed">Run programs in a secured Judge0 compilation sandbox with custom stdin variables and test outputs.</p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-surface border border-border/60 hover:border-accent/40 rounded-xl p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <FaBook className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-text group-hover:text-accent transition-colors">Shared notes</h4>
                <p className="text-xs text-muted leading-relaxed">Draft documentation, jot down test cases, and model notes inside a shared rich-text Quill Notepad.</p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-surface border border-border/60 hover:border-accent-cool/40 rounded-xl p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent-cool/5 transition-all duration-300 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-accent-cool/10 border border-accent-cool/20 flex items-center justify-center text-accent-cool">
                <FaFileAlt className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-text group-hover:text-accent-cool transition-colors">Resume and ATS analysis</h4>
                <p className="text-xs text-muted leading-relaxed">Scan candidate resumes dynamically against job criteria to analyze compatibility match rates.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Timeline */}
        <section className="w-full border-t border-border/40 pt-16 space-y-10">
          <h2 className="text-2xl font-bold text-center">How PeerPrep works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Timeline connectors for desktop */}
            <div className="absolute top-12 left-12 right-12 h-0.5 bg-border/40 hidden md:block z-0" />
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-surface/40 border border-border/40 rounded-xl gap-3 group hover:border-accent/40 hover:-translate-y-1 transition-all duration-300 shadow-sm z-10 cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-border bg-surface flex items-center justify-center font-mono font-black text-base text-accent group-hover:bg-accent group-hover:text-bg group-hover:scale-110 transition-all duration-300 shadow">
                01
              </div>
              <h4 className="font-bold text-sm text-text">Create or join</h4>
              <p className="text-xs text-muted max-w-[200px] leading-relaxed">
                Log in and boot up a dynamic code room from the hub.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-surface/40 border border-border/40 rounded-xl gap-3 group hover:border-accent-cool/40 hover:-translate-y-1 transition-all duration-300 shadow-sm z-10 cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-border bg-surface flex items-center justify-center font-mono font-black text-base text-accent-cool group-hover:bg-accent-cool group-hover:text-bg group-hover:scale-110 transition-all duration-300 shadow">
                02
              </div>
              <h4 className="font-bold text-sm text-text">Enter the workspace</h4>
              <p className="text-xs text-muted max-w-[200px] leading-relaxed">
                Open the interactive compiler suite in one screen.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-surface/40 border border-border/40 rounded-xl gap-3 group hover:border-accent/40 hover:-translate-y-1 transition-all duration-300 shadow-sm z-10 cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-border bg-surface flex items-center justify-center font-mono font-black text-base text-accent group-hover:bg-accent group-hover:text-bg group-hover:scale-110 transition-all duration-300 shadow">
                03
              </div>
              <h4 className="font-bold text-sm text-text">Collaborate</h4>
              <p className="text-xs text-muted max-w-[200px] leading-relaxed">
                Talk, note, and edit code together in sync.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center p-6 bg-surface/40 border border-border/40 rounded-xl gap-3 group hover:border-accent-cool/40 hover:-translate-y-1 transition-all duration-300 shadow-sm z-10 cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-border bg-surface flex items-center justify-center font-mono font-black text-base text-accent-cool group-hover:bg-accent-cool group-hover:text-bg group-hover:scale-110 transition-all duration-300 shadow">
                04
              </div>
              <h4 className="font-bold text-sm text-text">Practice and improve</h4>
              <p className="text-xs text-muted max-w-[200px] leading-relaxed">
                Evaluate outputs and mock gradings with AI scorecards.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Premium Footer */}
      <footer className="bg-surface border-t border-border mt-auto px-6 py-10 text-sm text-muted font-mono w-full">
        <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row justify-between gap-10">
          <div className="space-y-2">
            <span className="text-lg font-bold text-text bg-gradient-to-r from-accent to-accent-cool bg-clip-text text-transparent">
              PeerPrep
            </span>
            <p className="max-w-[280px] leading-relaxed text-xs text-muted/80">
              Collaborative technical interview practice workspace.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="flex flex-col gap-2.5">
              <span className="font-bold font-mono text-xs tracking-wide text-text uppercase">Product</span>
              <a href="#features" className="text-xs text-muted hover:text-accent transition-colors">Features</a>
              <a href="#timeline" className="text-xs text-muted hover:text-accent transition-colors">How it works</a>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="font-bold font-mono text-xs tracking-wide text-text uppercase">Connect</span>
              <div className="flex items-center gap-3 pt-1">
                <a href="https://www.linkedin.com/in/vikal-dubey-682818325/" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center text-muted hover:text-accent-cool hover:border-accent-cool/60 hover:scale-110 active:scale-95 transition-all shadow-sm" title="LinkedIn Profile">
                  <FaLinkedin className="w-3.5 h-3.5" />
                </a>
                <a href="https://github.com/Vikal-Dubey" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center text-muted hover:text-text hover:border-text/60 hover:scale-110 active:scale-95 transition-all shadow-sm" title="GitHub Repository">
                  <FaGithub className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-2 col-span-2 sm:col-span-1">
              <span className="font-bold font-mono text-xs tracking-wide text-text uppercase">Contact</span>
              <span className="text-xs text-muted/80 select-all">info@peerprep.com</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full border-t border-border/40 pt-6 mt-8 flex justify-center text-xs text-muted/90 font-medium font-mono">
          <span className="tracking-wide text-center text-muted/60">&copy; 2026 PeerPrep. Built for better technical interviews.</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;