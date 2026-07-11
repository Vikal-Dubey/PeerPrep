import { useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";

const LANGUAGES = ["javascript", "python", "cpp", "java", "c"];

const CodeEditor = ({ roomId, socket, code, setCode, language, setLanguage }) => {
  const isRemoteChange = useRef(false);

  useEffect(() => {
    const handleCodeUpdate = ({ code: newCode, language: newLang }) => {
      isRemoteChange.current = true;
      setCode(newCode);
      if (newLang) setLanguage(newLang);
    };

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
      socket.off("room-state", handleRoomState);
    };
  }, [socket, setCode, setLanguage]);

  const handleEditorChange = (value) => {
    if (isRemoteChange.current) {
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
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      <Editor
        height="400px"
        language={language}
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true }}
      />
    </div>
  );
};

export default CodeEditor;