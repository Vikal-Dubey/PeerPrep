import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import { logoutUser } from "../utils/api";
import { FaPlus, FaSignOutAlt, FaDoorOpen, FaUserCircle, FaLinkedin, FaGithub, FaCode, FaVideo, FaRobot, FaTerminal, FaBook, FaFileAlt } from "react-icons/fa";

const Dashboard = () => {
  const { user, setUser } = useContext(DataContext);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

  // Mock Workspace Simulation States (Demo mode only)
  const [simulationState, setSimulationState] = useState(0); // 0: typing, 1: compiling, 2: success, 3: ai_score
  const [simulatedCode, setSimulatedCode] = useState("");

  useEffect(() => {
    let active = true;
    let timer;
    let typingInterval;

    const runSimulation = () => {
      if (!active) return;
      setSimulationState(0);
      setSimulatedCode("");

      let codeText = "";
      const lines = [
        "function solve() {",
        "  return \"Ready\";",
        "}"
      ];
      let lineIdx = 0;
      let charIdx = 0;

      typingInterval = setInterval(() => {
        if (!active) return;
        if (lineIdx < lines.length) {
          const line = lines[lineIdx];
          if (charIdx < line.length) {
            codeText += line[charIdx];
            setSimulatedCode(codeText + "_");
            charIdx++;
          } else {
            codeText += "\n";
            lineIdx++;
            charIdx = 0;
          }
        } else {
          clearInterval(typingInterval);
          setSimulatedCode(codeText);

          // Compiling stage
          timer = setTimeout(() => {
            if (!active) return;
            setSimulationState(1);

            // Output success stage
            timer = setTimeout(() => {
              if (!active) return;
              setSimulationState(2);

              // AI scorecard stage
              timer = setTimeout(() => {
                if (!active) return;
                setSimulationState(3);

                // Restart simulation loop
                timer = setTimeout(() => {
                  if (active) runSimulation();
                }, 4000);
              }, 2500);
            }, 1800);
          }, 1200);
        }
      }, 75);
    };

    runSimulation();

    return () => {
      active = false;
      clearInterval(typingInterval);
      clearTimeout(timer);
    };
  }, []);

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

  const scrollToActions = () => {
    document.getElementById("action-cards")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-display selection:bg-accent/20 selection:text-accent">
      {/* Sticky Header */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 px-6 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-accent to-accent-cool bg-clip-text text-transparent">
            PeerPrep
          </span>
          <span className="text-[9px] uppercase font-mono tracking-widest border border-border px-1.5 py-0.5 rounded text-muted font-semibold bg-bg">
            Hub
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-surface-elevated border border-border rounded-lg px-3 py-1.5 shadow-sm">
              <FaUserCircle className="text-accent-cool w-4 h-4" />
              <span className="text-xs font-semibold text-text font-mono">{user.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-muted hover:text-error text-xs font-bold font-mono transition-colors cursor-pointer"
            >
              <FaSignOutAlt className="w-3.5 h-3.5" />
              Log out
            </button>
          </div>
        )}
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 flex flex-col items-center p-6 gap-20 max-w-5xl mx-auto w-full">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-2xl mt-10 flex flex-col items-center animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-cool/20 bg-accent-cool/5 text-accent-cool text-xs font-mono font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cool animate-pulse" />
            Interview preparation portal
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-text leading-[1.1] font-display">
            Your interview.<br/>Your workspace.
          </h1>
          
          <p className="text-muted text-base md:text-lg max-w-lg leading-relaxed">
            Practice technical interviews together with real-time coding, video collaboration, AI feedback, and code execution.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="bg-accent hover:bg-accent/90 text-text-light font-bold text-sm px-6 py-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-accent/15 flex items-center gap-2 cursor-pointer"
            >
              {creating ? (
                <>
                  <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FaPlus className="w-3.5 h-3.5" />
                  Start an interview
                </>
              )}
            </button>
            <button
              onClick={scrollToActions}
              className="bg-surface border border-border hover:border-accent-cool/40 hover:bg-surface-elevated text-text font-bold text-sm px-6 py-3 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              Join a room
            </button>
          </div>
        </section>

        {/* Contained Mock Workspace Visualization */}
        <section className="w-full max-w-3xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden p-4 flex flex-col gap-4 select-none animate-fadeIn">
          {/* Mock Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse-slow absolute inline-flex h-full w-full rounded-full bg-accent-cool opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cool"></span>
              </span>
              <span className="text-xs font-bold text-text">Workspace preview</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500/80 animate-pulse" />
              <span className="text-[10px] text-muted/65 font-mono uppercase tracking-wide">Demo mode</span>
            </div>
          </div>

          {/* Grid Layout simulating the workspace */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-48">
            {/* Participants list */}
            <div className="md:col-span-3 bg-surface-elevated border border-border/80 rounded-lg p-3 flex flex-col gap-2.5 justify-between">
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-mono tracking-widest text-muted/70 block">Participants</span>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-cool" />
                    <span className="text-text/90">Interviewer</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-cool" />
                    <span className="text-text/90">Candidate</span>
                  </div>
                </div>
              </div>
              <div className="h-10 bg-bg/50 border border-border rounded flex items-center justify-center text-[10px] font-mono text-muted/50">
                🎥 Video grid
              </div>
            </div>

            {/* Monaco code editor mockup */}
            <div className="md:col-span-5 bg-surface-elevated border border-border/80 rounded-lg p-3.5 font-mono text-[11px] flex flex-col gap-1.5 justify-between h-full relative">
              <div className="absolute top-2 right-2 text-[8px] text-muted/40 uppercase tracking-widest">monaco</div>
              <div className="space-y-0.5 text-accent-cool">
                <div className="text-muted/40 font-mono">// Real-time Sync</div>
                <div className="text-accent">
                  {simulatedCode}
                  {simulationState === 0 && <span className="w-1 h-3.5 bg-accent-cool inline-block align-middle animate-cursor" />}
                </div>
              </div>
              <span className="text-[9px] font-mono text-muted/30 text-right block uppercase">workspace.js</span>
            </div>

            {/* AI Review Mockup */}
            <div className="md:col-span-4 bg-surface-elevated border border-border/80 rounded-lg p-3.5 flex flex-col justify-between h-full">
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-mono tracking-widest text-accent font-black block">AI feedback</span>
                <div className="flex justify-between items-baseline border-b border-border/40 pb-1.5">
                  <span className="text-xs font-semibold text-text">Score</span>
                  <span className="text-base font-extrabold text-accent">
                    {simulationState === 3 ? "92%" : "--"}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-[10px] text-muted/80">
                  <span className={simulationState === 3 ? "text-accent-cool" : "text-muted/30"}>✓</span>
                  <span>Approach</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted/80">
                  <span className={simulationState === 3 ? "text-accent-cool" : "text-muted/30"}>✓</span>
                  <span>Complexity</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom terminal bar */}
          <div className="bg-bg border border-border rounded-lg p-3 font-mono text-xs flex justify-between items-center h-10 select-none">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cool" />
              <span className="text-muted/70 text-[10px] uppercase font-bold tracking-wide">Terminal output</span>
            </div>
            <div className="text-[10px]">
              {simulationState === 0 && <span className="text-muted/40 font-mono">Awaiting code changes...</span>}
              {simulationState === 1 && <span className="text-accent animate-pulse font-mono">Compiling solution in sandbox...</span>}
              {simulationState === 2 && <span className="text-accent-cool font-bold font-mono">✓ Sandbox output synced successfully</span>}
              {simulationState === 3 && <span className="text-accent-cool font-bold font-mono">✓ Passed 3/3 test cases</span>}
            </div>
          </div>
        </section>

        {error && (
          <div className="w-full max-w-lg bg-error/10 text-error text-xs px-4 py-3 rounded-lg border border-error/20 text-center animate-shake leading-relaxed">
            {error}
          </div>
        )}

        {/* Action Cards (Host & Join) */}
        <section id="action-cards" className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          {/* Create Meeting Card */}
          <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between items-start gap-5 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group">
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-text">Host session</h3>
              <p className="text-xs text-muted leading-relaxed">Instantly generate a room and start an interview session.</p>
            </div>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full bg-accent hover:bg-accent/90 text-text-light font-bold text-xs py-2.5 rounded-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-accent/15"
            >
              {creating ? (
                <>
                  <span className="w-4 h-4 border-2 border-text-light border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FaPlus className="w-3 h-3" />
                  Start an interview
                </>
              )}
            </button>
          </div>

          {/* Join Meeting Card */}
          <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between items-start gap-5 hover:border-accent-cool/40 hover:shadow-lg hover:shadow-accent-cool/5 transition-all duration-300 group">
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-text">Join session</h3>
              <p className="text-xs text-muted leading-relaxed">Enter a room code shared by your peer.</p>
            </div>
            <form onSubmit={handleJoin} className="w-full flex flex-col gap-2">
              <input
                type="text"
                placeholder="Enter room code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full bg-bg border border-border text-text font-mono text-xs rounded-lg px-3.5 py-2.5 focus:border-accent-cool/60 outline-none transition-all placeholder:text-muted/45 text-center uppercase tracking-widest"
              />
              <button
                type="submit"
                disabled={!joinCode.trim()}
                className="w-full bg-surface hover:bg-accent-cool hover:text-white border border-border hover:border-accent-cool text-text font-bold text-xs py-2.5 rounded-lg active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <FaDoorOpen className="w-3.5 h-3.5" />
                Join an interview
              </button>
            </form>
          </div>
        </section>

        {/* How It Works Timeline */}
        <section className="w-full border-t border-border/40 pt-16 space-y-10 animate-fadeIn" id="timeline">
          <h2 className="text-2xl font-bold text-center">How PeerPrep works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
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

        {/* Feature Cards Section */}
        <section id="features" className="w-full border-t border-border/40 pt-16 space-y-8">
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

        {/* SaaS Closing CTA Block */}
        <section className="w-full border-t border-border/40 pt-16 pb-6 text-center space-y-6 max-w-2xl flex flex-col items-center animate-fadeIn">
          <h2 className="text-3xl font-extrabold tracking-tight text-text leading-tight">
            Stop preparing alone. Start practicing together.
          </h2>
          <p className="text-muted text-sm max-w-lg leading-relaxed font-mono">
            PeerPrep brings coding, communication, collaboration, and AI-powered feedback into one interview workspace.
          </p>
          <button
            onClick={scrollToActions}
            className="bg-accent hover:bg-accent/90 text-text-light font-bold text-sm px-6 py-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-accent/15 cursor-pointer"
          >
            Start practicing →
          </button>
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
              <a href="#features" className="text-xs text-muted hover:text-accent transition-colors font-sans font-semibold">Features</a>
              <a href="#timeline" className="text-xs text-muted hover:text-accent transition-colors font-sans font-semibold">How it works</a>
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
              <span className="text-xs text-muted/80 select-all font-sans">info@peerprep.com</span>
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

export default Dashboard;