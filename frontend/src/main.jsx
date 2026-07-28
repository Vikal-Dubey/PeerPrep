import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import DataProvider from "./context/DataProvider.jsx";

// Global fetch interceptor to append JWT token dynamically (resolves cross-origin cookie blockages)
const originalFetch = window.fetch;
window.fetch = async (resource, config = {}) => {
  const token = localStorage.getItem("token");
  if (token) {
    const headers = config.headers ? new Headers(config.headers) : new Headers();
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    config.headers = headers;
  }
  return originalFetch(resource, config);
};

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <DataProvider>
      <App />
    </DataProvider>
  </BrowserRouter>
);