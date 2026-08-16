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
      socket.emit("code-output", { roomId, output: result }); // broadcast to peer
    } catch (err) {
      console.error(err);
      setRunning(false);
      const errOutput = { stderr: "Failed to connect to the Judge0 compiler service." };
      setOutput(errOutput);
      socket.emit("code-output", { roomId, output: errOutput });
    }
  };

  return (
    <div className="flex flex-col h-full border border-border rounded-xl overflow-hidden bg-surface shadow-lg text-text font-display">
      {/* Terminal Title & Trigger Button */}
      <div className="flex items-center justify-between bg-surface px-4 py-3 border-b border-border select-none">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse-slow absolute inline-flex h-full w-full rounded-full bg-accent-cool opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cool"></span>
          </span>
          <span className="text-text text-sm font-semibold tracking-wide">Output Console</span>
        </div>
        
        <button
          onClick={handleRun}
          disabled={running}
          className="bg-accent hover:bg-accent/90 text-text-light text-xs font-bold px-4.5 py-2 rounded-lg active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer shadow-md shadow-accent/10"
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
              Run Code
            </>
          )}
        </button>
      </div>

      {/* Test Case Input Section */}
      <div className="px-4 py-3 border-b border-border bg-bg/25 flex flex-col gap-2">
        <label htmlFor="stdin-input" className="text-[10px] font-mono font-bold tracking-wider text-muted flex items-center gap-1.5 uppercase select-none">
          <svg className="w-3.5 h-3.5 text-accent-cool" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Test Case Input (stdin)
        </label>
        <textarea
          id="stdin-input"
          value={customInput}
          onChange={(e) => {
            const val = e.target.value;
            setCustomInput(val);
            socket.emit("custom-input-change", { roomId, input: val });
          }}
          placeholder="Type program input / test-cases here..."
          className="w-full h-20 bg-bg border border-border rounded-lg p-2.5 font-mono text-xs text-text focus:border-accent-cool outline-none transition-all placeholder:text-muted/40 resize-y"
        />
      </div>

      {/* Terminal View */}
      <div className="p-4 font-mono text-xs whitespace-pre-wrap overflow-auto h-48 bg-bg text-text/90 flex flex-col justify-between">
        <div className="flex-1">
          {running && (
            <div className="flex items-center gap-2 text-accent">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              Executing program solution in compiler sandbox...
            </div>
          )}

          {!running && output && (
            <div className="space-y-3">
              {output.compile_output && (
                <div className="text-error bg-error/5 border border-error/20 p-3 rounded-lg font-mono text-xs leading-relaxed">
                  <div className="font-extrabold uppercase text-[9px] tracking-wider mb-1">Compilation Failure:</div>
                  {output.compile_output}
                </div>
              )}
              {output.stderr && (
                <div className="text-error bg-error/5 border border-error/20 p-3 rounded-lg font-mono text-xs leading-relaxed">
                  <div className="font-extrabold uppercase text-[9px] tracking-wider mb-1">Runtime Exception (stderr):</div>
                  {output.stderr}
                </div>
              )}
              {output.stdout && (
                <div className="text-accent-cool bg-accent-cool/5 border border-accent-cool/20 p-3 rounded-lg font-mono text-xs leading-relaxed">
                  <div className="font-extrabold uppercase text-[9px] tracking-wider mb-1">Program Output (stdout):</div>
                  {output.stdout}
                </div>
              )}
              {!output.stdout && !output.stderr && !output.compile_output && (
                <p className="text-muted/60 italic font-mono text-xs">Program executed successfully with no output returned.</p>
              )}
            </div>
          )}

          {!running && !output && (
            <p className="text-muted/40 italic font-mono text-xs select-none">Click "Run Code" above to execute your solution.</p>
          )}
        </div>

        {output && !running && (
          <div className="text-muted/50 text-[9px] font-mono text-right border-t border-border/30 pt-2 mt-4 uppercase tracking-wider select-none">
            Compiler Status: {output.status}
          </div>
        )}
      </div>
    </div>
  );
};

export default Output;