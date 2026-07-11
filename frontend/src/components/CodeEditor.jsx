import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

const LANGUAGES = ["javascript", "python", "cpp", "java", "c"];

const CodeEditor = ({ roomId, socket }) => {
  const [code, setCode] = useState("// Start coding...\n");
  const [language, setLanguage] = useState("javascript");
  const isRemoteChange = useRef(false); // prevents echo loops

  // Listen for incoming updates from other participants
  useEffect(() => {
    const handleCodeUpdate = ({ code: newCode, language: newLang }) => {
      isRemoteChange.current = true;
      setCode(newCode);
      if (newLang) setLanguage(newLang);
    };

    // NEW — handle initial state snapshot on join
    const handleRoomState = (state) => {
      if (state?.code !== undefined) {
        isRemoteChange.current = true;
        setCode(state.code);
        if (state.language) setLanguage(state.language);
      }
    };

    socket.on("code-update", handleCodeUpdate);
    socket.on("room-state", handleRoomState);
    
    return () => {
    socket.off("code-update", handleCodeUpdate);
    socket.off("room-state", handleRoomState); // NEW
  };
  }, [socket]);

  const handleEditorChange = (value) => {
    if (isRemoteChange.current) {
      // This change came from a remote update being applied — don't re-broadcast it
      isRemoteChange.current = false;
      return;
    }
    setCode(value);
    socket.emit("code-change", { roomId, code: value, language });
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    socket.emit("code-change", { roomId, code, language: newLang });
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-800 px-3 py-2">
        <span className="text-white text-sm font-medium">Code Editor</span>
        <select
          value={language}
          onChange={handleLanguageChange}
          className="bg-gray-700 text-white text-sm rounded px-2 py-1"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>
      <Editor
        height="500px"
        language={language}
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;