// Production entry point for Render deployment
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// معالج شامل لجميع الأخطاء
window.addEventListener(
  "error",
  function (event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  },
  true,
);

window.addEventListener("unhandledrejection", function (event) {
  event.preventDefault();
  event.stopPropagation();
  return false;
});

// تسجيل حدث النشر
console.log("🚀 V POWER TUNING - Starting in production mode...");

createRoot(document.getElementById("root")!).render(<App />);
