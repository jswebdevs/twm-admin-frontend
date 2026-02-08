import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  Image as ImageIcon,
  Plus,
  Trash2,
  Wand2,
  UploadCloud,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import {
  ENDPOINTS,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../config";

const EditRewrittenPost = ({ isOpen, onClose, post, onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    categories: [], // Array
    tags: [], // Array
    media: [], // Array of objects
    newCategory: "",
    newTag: "",
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        categories: post.categories || [],
        tags: post.tags || [],
        media: post.media || [],
        newCategory: "",
        newTag: "",
      });
    }
  }, [post]);

  // --- HANDLERS ---
  const handleAddItem = (field, value) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], value.trim()],
      [field === "categories" ? "newCategory" : "newTag"]: "", // Clear input
    }));
  };

  const handleRemoveItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleCloudinaryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataCloud = new FormData();
    formDataCloud.append("file", file);
    formDataCloud.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formDataCloud,
        },
      );
      const data = await res.json();

      const newMedia = {
        type: data.resource_type === "video" ? "video" : "image",
        url: data.secure_url,
        publicId: data.public_id,
      };

      setFormData((prev) => ({ ...prev, media: [...prev.media, newMedia] }));
    } catch (error) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateAIImage = async () => {
    setIsGeneratingImg(true);
    try {
      const response = await fetch(
        `${ENDPOINTS.REWRITTEN_POSTS}/generate-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            prompt: formData.title + " high quality news photo",
          }),
        },
      );
      const data = await response.json();

      if (data.url) {
        setFormData((prev) => ({
          ...prev,
          media: [
            ...prev.media,
            { type: "image", url: data.url, caption: "AI Generated" },
          ],
        }));
      }
    } catch (error) {
      alert("Image generation failed");
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${ENDPOINTS.REWRITTEN_POSTS}/${post._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          categories: formData.categories,
          tags: formData.tags,
          media: formData.media,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        onUpdate(data);
        onClose();
        alert("Saved successfully!");
      }
    } catch (error) {
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Edit Rewritten Post
          </h2>
          <button onClick={onClose}>
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Content */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                Excerpt
              </label>
              <textarea
                rows={3}
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-slate-300">
                Content (HTML)
              </label>
              <textarea
                rows={15}
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full p-2 border rounded font-mono text-sm dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Right Column: Metadata & Media */}
          <div className="space-y-6">
            {/* Categories */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <label className="block text-sm font-bold mb-2 dark:text-slate-300">
                Categories
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                  >
                    {cat}{" "}
                    <button onClick={() => handleRemoveItem("categories", idx)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add category..."
                  value={formData.newCategory}
                  onChange={(e) =>
                    setFormData({ ...formData, newCategory: e.target.value })
                  }
                  className="flex-1 p-1.5 text-sm border rounded dark:bg-slate-800 dark:border-slate-600"
                />
                <button
                  onClick={() =>
                    handleAddItem("categories", formData.newCategory)
                  }
                  className="bg-blue-600 text-white p-1.5 rounded"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <label className="block text-sm font-bold mb-2 dark:text-slate-300">
                SEO Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs flex items-center gap-1"
                  >
                    {tag}{" "}
                    <button onClick={() => handleRemoveItem("tags", idx)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={formData.newTag}
                  onChange={(e) =>
                    setFormData({ ...formData, newTag: e.target.value })
                  }
                  className="flex-1 p-1.5 text-sm border rounded dark:bg-slate-800 dark:border-slate-600"
                />
                <button
                  onClick={() => handleAddItem("tags", formData.newTag)}
                  className="bg-purple-600 text-white p-1.5 rounded"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Media Manager */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <label className="block text-sm font-bold mb-3 dark:text-slate-300">
                Media Gallery
              </label>

              {/* Media List */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {formData.media.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-square bg-slate-200 rounded overflow-hidden"
                  >
                    <img
                      src={item.url}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveItem("media", idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {/* Upload Button */}
                <label
                  className={`flex-1 flex items-center justify-center gap-1 bg-white border border-slate-300 p-2 rounded cursor-pointer hover:bg-slate-50 transition text-xs font-medium ${uploading ? "opacity-50" : ""}`}
                >
                  {uploading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <UploadCloud size={14} />
                  )}
                  Upload
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleCloudinaryUpload}
                    disabled={uploading}
                  />
                </label>

                {/* AI Gen Button */}
                <button
                  onClick={handleGenerateAIImage}
                  disabled={isGeneratingImg}
                  className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-2 rounded text-xs font-medium hover:opacity-90"
                >
                  {isGeneratingImg ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Wand2 size={14} />
                  )}
                  Gen AI
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700"
          >
            {loading && <Loader2 size={16} className="animate-spin" />} Save
            Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRewrittenPost;
