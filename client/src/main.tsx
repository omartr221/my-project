import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// تطبيق مبسط للفحص
function SimpleApp() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial", direction: "rtl", background: "#f0f0f0", minHeight: "100vh" }}>
      <h1 style={{ color: "#333", marginBottom: "20px" }}>🚗 V POWER TUNING</h1>
      <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <p style={{ fontSize: "18px", marginBottom: "15px" }}>مرحباً بك في نظام إدارة المهام</p>
        <button 
          onClick={() => {
            // تحميل التطبيق الكامل
            createRoot(document.getElementById("root")!).render(<App />);
          }}
          style={{ 
            padding: "12px 24px", 
            backgroundColor: "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          دخول النظام
        </button>
        <p style={{ marginTop: "15px", color: "#666" }}>
          المستخدم: الاستقبال | كلمة المرور: 11
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<SimpleApp />);
