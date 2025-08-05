import { createRoot } from "react-dom/client";

// مكون بسيط للتأكد من العمل
function SimpleApp() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
      direction: "rtl"
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        textAlign: "center",
        maxWidth: "400px"
      }}>
        <h1 style={{ color: "#333", marginBottom: "20px", fontSize: "28px" }}>
          🚗 V POWER TUNING
        </h1>
        <p style={{ color: "#666", fontSize: "18px", marginBottom: "25px" }}>
          نظام إدارة المهام والعمال
        </p>
        <button 
          onClick={() => {
            // تحميل صفحة تسجيل الدخول
            import('./simple-auth').then(module => {
              const SimpleAuth = module.default;
              const root = document.getElementById("root");
              if (root) {
                createRoot(root).render(<SimpleAuth />);
              }
            });
          }}
          style={{
            padding: "15px 30px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            width: "100%"
          }}
        >
          دخول النظام
        </button>
        <div style={{
          marginTop: "20px",
          padding: "15px",
          background: "#f8f9fa",
          borderRadius: "6px"
        }}>
          <p style={{ margin: "5px 0", color: "#495057" }}>
            <strong>المستخدم:</strong> الاستقبال
          </p>
          <p style={{ margin: "5px 0", color: "#495057" }}>
            <strong>كلمة المرور:</strong> 11
          </p>
        </div>
      </div>
    </div>
  );
}

// تحميل التطبيق المبسط
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<SimpleApp />);
}
