import React, { useState, useEffect, useRef } from "react";
import {
  Layers,
  RefreshCw,
  GitMerge,
  Trash2,
  Plus,
  Terminal,
  X,
  Loader2,
  FileText,
  CheckCircle2,
  Search,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { ENDPOINTS } from "../config";
import Swal from "sweetalert2";

const ClusteredPosts = () => {
  const { user } = useAuth();

  // Data States
  const [clusters, setClusters] = useState([]);

  // Terminal / Process States
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const terminalEndRef = useRef(null);

  // Fusing State
  const [fusingId, setFusingId] = useState(null);

  // Add Post Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeClusterIndex, setActiveClusterIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  // --- TERMINAL HELPERS ---
  const addLog = (message, type = "info") => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setTerminalLogs((prev) => [...prev, { message, type, time }]);
  };

  // --- ACTIONS ---

  const handleScan = async () => {
    setShowTerminal(true);
    setIsScanning(true);
    setTerminalLogs([]);
    setClusters([]);

    addLog("🚀 Initializing Vector Space Scanner...", "info");
    addLog("📡 Fetching recent article candidates...", "dim");

    try {
      // simulate steps for effect
      await new Promise((r) => setTimeout(r, 800));
      addLog("🧮 Generating Embeddings (text-embedding-004)...", "info");

      const res = await fetch(`${ENDPOINTS.CLUSTER}/scan`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();

      if (res.ok) {
        addLog("✅ Embeddings generation complete.", "success");
        addLog(`🔍 Analyzing Cosine Similarity (Threshold: 0.82)...`, "info");
        await new Promise((r) => setTimeout(r, 600));

        const foundClusters = data.clusters || [];
        setClusters(foundClusters);

        if (foundClusters.length > 0) {
          addLog(
            `✨ SUCCESS: Detected ${foundClusters.length} related content groups.`,
            "success",
          );
          addLog(`📊 Closing terminal to show results...`, "dim");
          setTimeout(() => setShowTerminal(false), 1500);
        } else {
          addLog("⚠️ No significant duplicates found.", "warning");
          setTimeout(() => setShowTerminal(false), 2500);
        }
      } else {
        addLog(`❌ Server Error: ${data.message}`, "error");
      }
    } catch (error) {
      addLog(`❌ Network Error: ${error.message}`, "error");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeleteItem = (clusterIndex, postIndex) => {
    const newClusters = [...clusters];
    newClusters[clusterIndex].splice(postIndex, 1);

    // If cluster becomes too small (less than 2), maybe remove the cluster?
    // For now, we allow single items so user can add more.
    if (newClusters[clusterIndex].length === 0) {
      newClusters.splice(clusterIndex, 1);
    }
    setClusters(newClusters);
  };

  const handleOpenAddModal = (index) => {
    setActiveClusterIndex(index);
    setSearchQuery("");
    setSearchResults([]);
    setIsAddModalOpen(true);
  };

  const handleSearchPosts = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length < 3) return;

    try {
      const res = await fetch(`${ENDPOINTS.ORIGINAL_POSTS}?keyword=${query}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setSearchResults(data.posts || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddPostToCluster = (post) => {
    const newClusters = [...clusters];
    // Check if already exists in this cluster
    if (newClusters[activeClusterIndex].some((p) => p._id === post._id)) {
      alert("Post already in this cluster");
      return;
    }

    // Add minimal data needed
    newClusters[activeClusterIndex].push({
      _id: post._id,
      title: post.title,
      source: post.source,
      content: post.content,
    });

    setClusters(newClusters);
    setIsAddModalOpen(false);
  };

  const handleFuse = async (clusterIndex) => {
    const clusterPosts = clusters[clusterIndex];

    if (clusterPosts.length < 2) {
      Swal.fire(
        "Not enough data",
        "Need at least 2 articles to fuse.",
        "warning",
      );
      return;
    }

    const result = await Swal.fire({
      title: "Fuse these articles?",
      text: `Merging ${clusterPosts.length} articles into one Master Piece.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Fuse them!",
      confirmButtonColor: "#8b5cf6",
    });

    if (!result.isConfirmed) return;

    setFusingId(clusterIndex);

    try {
      const res = await fetch(`${ENDPOINTS.CLUSTER}/fuse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ posts: clusterPosts }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: "Fused!",
          text: "The articles have been merged successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        // Remove this cluster from the view
        setClusters((prev) => prev.filter((_, idx) => idx !== clusterIndex));
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Fusion failed", "error");
    } finally {
      setFusingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Area */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
            <Layers className="text-violet-600" /> Content Clustering
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Detect duplicate stories and fuse them into comprehensive coverage.
          </p>
        </div>
        <button
          onClick={handleScan}
          className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-violet-200 dark:shadow-none hover:bg-violet-700 transition flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Scan for Clusters
        </button>
      </div>

      {/* TERMINAL MODAL */}
      {showTerminal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#0d1117] rounded-lg shadow-2xl border border-slate-700 flex flex-col h-[500px] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2 text-white font-mono text-sm">
                <Terminal size={16} className="text-emerald-500" />
                <span>System Console</span>
              </div>
              {!isScanning && (
                <button
                  onClick={() => setShowTerminal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar bg-black/50">
              {terminalLogs.map((log, index) => (
                <div
                  key={index}
                  className={`mb-2 flex items-start gap-3 ${
                    log.type === "error"
                      ? "text-red-400"
                      : log.type === "success"
                        ? "text-emerald-400"
                        : log.type === "dim"
                          ? "text-slate-500"
                          : "text-slate-300"
                  }`}
                >
                  <span className="text-slate-600 text-xs min-w-[60px]">
                    {log.time}
                  </span>
                  <span>
                    {log.type === "success" && "✨ "}
                    {log.type === "error" && "⚠️ "}
                    {log.message}
                  </span>
                </div>
              ))}
              {isScanning && (
                <div className="flex items-center gap-2 text-emerald-500 mt-4 animate-pulse">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* CLUSTERS LIST */}
      <div className="grid grid-cols-1 gap-8">
        {clusters.map((cluster, cIndex) => (
          <div
            key={cIndex}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Cluster Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-bold border border-violet-200">
                  Cluster #{cIndex + 1}
                </div>
                <span className="text-slate-500 text-sm font-medium">
                  {cluster.length} Sources Found
                </span>
              </div>
            </div>

            {/* Article List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {cluster.map((post, pIndex) => (
                <div
                  key={post._id}
                  className="p-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                >
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="mt-1 min-w-[20px] text-slate-300">
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">
                          {post.source?.name || "Unknown Source"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteItem(cIndex, pIndex)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove from cluster"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <button
                onClick={() => handleOpenAddModal(cIndex)}
                className="text-sm font-medium text-slate-500 hover:text-violet-600 flex items-center gap-1 transition"
              >
                <Plus size={16} /> Add another article
              </button>

              <button
                onClick={() => handleFuse(cIndex)}
                disabled={fusingId === cIndex || cluster.length < 2}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fusingId === cIndex ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <GitMerge size={16} />
                )}
                Summarize & Fuse All
              </button>
            </div>
          </div>
        ))}
      </div>

      {!showTerminal && clusters.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <Layers size={64} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-medium text-slate-500">
            No clusters active
          </h3>
          <p className="text-slate-400">Run a scan to find related articles.</p>
        </div>
      )}

      {/* --- ADD POST MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg">Add Article to Cluster</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 dark:border-slate-800 relative">
              <Search
                className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search posts..."
                autoFocus
                value={searchQuery}
                onChange={handleSearchPosts}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {searchResults.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Type to search for original posts...
                </div>
              ) : (
                searchResults.map((post) => (
                  <button
                    key={post._id}
                    onClick={() => handleAddPostToCluster(post)}
                    className="w-full text-left p-3 hover:bg-violet-50 dark:hover:bg-slate-800 rounded-lg transition border-b border-slate-50 dark:border-slate-800 last:border-0"
                  >
                    <p className="font-medium text-sm text-slate-800 dark:text-slate-200 line-clamp-1">
                      {post.title}
                    </p>
                    <span className="text-xs text-slate-500">
                      {post.source?.name} •{" "}
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClusteredPosts;
