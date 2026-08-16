import { useEffect, useState } from "react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

const Output = ({ roomId, socket, code, language }) => {
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [customInput, setCustomInput] = useState("");

  useEffect(() => {
    const handleOutputUpdate = (result) => {
      setOutput(result);
      setRunning(false);
    };
    const handleCodeRunning = () => setRunning(true);
    const handleRoomState = (state) => {
      if (state && state.input !== undefined) {
        setCustomInput(state.input);
      }
    };
    const handleCustomInputUpdate = ({ input }) => {
      setCustomInput(input);
    };

    socket.on("output-update", handleOutputUpdate);
    socket.on("code-running", handleCodeRunning);
    socket.on("room-state", handleRoomState);
    socket.on("custom-input-update", handleCustomInputUpdate);

    return () => {
      socket.off("output-update", handleOutputUpdate);
      socket.off("code-running", handleCodeRunning);
      socket.off("room-state", handleRoomState);
      socket.off("custom-input-update", handleCustomInputUpdate);
    };
  }, [socket]);

  const handleRun = async () => {
    setRunning(true);
    socket.emit("run-code-start", { roomId });

    try {
      const res = await fetch(`${API_URL}/api/compiler/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code, language, input: customInput }),
      });
      const result = await res.json();

      setOutput(result);
      setRunning(false);
      socket.emit("code-output", { roomId, output: result });
    } catch (err) {
      console.error(err);
      setRunning(false);
      const errOutput = { stderr: "Failed to connect to the Judge0 compiler service." };
      setOutput(errOutput);
      socket.emit("code-output", { roomId, output: errOutput });
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full font-display">
      
      {/* 1. INPUT BLOCK */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-2 select-none">
          <span className="text-sm font-bold text-text">Code execution</span>
          <span className="text-[10px] text-muted font-mono uppercase tracking-wider">compiler configuration</span>
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="stdin-input" className="text-xs font-semibold text-text/80">
            Custom input (stdin)
          </label>
          <textarea
            id="stdin-input"
            value={customInput}
            onChange={(e) => {
              const val = e.target.value;
              setCustomInput(val);
              socket.emit("custom-input-change", { roomId, input: val });
            }}
            placeholder="Type program input / test cases here..."
            className="w-full h-20 bg-bg border border-border rounded-lg p-3 text-xs text-text focus:border-accent-cool/55 outline-none transition-all placeholder:text-muted/40 resize-none font-mono"
          />
        </div>

        <div className="flex justify-end pt-1 select-none">
          <button
            onClick={handleRun}
            disabled={running}
            className="bg-accent hover:bg-accent/90 text-text-light text-xs font-bold px-5 py-2.5 rounded-lg active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer shadow-md shadow-accent/15"
          >
            {running ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-text-light border-t-transparent rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run code
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. OUTPUT BLOCK */}
      <div className="bg-[#0A0C10] border border-border rounded-xl p-4 flex flex-col gap-3 shadow-md">
        <div className="flex items-center justify-between border-b border-border/40 pb-2 select-none">
          <span className="text-sm font-bold text-text">Execution output</span>
          {output && !running && (
            <span className="text-[10px] text-muted font-mono uppercase tracking-wider">
              Status: {output.status || "completed"}
            </span>
          )}
        </div>

        {/* Terminal logs block */}
        <div className="font-mono text-xs whitespace-pre-wrap overflow-y-auto min-h-[96px] max-h-48 text-text/90">
          {running && (
            <div className="flex items-center gap-2 text-accent font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              Executing program solution in compiler sandbox...
            </div>
          )}

          {!running && output && (
            <div className="space-y-3">
              {output.compile_output && (
                <div className="text-error bg-error/5 border border-error/20 p-3 rounded-lg font-mono text-xs leading-relaxed">
                  <div className="font-bold uppercase text-[9px] tracking-wider mb-1 font-sans">Compilation error:</div>
                  <pre className="whitespace-pre-wrap font-mono">{output.compile_output}</pre>
                </div>
              )}
              {output.stderr && (
                <div className="text-error bg-error/5 border border-error/20 p-3 rounded-lg font-mono text-xs leading-relaxed">
                  <div className="font-bold uppercase text-[9px] tracking-wider mb-1 font-sans">Runtime error (stderr):</div>
                  <pre className="whitespace-pre-wrap font-mono">{output.stderr}</pre>
                </div>
              )}
              {output.stdout && (
                <div className="text-accent-cool bg-accent-cool/5 border border-accent-cool/20 p-3 rounded-lg font-mono text-xs leading-relaxed">
                  <div className="font-bold uppercase text-[9px] tracking-wider mb-1 font-sans">Program output (stdout):</div>
                  <pre className="whitespace-pre-wrap font-mono">{output.stdout}</pre>
                </div>
              )}
              {!output.stdout && !output.stderr && !output.compile_output && (
                <p className="text-muted/60 italic font-mono text-xs">Program executed successfully with no output returned.</p>
              )}
            </div>
          )}

          {!running && !output && (
            <p className="text-muted/40 italic font-mono text-xs select-none">Click "Run code" to execute your solution in the secure sandbox.</p>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default Output;