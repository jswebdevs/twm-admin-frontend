import React, { useState } from "react";
import {
  X,
  Calendar,
  Globe,
  ExternalLink,
  Image as ImageIcon,
  Wand2,
  ArrowRightLeft,
  Trash2,
  Tags,
} from "lucide-react";
import { format } from "date-fns";

const ShowOriginalPost = ({ isOpen, onClose, post }) => {
  const [activeTab, setActiveTab] = useState("content"); // content | gallery

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700">
        {/* --- Header --- */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
              {post.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-medium">
                <Globe size={12} />
                {post.source?.name || "Unknown Source"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {post.createdAt
                  ? format(new Date(post.createdAt), "MMM d, yyyy h:mm a")
                  : "N/A"}
              </span>
              {post.tags && (
                <span className="flex items-center gap-1.5 text-xs">
                  <Tags size={12} />
                  {post.tags.split(",").slice(0, 3).join(", ")}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- Tabs (If Gallery Exists) --- */}
        {post.gallery && post.gallery.length > 0 && (
          <div className="px-6 pt-2 border-b border-slate-100 dark:border-slate-800 flex gap-6">
            <button
              onClick={() => setActiveTab("content")}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "content"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Article Content
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "gallery"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Image Gallery ({post.gallery.length})
            </button>
          </div>
        )}

        {/* --- Scrollable Body --- */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
          {activeTab === "content" ? (
            <div className="space-y-6 max-w-none">
              {/* Featured Image */}
              {post.featuredImage && (
                <div className="relative w-full h-64 sm:h-80 bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <img
                    src={post.featuredImage}
                    alt="Featured"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded uppercase tracking-wider font-bold">
                    Featured
                  </div>
                </div>
              )}

              {/* Clean HTML Content */}
              <div
                className="prose prose-slate dark:prose-invert max-w-none 
                              prose-headings:font-bold prose-headings:text-slate-800 dark:prose-headings:text-slate-100
                              prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed
                              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                              prose-img:rounded-xl prose-img:shadow-sm"
              >
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
            </div>
          ) : (
            /* Gallery Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {post.gallery.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group relative"
                >
                  <img
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <a
                    href={img}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    <ExternalLink className="text-white" size={24} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Footer Actions --- */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center rounded-b-xl">
          <a
            href={post.originalLink}
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 hover:text-blue-600 text-sm flex items-center gap-2 transition-colors"
          >
            View Source <ExternalLink size={14} />
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert("Comparison coming soon...")}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <ArrowRightLeft size={16} /> Compare
            </button>
            <button
              onClick={() => alert("AI Conversion coming soon...")}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 shadow-sm shadow-blue-200 dark:shadow-none transition-colors"
            >
              <Wand2 size={16} /> Convert with AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowOriginalPost;
