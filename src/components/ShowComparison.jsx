import React, { useState, useEffect } from "react";
import {
  X,
  ArrowRightLeft,
  Wand2,
  Loader2,
  FileText,
  Sparkles,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { ENDPOINTS } from "../config";

const ShowComparison = ({ isOpen, onClose, originalPost }) => {
  const { user } = useAuth();
  const [rewrittenPost, setRewrittenPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch the rewritten version whenever the modal opens with a new original post
  useEffect(() => {
    if (isOpen && originalPost) {
      fetchRewrittenVersion();
    }
  }, [isOpen, originalPost]);

  const fetchRewrittenVersion = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${ENDPOINTS.REWRITTEN_POSTS}/original/${originalPost._id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      const data = await response.json();
      setRewrittenPost(data); // Will be null if not found, or the object if found
    } catch (error) {
      console.error("Failed to fetch rewritten version", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        `${ENDPOINTS.ORIGINAL_POSTS}/rewrite/${originalPost._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setRewrittenPost(data.post); // Update the view immediately
        fetchRewrittenVersion(); // Double check fetch
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Error generating post: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen || !originalPost) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-[95vw] h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <ArrowRightLeft size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Content Comparison
              </h2>
              <p className="text-xs text-slate-500">
                Side-by-side view of source vs. AI output
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Split Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT: ORIGINAL */}
          <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-700 h-1/2 md:h-auto">
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <FileText size={14} className="text-slate-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Original Source
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900 custom-scrollbar">
              <h1 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">
                {originalPost.title}
              </h1>
              <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{ __html: originalPost.content }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: AI REWRITTEN */}
          <div className="flex-1 flex flex-col h-1/2 md:h-auto bg-white dark:bg-slate-900 relative">
            <div className="px-4 py-2 bg-purple-50 dark:bg-slate-800/50 border-b border-purple-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-purple-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                  AI Rewritten
                </span>
              </div>
              {rewrittenPost && (
                <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                  {rewrittenPost.aiModel || "Gemini"}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Loader2 size={32} className="animate-spin mb-2" />
                  <p>Loading comparison...</p>
                </div>
              ) : rewrittenPost ? (
                <>
                  <h1 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">
                    {rewrittenPost.title}
                  </h1>
                  <div className="prose prose-sm prose-slate dark:prose-invert max-w-none marker:text-purple-500 prose-a:text-purple-600">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: rewrittenPost.content,
                      }}
                    />
                  </div>
                </>
              ) : (
                // EMPTY STATE - SHOW GENERATE BUTTON
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <Sparkles size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No AI Version Yet
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs mb-6">
                    This article hasn't been rewritten yet. Generate a unique
                    version instantly using Gemini.
                  </p>
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-200 dark:shadow-none transition-all hover:scale-105 disabled:opacity-70 disabled:scale-100"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Writing Article...
                      </>
                    ) : (
                      <>
                        <Wand2 size={18} />
                        Generate Now
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowComparison;
