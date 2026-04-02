import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";

import "./index.css";
import { router } from "./router";
import { ThemeProvider } from "./components/theme-provider";

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <ThemeProvider defaultTheme="system" storageKey="attendance-theme">
    <RouterProvider router={router} />
  </ThemeProvider>
);
