import React, { useState, useEffect } from "react";
import { ENDPOINTS } from "../config";
import { format } from "date-fns";
import {
  FileText,
  ExternalLink,
  Trash2,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import ShowRawPost from "../components/ShowRawPost";

const RawPosts = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  

  // Fetch Articles
  const fetchArticles = async (pageNumber = 1) => {
    setLoading(true);
    try {
      // Build URL with query params
      const url = new URL(ENDPOINTS.ARTICLES);
      url.searchParams.append("pageNumber", pageNumber);
      if (searchTerm) url.searchParams.append("keyword", searchTerm);

      const response = await fetch(url.toString());
      const data = await response.json();

      setArticles(data.articles);
      setPage(data.page);
      setTotalPages(data.pages);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleView = (article) => {
    setSelectedArticle(article);
    setIsViewModalOpen(true);
  };

  // Initial Fetch & Debounced Search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchArticles(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle Pagination
  useEffect(() => {
    fetchArticles(page);
  }, [page]);
  const handleBulkConvert = async () => {
    if (
      !window.confirm("Convert ALL existing raw articles to production posts?")
    )
      return;

    try {
      const response = await fetch(
        "https://twm-admin-backend.onrender.com/api/originalposts/bulk-convert",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      const data = await response.json();
      alert(`Success! ${data.newlyConverted} articles converted.`);
    } catch (error) {
      alert("Failed to convert articles.");
    }
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?"))
      return;

    try {
      await fetch(`${ENDPOINTS.ARTICLES}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      // Remove from local state immediately
      setArticles((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-slate-900 p-6 shadow-sm min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Raw Scraped Posts
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review and manage content scraped from your sources.
          </p>
        </div>
        <div>
          <button
            onClick={handleBulkConvert}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Bulk Convert All
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-none shadow-sm flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search articles by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-3"></div>
            Loading content...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">
                    Title
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">
                    Source
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">
                    Date Scraped
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {articles.length > 0 ? (
                  articles.map((article) => (
                    <tr
                      key={article._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                    >
                      {/* Title */}
                      <td className="px-6 py-4 max-w-md">
                        <div className="font-medium text-slate-900 dark:text-white line-clamp-2">
                          {article.title}
                        </div>
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                        >
                          View Original <ExternalLink size={10} />
                        </a>
                      </td>

                      {/* Source Badge */}
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-500">
                          {article.source?.name || "Unknown"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {format(new Date(article.createdAt), "MMM d, h:mm a")}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                            onClick={() => handleView(article)}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(article._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText size={48} className="text-slate-200 mb-2" />
                        <p>No articles found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <ShowRawPost
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        article={selectedArticle}
      />
    </div>
  );
};

export default RawPosts;
