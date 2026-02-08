import React from "react";
import {
  X,
  Calendar,
  Globe,
  ExternalLink,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { format } from "date-fns";

const ShowRawPost = ({ isOpen, onClose, article }) => {
  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700">
        {/* --- Header --- */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2">
              {article.title}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Globe size={14} />
                {article.source?.name || "Unknown Source"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {article.createdAt
                  ? format(new Date(article.createdAt), "MMM d, yyyy h:mm a")
                  : "N/A"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- Scrollable Body --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Featured Media Section */}
          {article.media?.featuredImage && (
            <div className="relative w-full h-64 sm:h-80 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <img
                src={article.media.featuredImage}
                alt="Featured"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/800x400?text=Image+Load+Failed";
                }}
              />
              {article.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
                    <Video size={32} className="text-white" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                Featured Media
              </div>
            </div>
          )}

          {/* 2. Content Preview (HTML) */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
              Scraped Content
            </h3>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              {/* We use a custom wrapper class to style the raw HTML 
                                because raw HTML comes without Tailwind classes.
                            */}
              <div
                className="prose prose-slate dark:prose-invert max-w-none 
                                           [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 
                                           [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-3
                                           [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4
                                           [&>blockquote]:border-l-4 [&>blockquote]:border-slate-300 [&>blockquote]:pl-4 [&>blockquote]:italic
                                           [&>img]:rounded-lg [&>img]:max-w-full [&>img]:h-auto [&>img]:my-4"
                dangerouslySetInnerHTML={{
                  __html:
                    article.content ||
                    '<p class="text-slate-400 italic">No content scraped.</p>',
                }}
              />
            </div>
          </div>

          {/* 3. Raw Data Debug (Optional - good for devs) */}
          <details className="group">
            <summary className="cursor-pointer text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2 hover:text-emerald-600 transition">
              <span>View Raw JSON Data</span>
              <span className="group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="mt-3 p-4 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto font-mono text-xs">
              <pre>
                {JSON.stringify(
                  {
                    id: article._id,
                    link: article.link,
                    media: article.media,
                    tags: article.tags,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </details>
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center rounded-b-xl">
          <span className="text-xs text-slate-500">
            ID: <span className="font-mono">{article._id}</span>
          </span>
          <a
            href={article.link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View Original <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShowRawPost;
