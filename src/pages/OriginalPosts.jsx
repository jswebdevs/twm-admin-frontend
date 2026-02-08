import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  Trash2,
  FileText,
  ArrowRightLeft,
  Wand2,
  Calendar,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import Swal from "sweetalert2"; // ✅ Import SweetAlert2
import ShowOriginalPost from "../components/ShowOriginalPost";
import useAuth from "../hooks/useAuth";
import { ENDPOINTS } from "../config";
import ShowComparison from "../components/ShowComparison";

const OriginalPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [rewritingId, setRewritingId] = useState(null);

  // Modal State
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [page, searchTerm]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = `${ENDPOINTS.ORIGINAL_POSTS}?pageNumber=${page}`;
      if (searchTerm) url += `&keyword=${searchTerm}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await response.json();

      setPosts(data.posts || []);
      setTotalPages(data.pages || 0);
      setTotalPosts(data.total || 0);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE WITH SWAL
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Red
      cancelButtonColor: "#64748b", // Slate
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`${ENDPOINTS.ORIGINAL_POSTS}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setPosts(posts.filter((post) => post._id !== id));

      Swal.fire({
        title: "Deleted!",
        text: "The post has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Error", "Failed to delete post", "error");
    }
  };

  // ✅ CONVERT WITH SWAL & REFRESH
  const handleConvert = async (post) => {
    if (rewritingId) return;

    // 1. Confirm Dialog
    const result = await Swal.fire({
      title: "Generate AI Version?",
      text: `Ready to rewrite "${post.title}"? This takes about 5-10 seconds.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed", // Violet
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Magic!",
    });

    if (!result.isConfirmed) return;

    setRewritingId(post._id);

    // 2. Show Loading Toast while processing
    Swal.fire({
      title: "Writing Article...",
      text: "Please wait while Gemini writes your content.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await fetch(
        `${ENDPOINTS.ORIGINAL_POSTS}/rewrite/${post._id}`,
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
        // 3. Success Popup
        Swal.fire({
          title: "AI Magic Complete!",
          text: "The post has been rewritten successfully.",
          icon: "success",
          confirmButtonColor: "#7c3aed",
        });

        fetchPosts(); // ✅ REFRESH THE LIST
      } else {
        Swal.fire("AI Error", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Network Error", error.message, "error");
    } finally {
      setRewritingId(null);
    }
  };

  const handleCompareModal = (post) => {
    setSelectedPost(post);
    setIsCompareModalOpen(true);
  };

  const openViewModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Original Posts
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Clean, formatted content ready for AI processing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            Total: {totalPosts}
          </span>
          <button
            onClick={fetchPosts}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 font-medium">
                <th className="p-4 w-16">Image</th>
                <th className="p-4">Title & Source</th>
                <th className="p-4 w-32">Status</th>
                <th className="p-4 w-40">Date</th>
                <th className="p-4 w-48 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    Loading posts...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No posts found.
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const isConverted =
                    post.status === "Converted Draft" ||
                    post.status === "Published Converted";

                  return (
                    <tr
                      key={post._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                    >
                      <td className="p-4 align-top">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                          {post.featuredImage ? (
                            <img
                              src={post.featuredImage}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <FileText size={20} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Globe size={12} />
                            {post.source?.name || "Unknown"}
                          </span>
                          {post.category && (
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                              {post.category}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            post.status === "Published Converted"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : post.status === "Converted Draft"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="p-4 align-top text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {format(new Date(post.createdAt), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 pl-5">
                          {format(new Date(post.createdAt), "h:mm a")}
                        </div>
                      </td>
                      <td className="p-4 align-top text-right">
                        <div className="flex justify-end gap-1">
                          {/* VIEW */}
                          <button
                            onClick={() => openViewModal(post)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Content"
                          >
                            <Eye size={18} />
                          </button>

                          {/* CONVERT BUTTON (Disabled if already converted) */}
                          <button
                            onClick={() => handleConvert(post)}
                            disabled={rewritingId === post._id || isConverted}
                            className={`p-2 rounded-lg transition ${
                              isConverted
                                ? "text-purple-300 cursor-not-allowed opacity-50"
                                : "text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                            }`}
                            title={
                              isConverted
                                ? "Already Converted"
                                : "Convert with AI"
                            }
                          >
                            {isConverted ? (
                              <CheckCircle2 size={18} />
                            ) : (
                              <Wand2 size={18} />
                            )}
                          </button>

                          {/* COMPARE */}
                          <button
                            onClick={() => handleCompareModal(post)}
                            className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                            title="Compare Versions"
                          >
                            <ArrowRightLeft size={18} />
                          </button>

                          {/* DELETE */}
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                className="px-3 py-1 text-sm rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 self-center">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 text-sm rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Render Modals */}
      <ShowOriginalPost
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        post={selectedPost}
      />
      <ShowComparison
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        originalPost={selectedPost}
      />
    </div>
  );
};

export default OriginalPosts;
