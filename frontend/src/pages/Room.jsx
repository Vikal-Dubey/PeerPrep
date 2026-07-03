import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DataContext } from "../context/DataContext";

const Room = () => {
  const { roomId } = useParams();
  const { user, socket } = useContext(DataContext);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const username = user?.username || `Guest-${Math.floor(Math.random() * 1000)}`;

    const doJoin = () => {
      socket.emit("joinRoom", { roomId, username });
    };

    if (socket.connected) {
      doJoin();
    } else {
      socket.on("connect", doJoin);
    }

    const handleRoomUsers = (users) => {
      setParticipants(users);
    };
    socket.on("room-users", handleRoomUsers);

    return () => {
      socket.emit("leaveRoom", { roomId });
      socket.off("room-users", handleRoomUsers);
      socket.off("connect", doJoin);
    };
  }, [roomId, socket, user]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Room: {roomId}</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2">Participants ({participants.length})</h2>
        <ul className="list-disc list-inside">
          {participants.map((p) => (
            <li key={p.socketId}>{p.username}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Room;