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
      <div className="bg-surface px-4 py-3 border-b border-border flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-text text-sm font-semibold tracking-wide">Shared Notepad</span>
      </div>
      <div className="flex-1 p-2 bg-surface">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={handleChange}
          className="flex-1"
          placeholder="Jot down notes, test cases, or ideas here..."
        />
      </div>
    </div>
  );
};

export default Notepad;