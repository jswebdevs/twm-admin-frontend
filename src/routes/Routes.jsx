import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Root from "../layout/Root";
import Dashboard from "../pages/Dashboard";
import WebsitesList from "../pages/WebsitesList";
import Login from "../pages/Login"; // Make sure you have this
import PrivateRoutes from "./PrivateRoutes";
import RawPosts from "../pages/RawPosts";
import OriginalPosts from "../pages/OriginalPosts";
import RewrittenPosts from "../pages/RewrittenPosts";
import ClusteredPosts from "../pages/ClusteredPosts";
import SummarizedPosts from "../pages/SummarizedPosts";
import FinalPosts from "../pages/FinalPosts";
import ErrorPage from "../pages/ErrorPage";

const Routes = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    // Wrapper Route: Checks if user is logged in
    element: <PrivateRoutes />,
    errorElement: <ErrorPage/>,
    children: [
      {
        // Layout Route: Renders Sidebar + Page Content
        path: "/",
        element: <Root />,
        children: [
          {
            path: "/",
            element: <Dashboard />,
          },
          {
            path: "/websites",
            element: <WebsitesList />,
          },
          {
            path: "/posts/raw-posts",
            element: <RawPosts/>
          },
          {
            path: "/posts/original-posts",
            element: <OriginalPosts/>
          },
          {
            path: "/posts/rewritten-posts",
            element: <RewrittenPosts/>
          },
          {
            path: "/posts/clustered-posts",
            element: <ClusteredPosts/>
          },
          {
            path: "/posts/summarized-posts",
            element: <SummarizedPosts/>
          },
          {
            path: "/posts/final-posts",
            element: <FinalPosts/>
          }
        ],
      },
    ],
  },
]);

export default Routes;
