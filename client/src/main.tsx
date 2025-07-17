import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 V POWER TUNING App Starting...");

const root = document.getElementById("root");
if (!root) {
  console.error("❌ Root element not found!");
  document.body.innerHTML = "<div style='padding: 20px; text-align: center; color: red;'>❌ Root element not found!</div>";
} else {
  console.log("✅ Root element found, rendering app...");
  createRoot(root).render(<App />);
}
