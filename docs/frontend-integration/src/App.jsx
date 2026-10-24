import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Layout from "./components/layout";
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "*", element: <Navigate to="/" replace />, handle: { skipPageView: true } },
    ],
  },
  // Admin panel, outside the site layout (so admin visits are not counted as page views).
  // Every part is loaded on demand to keep it out of the public bundle.
  {
    path: "/admin",
    lazy: async () => ({ Component: (await import("./pages/Admin/AdminLayout")).default }),
    children: [
      { index: true, element: <Navigate to="analytics" replace /> },
      { path: "analytics", lazy: async () => ({ Component: (await import("./pages/Admin/Analytics")).default }) },
      { path: "settings", lazy: async () => ({ Component: (await import("./pages/Admin/SettingsPage")).default }) },
      // services | plans | showcase | testimonials (see RESOURCES in pages/Admin/admin-config.js)
      { path: ":resource", lazy: async () => ({ Component: (await import("./pages/Admin/ResourcePage")).default }) },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
