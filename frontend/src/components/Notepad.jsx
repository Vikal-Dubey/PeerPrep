import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const Notepad = ({ roomId, socket }) => {
  const [content, setContent] = useState("");
  const isRemoteChange = useRef(false);

  useEffect(() => {
    const handleTextUpdate = ({ content: newContent }) => {
      isRemoteChange.current = true;
      setContent(newContent);
    };

    socket.on("text-update", handleTextUpdate);
    return () => socket.off("text-update", handleTextUpdate);
  }, [socket]);

  const handleChange = (value) => {
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      setContent(value);
      return;
    }
    setContent(value);
    socket.emit("text-change", { roomId, content: value });
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