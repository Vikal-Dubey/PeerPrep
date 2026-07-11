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

  // Now reads all 4 args Quill provides — only broadcasts genuine user edits
  const handleChange = (value, delta, source) => {
    setContent(value);
    if (source === "user") {
      socket.emit("text-change", { roomId, content: value });
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-800 px-3 py-2">
        <span className="text-white text-sm font-medium">Shared Notes</span>
      </div>
      <ReactQuill
        theme="snow"
        value={content}
        onChange={handleChange}
        className="flex-1"
        style={{ height: "400px" }}
      />
    </div>
  );
};

export default Notepad;