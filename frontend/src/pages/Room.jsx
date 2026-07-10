import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import CodeEditor from "../components/CodeEditor";
import Notepad from "../components/Notepad";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Room = () => {
  const { roomId: code } = useParams();
  const { user, socket, authChecked  } = useContext(DataContext);
  const [participants, setParticipants] = useState([]);
  const [status, setStatus] = useState("checking"); // checking | valid | invalid
  const navigate = useNavigate();

  // Step 1: verify the room exists before doing anything socket-related
  useEffect(() => {
    const verifyRoom = async () => {
      try {
        const res = await fetch(`${API_URL}/api/rooms/${code}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        setStatus("valid");
      } catch {
        setStatus("invalid");
      }
    };
    verifyRoom();
  }, [code]);

  // Step 2: only join the socket room once verified
  useEffect(() => {
    if (status !== "valid" || !authChecked) return;// wait until we know the real user

    const username = user?.username || `Guest-${Math.floor(Math.random() * 1000)}`;

    const doJoin = () => socket.emit("joinRoom", { roomId: code, username });

    if (socket.connected) doJoin();
    else socket.on("connect", doJoin);

    const handleRoomUsers = (users) => setParticipants(users);
    socket.on("room-users", handleRoomUsers);

    // NEW — listen for server-side rejection
  socket.on("room-error", () => setStatus("invalid"));

    return () => {
      socket.emit("leaveRoom", { roomId: code });
      socket.off("room-users", handleRoomUsers);
      socket.off("connect", doJoin);
    };
  }, [status, code, socket, user, authChecked]);

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
      <h1 className="text-2xl font-bold">Room: {code}</h1>
      <div className="bg-white rounded-lg shadow px-4 py-2">
        <span className="text-sm font-semibold">
          Participants ({participants.length}):{" "}
        </span>
        <span className="text-sm">
          {participants.map((p) => p.username).join(", ")}
        </span>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <CodeEditor roomId={code} socket={socket} />
      <Notepad roomId={code} socket={socket} />
    </div>
  </div>
  );
};

export default Room;