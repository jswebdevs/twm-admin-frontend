import React from "react";
import { useNavigate, useRouteError } from "react-router-dom"; // If using React Router data APIs
import { AlertTriangle, Home, ArrowLeft, RefreshCw } from "lucide-react";

const ErrorPage = ({ type = "404" }) => {
  const navigate = useNavigate();

  // Optional: If you use React Router's errorElement, you can get specific details
  const error = useRouteError();

  const isNotFound = type === "404" || error?.status === 404;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 transition-colors duration-300">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon Container */}
        <div className="relative mx-auto w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-none animate-bounce-slow">
          <div className="absolute inset-0 bg-red-100 dark:bg-red-900/20 rounded-full animate-ping opacity-75"></div>
          <AlertTriangle
            size={48}
            className={isNotFound ? "text-slate-400" : "text-red-500"}
          />
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isNotFound ? "Page Not Found" : "Something went wrong"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            {isNotFound
              ? "Sorry, we couldn't find the page you're looking for. It might have been moved or deleted."
              : error?.statusText ||
                error?.message ||
                "An unexpected error occurred while processing your request."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium shadow-sm"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-medium shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Home size={18} />
            Back to Dashboard
          </button>

          {!isNotFound && (
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium"
            >
              <RefreshCw size={18} />
              Reload
            </button>
          )}
        </div>

        {/* Footer Help */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-400">
            Need help?{" "}
            <a href="#" className="text-indigo-600 hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
