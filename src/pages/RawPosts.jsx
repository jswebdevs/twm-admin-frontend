import React, { useState, useEffect, useRef } from "react";
import {
  Trash2,
  ExternalLink,
  Search,
  Calendar,
  Image as ImageIcon,
  Video,
  FileText,
  Eye,
  Wand2, // Magic Wand for Convert
  Terminal, // Terminal Icon
  X,
  Loader,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import ShowRawPost from "../components/ShowRawPost";
import useAuth from "../hooks/useAuth";
import { ENDPOINTS } from "../config";

const RawPosts = () => {
  const { user } = useAuth();

  // Data States
  const [articles, setArticles] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedSource, setSelectedSource] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);

  // Modal States
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- TERMINAL STATES ---
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalEndRef = useRef(null);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  // Initial Fetch
  useEffect(() => {
    fetchWebsites();
    fetchArticles();
  }, [page, selectedSource, searchTerm]);

  // Helper: Add Log Line
  const addLog = (message, type = "info") => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setTerminalLogs((prev) => [...prev, { message, type, time }]);
  };

  const fetchWebsites = async () => {
    try {
      const response = await fetch(ENDPOINTS.WEBSITES, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await response.json();
      setWebsites(data);
    } catch (error) {
      console.error("Error fetching websites:", error);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let url = `${ENDPOINTS.ARTICLES}?pageNumber=${page}`;
      if (selectedSource) url += `&source=${selectedSource}`;
      if (searchTerm) url += `&keyword=${searchTerm}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await response.json();

      setArticles(data.articles || []);
      setTotalPages(data.pages || 0);
      setTotalArticles(data.total || 0);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await fetch(`${ENDPOINTS.ARTICLES}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setArticles(articles.filter((a) => a._id !== id));
    } catch (error) {
      alert("Failed to delete");
    }
  };

  // --- THE NEW "1 BY 1" CONVERSION LOGIC ---
  const handleBulkConvert = async () => {
    setShowTerminal(true);
    setIsProcessing(true);
    setTerminalLogs([]); // Clear logs

    addLog("🚀 INITIALIZING BULK CONVERSION PROTOCOL...", "info");

    try {
      // 1. Fetch ALL articles (Temporary fetch with high limit to get everything)
      // We assume the backend supports a pageSize param or we just fetch the current view.
      // For a true bulk, we'd ideally hit an endpoint that gives us ALL IDs.
      // For now, let's process the *currently available* list or fetch a larger batch.
      addLog("📦 Fetching raw article manifest...", "dim");

      let url = `${ENDPOINTS.ARTICLES}?pageNumber=1&pageSize=100`; // Fetch up to 100 at once
      const listResponse = await fetch(url, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const listData = await listResponse.json();
      const allToConvert = listData.articles || [];

      addLog(`📊 Found ${allToConvert.length} pending articles.`, "info");
      addLog("------------------------------------------------", "dim");

      let successCount = 0;
      let failCount = 0;

      // 2. LOOP 1 BY 1
      for (let i = 0; i < allToConvert.length; i++) {
        const article = allToConvert[i];
        const count = i + 1;

        // Log: Starting
        // addLog(`Processing [${count}/${allToConvert.length}]: ${article.title.substring(0, 40)}...`, "dim");

        try {
          // Call the SINGLE convert endpoint
          const res = await fetch(
            `${ENDPOINTS.ORIGINAL_POSTS}/convert/${article._id}`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${user.token}` },
            },
          );

          if (res.ok) {
            addLog(`✅ [${count}] Converted: ${article.title}`, "success");
            successCount++;
          } else {
            addLog(`❌ [${count}] Failed: ${article.title}`, "error");
            failCount++;
          }
        } catch (err) {
          addLog(`⚠️ [${count}] Error: ${err.message}`, "error");
          failCount++;
        }

        // Tiny artificial delay to make the log readable (optional, remove for max speed)
        await new Promise((r) => setTimeout(r, 50));
      }

      addLog("------------------------------------------------", "dim");
      addLog(`🏁 OPERATION COMPLETE`, "success");
      addLog(
        `📈 Report: ${successCount} Success | ${failCount} Failed`,
        "info",
      );
    } catch (error) {
      addLog(`❌ CRITICAL FAILURE: ${error.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const openModal = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Raw Articles
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage scraped data before processing.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            Total: {totalArticles}
          </span>

          <button
            onClick={handleBulkConvert}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
          >
            <Wand2 size={18} />
            Bulk Convert
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-4 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search headlines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="md:col-span-3">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Sources</option>
            {websites.map((site) => (
              <option key={site._id} value={site._id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 font-medium">
                <th className="p-4 w-16">Media</th>
                <th className="p-4">Title</th>
                <th className="p-4 w-32">Source</th>
                <th className="p-4 w-40">Date</th>
                <th className="p-4 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No articles found.
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr
                    key={article._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                  >
                    <td className="p-4 align-top">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200 dark:border-slate-700">
                        {article.media?.featuredImage ? (
                          <img
                            src={article.media.featuredImage}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        ) : article.type === "video" ? (
                          <Video size={20} />
                        ) : (
                          <FileText size={20} />
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
                        {article.title}
                      </h3>
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-400 hover:text-indigo-500 flex items-center gap-1"
                      >
                        Original Link <ExternalLink size={10} />
                      </a>
                    </td>
                    <td className="p-4 align-top text-sm text-slate-600 dark:text-slate-300">
                      {article.source?.name || "Unknown"}
                    </td>
                    <td className="p-4 align-top text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {format(new Date(article.createdAt), "MMM d")}
                      </div>
                    </td>
                    <td className="p-4 align-top text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openModal(article)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="View Raw Data"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(article._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 text-sm rounded bg-white border hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-slate-600 self-center">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 text-sm rounded bg-white border hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      <ShowRawPost
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        article={selectedArticle}
      />

      {/* --- MATRIX TERMINAL --- */}
      {showTerminal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#0d1117] rounded-lg shadow-2xl border border-slate-700 flex flex-col h-[600px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-2 text-white font-mono text-sm">
                <Terminal size={16} className="text-emerald-500" />
                <span>Process Console</span>
              </div>
              {!isProcessing && (
                <button
                  onClick={() => setShowTerminal(false)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Logs Area */}
            <div className="flex-1 p-4 font-mono text-xs sm:text-sm overflow-y-auto custom-scrollbar bg-black/60">
              {terminalLogs.map((log, index) => (
                <div
                  key={index}
                  className={`mb-1.5 flex items-start gap-3 ${
                    log.type === "error"
                      ? "text-red-400"
                      : log.type === "success"
                        ? "text-emerald-400"
                        : log.type === "dim"
                          ? "text-slate-500"
                          : "text-slate-300"
                  }`}
                >
                  <span className="text-slate-600 min-w-[65px] select-none font-thin text-[10px] sm:text-xs pt-0.5">
                    {log.time}
                  </span>
                  <span className="break-all leading-relaxed">
                    {log.type === "success" && "✨ "}
                    {log.type === "error" && "⚠️ "}
                    {log.message}
                  </span>
                </div>
              ))}

              {/* Loader */}
              {isProcessing && (
                <div className="flex items-center gap-2 text-emerald-500 mt-4 pl-20 animate-pulse">
                  <span className="w-2 h-4 bg-emerald-500 block animate-bounce"></span>
                </div>
              )}

              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RawPosts;
