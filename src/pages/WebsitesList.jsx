import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Play,
  Edit,
  Trash2,
  Globe,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import { format } from "date-fns";
import { ENDPOINTS } from "../config";
import useAuth from "../hooks/useAuth"; // Import Auth Hook
import AddWebsiteModal from "../components/AddWebsiteModal";
import ScraperLogModal from "../components/ScraperLogModal";

const WebsitesList = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null); // <--- Add this
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [scrapingId, setScrapingId] = useState(null); // Track which site is scraping
  const [activeScrapeSite, setActiveScrapeSite] = useState({
    id: null,
    name: "",
  });
  const handleRunScraper = (id, name) => {
    setActiveScrapeSite({ id, name });
    setIsLogModalOpen(true);
  };

  const { user } = useAuth(); // Get the user token

  // --- 1. Fetch Data ---
  const fetchWebsites = async () => {
    try {
      const response = await fetch(ENDPOINTS.WEBSITES);
      if (!response.ok) throw new Error("Failed to fetch websites");
      const data = await response.json();
      setWebsites(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  // --- 3. Filter Logic ---
  const filteredWebsites = websites.filter(
    (site) =>
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.baseUrl.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // --- 4. Render Helpers ---
  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
        <CheckCircle size={12} /> Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
        <XCircle size={12} /> Inactive
      </span>
    );
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-3"></div>
        Loading websites...
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-200">
        Error loading data: {error}
      </div>
    );

  return (
    <div className="space-y-6 bg-white dark:bg-slate-900 p-6 shadow-sm">
      {/* --- Header Section --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Websites List
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your news sources and scraper configurations.
          </p>
        </div>

        <button
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          onClick={() => {
            setEditingSite(null); // Clear edit mode
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} />
          Add New Website
        </button>
      </div>

      {/* --- Filters & Search --- */}
      <div className="bg-slate-50 dark:bg-slate-500/50 p-4 rounded-xl border border-none outline-none ring-0 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search sources by name or URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm dark:text-white"
          />
        </div>
      </div>

      {/* --- Data Table --- */}
      <div className="bg-slate-50 dark:bg-slate-500 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-500 border-b border-slate-200 ">
              <tr className="divide-x divide-slate-200">
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-white">
                  Source Name
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-white">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-white">
                  Engine
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-white">
                  Last Scraped
                </th>
                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-white text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWebsites.length > 0 ? (
                filteredWebsites.map((site) => (
                  <tr
                    key={site._id}
                    className="hover:bg-slate-700/80 transition-colors group divide-x divide-slate-200"
                  >
                    {/* Name Column */}
                    <td className="px-6 py-4 items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                          {site.favicon ? (
                            <img
                              src={site.favicon}
                              alt=""
                              className="w-6 h-6"
                            />
                          ) : (
                            <Globe size={20} />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {site.name}
                          </div>
                          <a
                            href={site.baseUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-slate-500 dark:text-slate-50 hover:text-emerald-600 truncate max-w-[200px] block transition-colors"
                          >
                            {site.baseUrl}
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      {getStatusBadge(site.isActive)}
                    </td>

                    {/* Engine Column */}
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-mono border border-slate-200 font-medium uppercase tracking-wider">
                        {site.engine}
                      </span>
                    </td>

                    {/* Last Scraped Column */}
                    <td className="px-6 py-4 text-slate-500 dark:text-white text-semibold">
                      {site.lastScrapedAt ? (
                        format(new Date(site.lastScrapedAt), "MMM d, h:mm a")
                      ) : (
                        <span className="text-slate-400 italic text-xs">
                          Never Run
                        </span>
                      )}
                    </td>

                    {/* Actions Column (Visible on Hover) */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-100 sm:group transition-opacity duration-200">
                        {/* RUN SCRAPER BUTTON */}
                        <button
                          className="p-2 text-slate-400 dark:text-slate-50 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Run Scraper Now"
                          onClick={() => handleRunScraper(site._id, site.name)}
                          disabled={scrapingId === site._id}
                        >
                          {scrapingId === site._id ? (
                            <Loader
                              size={18}
                              className="animate-spin text-emerald-600"
                            />
                          ) : (
                            <Play size={18} />
                          )}
                        </button>

                        <button
                          className="p-2 text-slate-400 dark:text-slate-50 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Configuration"
                          onClick={() => {
                            setEditingSite(site); // Set the site to edit
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="p-2 text-slate-400 dark:text-slate-50 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Source"
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
                    colSpan="5"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Globe size={48} className="text-slate-200 mb-2" />
                      <p>No websites found matching "{searchTerm}".</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Footer --- */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 dark:bg-slate-500 flex justify-between items-center text-xs text-slate-500">
          <span>Showing {filteredWebsites.length} sources</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-slate-200 bg-white text-slate-800 cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-1 rounded border border-slate-200 bg-white text-slate-800 cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>

      <AddWebsiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        websiteToEdit={editingSite} // <--- Pass the site here
        onSuccess={() => {
          fetchWebsites(); // Just refresh the whole list to be safe
        }}
      />
      <ScraperLogModal
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          // Optional: Refresh list on close to update timestamps
          fetchWebsites();
        }}
        websiteId={activeScrapeSite.id}
        websiteName={activeScrapeSite.name}
      />
    </div>
  );
};

export default WebsitesList;
