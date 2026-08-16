import { useEffect, useRef, useContext } from "react";
import Editor from "@monaco-editor/react";
import { DataContext } from "../context/DataContext";

const LANGUAGES = ["javascript", "python", "cpp", "java", "c"];

const CodeEditor = ({ roomId, socket, code, setCode, language, setLanguage }) => {
  const { user } = useContext(DataContext);
  const isRemoteChange = useRef(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef({});

  // Listen to remote changes for code & language
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

  // Listen for cursor changes from other participants
  useEffect(() => {
    const handleCursorUpdate = ({ socketId, position, username }) => {
      if (!editorRef.current || !monacoRef.current) return;

      const editor = editorRef.current;
      const monaco = monacoRef.current;

      const oldDecorations = decorationsRef.current[socketId] || [];

      const newDecorations = position
        ? editor.deltaDecorations(oldDecorations, [
            {
              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
              ),
              options: {
                className: "remote-cursor-line",
                hoverMessage: { value: `${username} is here` },
              },
            },
          ])
        : editor.deltaDecorations(oldDecorations, []);

      decorationsRef.current[socketId] = newDecorations;
    };

    const handleUserLeft = ({ socketId }) => {
      if (editorRef.current && decorationsRef.current[socketId]) {
        editorRef.current.deltaDecorations(decorationsRef.current[socketId], []);
        delete decorationsRef.current[socketId];
      }
    };

    socket.on("cursor-update", handleCursorUpdate);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("cursor-update", handleCursorUpdate);
      socket.off("user-left", handleUserLeft);
    };
  }, [socket]);

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

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track cursor changes and emit to socket
    editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      const username = user?.username || "Guest";
      socket.emit("cursor-change", { roomId, position, username });
    });
  };

  return (
    <div className="flex flex-col h-full border border-border rounded-xl overflow-hidden bg-surface shadow-lg text-text select-none">
      {/* Editor top bar */}
      <div className="flex items-center justify-between bg-surface px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className="text-text text-sm font-semibold tracking-wide font-display">Editor Canvas</span>
        </div>
        <select
          value={language}
          onChange={handleLanguageChange}
          className="bg-bg border border-border text-text text-xs rounded-md px-3 py-1.5 outline-none focus:border-accent transition-all cursor-pointer font-mono font-medium"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{lang.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Editor body */}
      <div className="flex-1 bg-[#1e1e1e] p-1.5">
        <Editor
          height="450px"
          language={language}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            automaticLayout: true,
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
            },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            renderWhitespace: "selection",
            guides: { indentation: true },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;