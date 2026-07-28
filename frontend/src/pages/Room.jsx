import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import CodeEditor from "../components/CodeEditor";
import Notepad from "../components/Notepad";
import Output from "../components/Output";
import VideoCall from "../components/VideoCall";
import AIPanel from "../components/AIPanel";
import ResumeUpload from "../components/ResumeUpload";
import { FaCopy, FaCheck, FaSignOutAlt, FaBook, FaRobot, FaFileAlt } from "react-icons/fa";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

const Room = () => {
  const { roomId: roomCode } = useParams();
  const { user, socket, authChecked } = useContext(DataContext);
  const [participants, setParticipants] = useState([]);
  const [status, setStatus] = useState("checking"); // checking | valid | invalid
  const [activeTab, setActiveTab] = useState("notes"); // notes | ai | resume
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Lifted up so CodeEditor and Output can both use the same source code/language
  const [sourceCode, setSourceCode] = useState("// Start coding here...\n");
  const [language, setLanguage] = useState("javascript");

  // Step 1: verify the room exists before doing anything socket-related
  useEffect(() => {
    const verifyRoom = async () => {
      try {
        const res = await fetch(`${API_URL}/api/rooms/${roomCode}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        setStatus("valid");
      } catch {
        setStatus("invalid");
      }
    };
    verifyRoom();
  }, [roomCode]);

  // Step 2: only join the socket room once verified
  useEffect(() => {
    if (status !== "valid" || !authChecked) return;

    const username = user?.username || `Guest-${Math.floor(Math.random() * 1000)}`;
    const doJoin = () => socket.emit("joinRoom", { roomId: roomCode, username });

    if (socket.connected) doJoin();
    else socket.on("connect", doJoin);

    const handleRoomUsers = (users) => setParticipants(users);
    socket.on("room-users", handleRoomUsers);

    // listen for server-side rejection
    socket.on("room-error", () => setStatus("invalid"));

    return () => {
      socket.emit("leaveRoom", { roomId: roomCode });
      socket.off("room-users", handleRoomUsers);
      socket.off("connect", doJoin);
      socket.off("room-error");
    };
  }, [status, roomCode, socket, user, authChecked]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-accent-cool border-t-transparent rounded-full animate-spin" />
        <span className="text-muted font-mono text-sm">Verifying room security...</span>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-2">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-text text-lg font-bold">Room Session Not Found</p>
        <p className="text-muted text-sm max-w-xs">This session has expired or the link is invalid.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-2 bg-accent text-bg px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col text-text font-display">
      {/* Sleek Top Navigation Header */}
      <header className="bg-surface border-b border-border px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-md z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2" onClick={() => navigate("/dashboard")} className="cursor-pointer">
            <span className="text-xl font-bold bg-gradient-to-r from-accent to-accent-cool bg-clip-text text-transparent">
              PeerPrep
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider border border-border px-1.5 py-0.5 rounded text-muted">
              Workspace
            </span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-2 bg-bg border border-border rounded-lg px-3 py-1.5">
            <span className="text-xs font-mono text-muted">Room Code:</span>
            <span className="text-xs font-mono font-bold text-accent">{roomCode}</span>
            <button
              onClick={handleCopyLink}
              className="text-muted hover:text-accent transition-colors ml-1 focus:outline-none cursor-pointer"
              title="Copy session link"
            >
              {copied ? <FaCheck className="text-emerald-400 w-3 h-3" /> : <FaCopy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Participants badge and Exit Button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-lg px-3.5 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-text">
              Active: {participants.length}
            </span>
            <div className="hidden md:flex gap-1 items-center border-l border-border/80 pl-2 text-[11px] text-muted truncate max-w-[200px]" title={participants.map((p) => p.username).join(", ")}>
              {participants.map((p) => p.username).join(", ")}
            </div>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-bg text-rose-400 px-4.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <FaSignOutAlt className="w-3.5 h-3.5" />
            Exit Room
          </button>
        </div>
      </header>

      {/* Main Grid Workspace Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* Left Section: Code Editor & Execution Panel (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-6 h-full">
          <div className="flex-1 min-h-[400px]">
            <CodeEditor
              roomId={roomCode}
              socket={socket}
              code={sourceCode}
              setCode={setSourceCode}
              language={language}
              setLanguage={setLanguage}
            />
          </div>
          <div className="shrink-0">
            <Output
              roomId={roomCode}
              socket={socket}
              code={sourceCode}
              language={language}
            />
          </div>
        </section>

        {/* Right Section: Video Call & Collaboration Tabbed Panels (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-6 h-full">
          {/* Video Stream Container */}
          <div className="shrink-0">
            <VideoCall roomId={roomCode} participants={participants} />
          </div>

          {/* Collaboration Tabs Container */}
          <div className="flex-1 flex flex-col border border-border bg-surface rounded-xl overflow-hidden shadow-lg min-h-[450px]">
            {/* Tab Controls Bar */}
            <div className="flex bg-surface/40 border-b border-border p-1 gap-1">
              <button
                onClick={() => setActiveTab("notes")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "notes"
                    ? "bg-bg text-accent-cool border border-border shadow-md"
                    : "text-muted hover:text-text hover:bg-bg/20"
                }`}
              >
                <FaBook className="w-3.5 h-3.5" />
                Notes
              </button>

              <button
                onClick={() => setActiveTab("ai")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "ai"
                    ? "bg-bg text-accent border border-border shadow-md"
                    : "text-muted hover:text-text hover:bg-bg/20"
                }`}
              >
                <FaRobot className="w-3.5 h-3.5" />
                AI Mock Interview
              </button>

              <button
                onClick={() => setActiveTab("resume")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "resume"
                    ? "bg-bg text-emerald-400 border border-border shadow-md"
                    : "text-muted hover:text-text hover:bg-bg/20"
                }`}
              >
                <FaFileAlt className="w-3.5 h-3.5" />
                ATS Analyzer
              </button>
            </div>

            {/* Tab Contents Frame */}
            <div className="flex-1 p-4 bg-surface/30 overflow-y-auto max-h-[500px]">
              {activeTab === "notes" && (
                <div className="h-full animate-fadeIn">
                  <Notepad roomId={roomCode} socket={socket} />
                </div>
              )}
              {activeTab === "ai" && (
                <div className="animate-fadeIn">
                  <AIPanel socket={socket} roomId={roomCode} />
                </div>
              )}
              {activeTab === "resume" && (
                <div className="animate-fadeIn">
                  <ResumeUpload socket={socket} roomId={roomCode} />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Room;