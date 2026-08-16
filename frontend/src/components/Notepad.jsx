import { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const Notepad = ({ roomId, socket }) => {
  const [content, setContent] = useState("");

  useEffect(() => {
    const handleTextUpdate = ({ content: newContent }) => {
      setContent(newContent);
    };

    const handleRoomState = (state) => {
      if (state?.notes !== undefined) {
        setContent(state.notes);
      }
    };

    socket.on("text-update", handleTextUpdate);
    socket.on("room-state", handleRoomState);

    return () => {
      socket.off("text-update", handleTextUpdate);
      socket.off("room-state", handleRoomState);
    };
  }, [socket]);

  const handleChange = (value, delta, source) => {
    setContent(value);
    if (source === "user") {
      socket.emit("text-change", { roomId, content: value });
    }
  };

  return (
    <div className="flex flex-col h-full border border-border rounded-xl overflow-hidden bg-surface shadow-lg text-text">
      {/* Title Header */}
      <div className="bg-surface px-4 py-3 border-b border-border flex items-center gap-2 select-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-pulse-slow absolute inline-flex h-full w-full rounded-full bg-accent-cool opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cool"></span>
        </span>
        <span className="text-text text-sm font-semibold tracking-wide font-display">Workspace Notes</span>
      </div>
      
      {/* React Quill editor */}
      <div className="flex-1 p-2 bg-surface">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={handleChange}
          className="flex-1"
          placeholder="Draft mockups, technical documentation, or algorithm ideas here..."
        />
      </div>
    </div>
  );
};

export default Notepad;