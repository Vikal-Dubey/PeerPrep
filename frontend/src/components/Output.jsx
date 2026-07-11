import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Output = ({ roomId, socket, code, language }) => {
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const handleOutputUpdate = (result) => {
      setOutput(result);
      setRunning(false);
    };
    const handleCodeRunning = () => setRunning(true);

    socket.on("output-update", handleOutputUpdate);
    socket.on("code-running", handleCodeRunning);

    return () => {
      socket.off("output-update", handleOutputUpdate);
      socket.off("code-running", handleCodeRunning);
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
        body: JSON.stringify({ code, language }),
      });
      const result = await res.json();

      setOutput(result);
      setRunning(false);
      socket.emit("code-output", { roomId, output: result }); // broadcast to both
    } catch (err) {
        console.error(err);
        setRunning(false);
        setOutput({ stderr: "Failed to reach compiler service." });
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white">
      <div className="flex items-center justify-between bg-gray-800 px-3 py-2">
        <span className="text-white text-sm font-medium">Output</span>
        <button
          onClick={handleRun}
          disabled={running}
          className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {running ? "Running..." : "Run"}
        </button>
      </div>

      <div className="p-3 font-mono text-sm whitespace-pre-wrap overflow-auto flex-1 bg-gray-900 text-gray-100">
        {running && <p className="text-yellow-400">Running code...</p>}

        {!running && output && (
          <>
            {output.compile_output && (
              <p className="text-red-400">Compile Error:{"\n"}{output.compile_output}</p>
            )}
            {output.stderr && (
              <p className="text-red-400">stderr:{"\n"}{output.stderr}</p>
            )}
            {output.stdout && (
              <p className="text-green-400">{output.stdout}</p>
            )}
            {!output.stdout && !output.stderr && !output.compile_output && (
              <p className="text-gray-400">No output.</p>
            )}
            <p className="text-gray-500 text-xs mt-2">Status: {output.status}</p>
          </>
        )}

        {!running && !output && (
          <p className="text-gray-500">Click "Run" to execute the code.</p>
        )}
      </div>
    </div>
  );
};

export default Output;