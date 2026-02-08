import React, { useState, useEffect } from "react";
import { X, Save, Globe, Code, Layers } from "lucide-react";
import { ENDPOINTS } from "../config";
import useAuth from "../hooks/useAuth";

// Added 'websiteToEdit' prop
const AddWebsiteModal = ({
  isOpen,
  onClose,
  onSuccess,
  websiteToEdit = null,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const { user } = useAuth();

  // Default Empty State
  const initialFormState = {
    name: "",
    slug: "",
    baseUrl: "",
    isActive: true,
    engine: "playwright",
    selectors: {
      itemLink: "",
      contentWrapper: "",
      categories: "",
      waitForSelector: "",
    },
    pagination: {
      type: "url_replace",
      urlPattern: "",
      startPage: 1,
      maxPages: 1,
    },
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- 1. POPULATE FORM ON OPEN ---
  useEffect(() => {
    if (isOpen) {
      if (websiteToEdit) {
        // EDIT MODE: Fill form with existing data
        // We merge with initial state to ensure nested objects exist
        setFormData({
          ...initialFormState,
          ...websiteToEdit,
          selectors: {
            ...initialFormState.selectors,
            ...websiteToEdit.selectors,
          },
          pagination: {
            ...initialFormState.pagination,
            ...websiteToEdit.pagination,
          },
        });
      } else {
        // ADD MODE: Reset form
        setFormData(initialFormState);
      }
      setActiveTab("basic"); // Reset tab
      setError(null);
    }
  }, [isOpen, websiteToEdit]);

  // Handle Input Changes (Same as before)
  const handleChange = (e, section = null, subField = null) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subField || name]: val,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: val }));

      // Only auto-generate slug in ADD mode
      if (name === "name" && !websiteToEdit) {
        const generatedSlug = val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        setFormData((prev) => ({ ...prev, name: val, slug: generatedSlug }));
      }
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // DECIDE: POST (Create) or PUT (Update)
      const url = websiteToEdit
        ? `${ENDPOINTS.WEBSITES}/${websiteToEdit._id}`
        : ENDPOINTS.WEBSITES;

      const method = websiteToEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Operation failed");
      }

      onSuccess(data); // Pass back the saved data
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {websiteToEdit ? "Edit Website" : "Add New Source"}
            </h2>
            <p className="text-xs text-slate-500">
              {websiteToEdit
                ? `Editing configuration for ${websiteToEdit.name}`
                : "Configure a new news website for scraping."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {[
            { id: "basic", label: "Basic Info", icon: Globe },
            { id: "selectors", label: "Selectors", icon: Code },
            { id: "pagination", label: "Pagination", icon: Layers },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/30"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Body (Same fields as before) */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form id="website-form" onSubmit={handleSubmit} className="space-y-4">
            {/* TAB 1: BASIC */}
            {activeTab === "basic" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Source Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      name="slug"
                      required
                      // Disable slug editing in Edit Mode to prevent URL breaking
                      disabled={!!websiteToEdit}
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 outline-none text-sm font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Base URL
                  </label>
                  <input
                    type="url"
                    name="baseUrl"
                    required
                    value={formData.baseUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Scraping Engine
                  </label>
                  <select
                    name="engine"
                    value={formData.engine}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm bg-white"
                  >
                    <option value="playwright">Playwright</option>
                    <option value="cheerio">Cheerio</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 2: SELECTORS */}
            {activeTab === "selectors" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Item Link Selector
                  </label>
                  <input
                    type="text"
                    value={formData.selectors.itemLink}
                    onChange={(e) => handleChange(e, "selectors", "itemLink")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Content Wrapper
                  </label>
                  <input
                    type="text"
                    value={formData.selectors.contentWrapper}
                    onChange={(e) =>
                      handleChange(e, "selectors", "contentWrapper")
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Category Selector
                    </label>
                    <input
                      type="text"
                      value={formData.selectors.categories}
                      onChange={(e) =>
                        handleChange(e, "selectors", "categories")
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Wait For Selector
                    </label>
                    <input
                      type="text"
                      value={formData.selectors.waitForSelector}
                      onChange={(e) =>
                        handleChange(e, "selectors", "waitForSelector")
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PAGINATION */}
            {activeTab === "pagination" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Pagination Strategy
                  </label>
                  <select
                    name="type"
                    value={formData.pagination.type}
                    onChange={(e) => handleChange(e, "pagination", "type")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm bg-white"
                  >
                    <option value="url_replace">URL Replacement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    URL Pattern
                  </label>
                  <input
                    type="text"
                    value={formData.pagination.urlPattern}
                    onChange={(e) =>
                      handleChange(e, "pagination", "urlPattern")
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Start Page
                    </label>
                    <input
                      type="number"
                      value={formData.pagination.startPage}
                      onChange={(e) =>
                        handleChange(e, "pagination", "startPage")
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Max Pages
                    </label>
                    <input
                      type="number"
                      value={formData.pagination.maxPages}
                      onChange={(e) =>
                        handleChange(e, "pagination", "maxPages")
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="website-form"
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <Save size={18} />{" "}
                {websiteToEdit ? "Update Website" : "Save Website"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWebsiteModal;
