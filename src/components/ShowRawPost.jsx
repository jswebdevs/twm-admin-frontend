import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Code,
  FileCode,
} from "lucide-react";
import { format } from "date-fns";

/**
 * Helper function to format/beautify HTML string
 * Mimics Prettier-like indentation for readability
 */
const formatHTML = (html) => {
  if (!html) return "";

  const tab = "  ";
  let result = "";
  let indent = 0;

  // Remove existing newlines and extra spaces to start fresh
  const cleanHTML = html.replace(/>\s+</g, "><").trim();

  // Split by tags
  cleanHTML.split(/(?=<)/).forEach((element) => {
    // Decrement indent for closing tags
    if (element.match(/^<\/\w/)) {
      indent = Math.max(0, indent - 1);
    }

    // Add indentation
    result += tab.repeat(indent) + element + "\n";

    // Increment indent for opening tags (excluding self-closing ones)
    // List of common void elements that don't need closing
    const isVoid =
      /^(<img|<br|<input|<hr|<meta|<link|<source|<area|<base|<col|<embed|<track|<wbr)/.test(
        element,
      );
    const isClosing = /^<\//.test(element);

    if (!isClosing && !isVoid && /^<\w/.test(element)) {
      indent++;
    }
  });

  return result;
};

const ShowRawPost = ({ isOpen, onClose, article }) => {
  const [formattedContent, setFormattedContent] = useState("");
  const [copied, setCopied] = useState(false);

  // Format content when article loads
  useEffect(() => {
    if (article?.content) {
      setFormattedContent(formatHTML(article.content));
    }
  }, [article]);

  const handleCopy = () => {
    if (formattedContent) {
      navigator.clipboard.writeText(formattedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700">
        {/* --- Header --- */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start gap-4 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1 font-mono">
              {article.title}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-xs font-mono">
                <Globe size={12} />
                {article.source?.name || "Unknown Source"}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-xs">
                <Calendar size={12} />
                {article.createdAt
                  ? format(new Date(article.createdAt), "yyyy-MM-dd HH:mm:ss")
                  : "N/A"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- Code Editor Body --- */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#0d1117]">
          {" "}
          {/* Github Dark bg color */}
          {/* Editor Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
              <FileCode size={14} className="text-emerald-500" />
              <span>raw_content.html</span>
              <span className="text-slate-600">|</span>
              <span>{formattedContent.length} chars</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            >
              {copied ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <Copy size={14} />
              )}
              {copied ? "Copied!" : "Copy Raw"}
            </button>
          </div>
          {/* Code Area */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <pre className="p-4 text-sm font-mono leading-relaxed tab-4">
              <code className="block text-slate-300">
                {formattedContent.split("\n").map((line, i) => (
                  <div
                    key={i}
                    className="table-row hover:bg-slate-800/50 w-full"
                  >
                    <span className="table-cell text-right pr-4 select-none text-slate-600 w-12 border-r border-slate-800 mr-4">
                      {i + 1}
                    </span>
                    <span className="table-cell pl-4 whitespace-pre-wrap break-all">
                      {/* Simple Syntax Highlighting Logic */}
                      {line.split(/(<[^>]+>)/g).map((token, j) => {
                        if (token.startsWith("<") && token.endsWith(">")) {
                          // It's a tag
                          const isClosing = token.startsWith("</");
                          const tagName = token
                            .replace(/<|\/|>/g, "")
                            .split(" ")[0];
                          const rest = token.substring(
                            isClosing ? 2 + tagName.length : 1 + tagName.length,
                            token.length - 1,
                          );

                          return (
                            <span key={j}>
                              <span className="text-blue-400">
                                &lt;{isClosing ? "/" : ""}
                                {tagName}
                              </span>
                              <span className="text-purple-300">{rest}</span>
                              <span className="text-blue-400">&gt;</span>
                            </span>
                          );
                        }
                        // It's content
                        return (
                          <span key={j} className="text-slate-100">
                            {token}
                          </span>
                        );
                      })}
                    </span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center rounded-b-xl">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
              Database ID
            </span>
            <span className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
              {article._id}
            </span>
          </div>
          <a
            href={article.link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Open Source Link <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShowRawPost;
