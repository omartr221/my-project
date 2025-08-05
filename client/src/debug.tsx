import { createRoot } from "react-dom/client";

function DebugApp() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial", direction: "rtl" }}>
      <h1 style={{ color: "green" }}>تطبيق V POWER TUNING</h1>
      <p>هذه صفحة تجريبية للتأكد من عمل التطبيق</p>
      <button 
        onClick={() => window.location.href = '/auth'}
        style={{ 
          padding: "10px 20px", 
          backgroundColor: "#007bff", 
          color: "white", 
          border: "none", 
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        الذهاب لصفحة تسجيل الدخول
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<DebugApp />);