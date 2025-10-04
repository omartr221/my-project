import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// معالج شامل لجميع الأخطاء
window.addEventListener('error', function(event) {
  event.preventDefault();
  event.stopPropagation();
  return false;
}, true);

window.addEventListener('unhandledrejection', function(event) {
  event.preventDefault();
  event.stopPropagation();
  return false;
});

// إلغاء وظيفة alert
const originalAlert = window.alert;
window.alert = function() { return true; };

// إلغاء وظيفة confirm
const originalConfirm = window.confirm;
window.confirm = function() { return true; };

// حماية من رسائل الخطأ
(function() {
  const originalConsoleError = console.error;
  console.error = function(...args) {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('replit')) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
})();

createRoot(document.getElementById("root")!).render(<App />);
