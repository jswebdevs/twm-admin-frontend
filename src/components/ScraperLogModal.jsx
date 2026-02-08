import React, { useEffect, useState, useRef } from "react";
import { X, Terminal, Loader } from "lucide-react";
import { ENDPOINTS } from "../config";
import useAuth from "../hooks/useAuth";

const ScraperLogModal = ({ isOpen, onClose, websiteId, websiteName }) => {
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const logContainerRef = useRef(null);
  const { user } = useAuth();
  const abortController = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (isOpen && websiteId) {
      startScrape();
    }

    // Cleanup on unmount/close
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [isOpen, websiteId]);

  const startScrape = async () => {
    setLogs([]);
    setIsRunning(true);
    abortController.current = new AbortController();

    try {
      const response = await fetch(
        `${ENDPOINTS.WEBSITES}/${websiteId}/scrape`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
          signal: abortController.current.signal,
        },
      );

      // --- THE MAGIC: READ THE STREAM ---
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode chunk and split by newlines
        const text = decoder.decode(value);
        const lines = text.split("\n").filter((line) => line.trim() !== "");

        setLogs((prev) => [...prev, ...lines]);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setLogs((prev) => [...prev, `❌ Error: ${error.message}`]);
      }
    } finally {
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-700 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${isRunning ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-700 text-slate-400"}`}
            >
              {isRunning ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <Terminal size={20} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Scraping {websiteName}
              </h2>
              <p className="text-xs text-slate-400">
                {isRunning ? "Job in progress..." : "Job finished"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Log Terminal Area */}
        <div
          ref={logContainerRef}
          className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-1 bg-black text-slate-300"
        >
          {logs.length === 0 && isRunning && (
            <div className="text-slate-500 italic">
              Initializing connection...
            </div>
          )}

          {logs.map((log, index) => (
            <div key={index} className="break-words">
              <span className="text-slate-600 mr-2 select-none">
                [{index + 1}]
              </span>
              {/* Colorize common keywords for better UI */}
              {log.includes("Error") ? (
                <span className="text-red-400">{log}</span>
              ) : log.includes("Success") || log.includes("Saved") ? (
                <span className="text-emerald-400">{log}</span>
              ) : log.includes("Found") ? (
                <span className="text-blue-400">{log}</span>
              ) : (
                <span>{log}</span>
              )}
            </div>
          ))}

          {!isRunning && (
            <div className="mt-4 pt-4 border-t border-slate-800 text-center text-slate-500 text-xs uppercase tracking-widest">
              End of Log
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800 border-t border-slate-700 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isRunning ? "Run in Background (Close)" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScraperLogModal;