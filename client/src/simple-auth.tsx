import { useState } from "react";

export default function SimpleAuth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // تحويل للوحة الرئيسية
        window.location.href = '/dashboard';
      } else {
        setError("خطأ في اسم المستخدم أو كلمة المرور");
      }
    } catch (err) {
      setError("خطأ في الاتصال");
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
      direction: "rtl",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        textAlign: "center",
        maxWidth: "400px",
        width: "100%"
      }}>
        <h1 style={{ color: "#333", marginBottom: "30px", fontSize: "28px" }}>
          🚗 V POWER TUNING
        </h1>
        <h2 style={{ color: "#666", marginBottom: "30px", fontSize: "18px" }}>
          تسجيل الدخول
        </h2>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px", textAlign: "right" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#333", fontWeight: "bold" }}>
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #ddd",
                borderRadius: "6px",
                fontSize: "16px",
                direction: "rtl",
                boxSizing: "border-box"
              }}
              placeholder="الاستقبال"
              required
            />
          </div>
          
          <div style={{ marginBottom: "20px", textAlign: "right" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#333", fontWeight: "bold" }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #ddd",
                borderRadius: "6px",
                fontSize: "16px",
                direction: "rtl",
                boxSizing: "border-box"
              }}
              placeholder="11"
              required
            />
          </div>

          {error && (
            <div style={{ 
              color: "#dc3545", 
              marginBottom: "20px", 
              padding: "10px",
              background: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "4px"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              background: loading ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            {loading ? "جاري تسجيل الدخول..." : "دخول"}
          </button>
        </form>

        <div style={{
          marginTop: "20px",
          padding: "15px",
          background: "#e9ecef",
          borderRadius: "6px",
          fontSize: "14px"
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