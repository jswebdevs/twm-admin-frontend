import React, { useState, useEffect } from "react";
import {
  Activity,
  FileText,
  Sparkles,
  Layers,
  TrendingUp,
  Globe,
  ArrowRight,
  Clock,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import useAuth from "../hooks/useAuth";
import { ENDPOINTS } from "../config";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(ENDPOINTS.DASHBOARD, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.token]);

  const StatCard = ({ title, count, icon: Icon, color, bg }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
          {loading ? "..." : count}
        </h3>
      </div>
      <div className={`p-4 rounded-xl ${bg} ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Welcome back, {user?.name || "Editor"}. Here's what's happening
            today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
          <Clock size={14} />
          {format(new Date(), "EEEE, MMMM do, yyyy")}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Raw Articles"
          count={stats?.counts?.raw || 0}
          icon={Globe}
          color="text-blue-600"
          bg="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          title="Original Posts"
          count={stats?.counts?.original || 0}
          icon={FileText}
          color="text-emerald-600"
          bg="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <StatCard
          title="AI Rewritten"
          count={stats?.counts?.rewritten || 0}
          icon={Sparkles}
          color="text-purple-600"
          bg="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatCard
          title="Content Clusters"
          count={Math.floor((stats?.counts?.original || 0) / 3)} // Simulated estimate
          icon={Layers}
          color="text-orange-600"
          bg="bg-orange-50 dark:bg-orange-900/20"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Analytics Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-slate-400" />
                Content Velocity
              </h3>
              <p className="text-sm text-slate-500">
                Articles processed over the last 7 days
              </p>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats?.activity || []}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorOriginal"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorRewritten"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="original"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorOriginal)"
                  name="Original Posts"
                />
                <Area
                  type="monotone"
                  dataKey="rewritten"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRewritten)"
                  name="AI Rewritten"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Recent Activity & Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Zap size={20} className="text-yellow-300" /> Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/clustered-posts"
                className="bg-white/10 hover:bg-white/20 p-3 rounded-xl text-center transition backdrop-blur-sm border border-white/10"
              >
                <Layers className="mx-auto mb-2 text-indigo-200" size={24} />
                <span className="text-xs font-medium">Scan Clusters</span>
              </Link>
              <Link
                to="/raw-posts"
                className="bg-white/10 hover:bg-white/20 p-3 rounded-xl text-center transition backdrop-blur-sm border border-white/10"
              >
                <Globe className="mx-auto mb-2 text-blue-200" size={24} />
                <span className="text-xs font-medium">Fetch News</span>
              </Link>
              <Link
                to="/rewritten-posts"
                className="bg-white/10 hover:bg-white/20 p-3 rounded-xl text-center transition backdrop-blur-sm border border-white/10"
              >
                <Sparkles className="mx-auto mb-2 text-purple-200" size={24} />
                <span className="text-xs font-medium">View AI Content</span>
              </Link>
            </div>
          </div>

          {/* Recent Posts List */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Recent AI Posts
              </h3>
              <Link
                to="/rewritten-posts"
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                View All <ArrowRight size={12} />
              </Link>
            </div>

            <div className="space-y-4">
              {stats?.recentPosts?.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  No posts yet.
                </p>
              ) : (
                stats?.recentPosts?.map((post) => (
                  <div key={post._id} className="flex gap-3 items-start group">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Sparkles size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded">
                          {post.aiModel || "AI"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {format(new Date(post.createdAt), "MMM d")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
