import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import CodeEditor from "../components/CodeEditor";
import Notepad from "../components/Notepad";
import Output from "../components/Output";
import VideoCall from "../components/VideoCall";
import AIPanel from "../components/AIPanel";
import ResumeUpload from "../components/ResumeUpload";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Room = () => {
  const { roomId: roomCode } = useParams(); // renamed from `code`
  const { user, socket, authChecked } = useContext(DataContext);
  const [participants, setParticipants] = useState([]);
  const [status, setStatus] = useState("checking"); // checking | valid | invalid
  const navigate = useNavigate();

  // Lifted up so CodeEditor and Output can both use the same source code/language
  const [sourceCode, setSourceCode] = useState("// Start coding...\n");
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
    if (status !== "valid" || !authChecked) return; // wait until we know the real user

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
      socket.off("room-error"); // was missing before — cleanup added
    };
  }, [status, roomCode, socket, user, authChecked]);

  if (status === "checking") {
    return <div className="min-h-screen flex items-center justify-center">Checking room...</div>;
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 font-semibold">Room not found.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-blue-600 hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Room: {roomCode}</h1>
        <div className="bg-white rounded-lg shadow px-4 py-2">
          <span className="text-sm font-semibold">
            Participants ({participants.length}):{" "}
          </span>
          <span className="text-sm">
            {participants.map((p) => p.username).join(", ")}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <VideoCall roomId={roomCode} participants={participants} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <CodeEditor
            roomId={roomCode}
            socket={socket}
            code={sourceCode}
            setCode={setSourceCode}
            language={language}
            setLanguage={setLanguage}
          />
          <Output
            roomId={roomCode}
            socket={socket}
            code={sourceCode}
            language={language}
          />
        </div>
        <Notepad roomId={roomCode} socket={socket} />
        <AIPanel socket={socket} roomId={roomCode} />
        <ResumeUpload socket={socket} roomId={roomCode} />
      </div>
    </div>
  );
};

export default Room;