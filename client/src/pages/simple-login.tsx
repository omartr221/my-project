import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function SimpleLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { loginMutation } = useAuth();
  const [location, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await loginMutation.mutateAsync({ username, password });
      setLocation("/dashboard");
    } catch (err) {
      setError("خطأ في اسم المستخدم أو كلمة المرور");
    }
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      margin: 0,
      padding: "20px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      direction: "rtl"
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "10px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        textAlign: "center",
        maxWidth: "400px",
        width: "100%"
      }}>
        <div style={{
          fontSize: "28px",
          fontWeight: "bold",
          color: "#667eea",
          marginBottom: "20px"
        }}>
          V POWER TUNING
        </div>
        
        <h1 style={{
          color: "#333",
          marginBottom: "30px",
          fontSize: "24px"
        }}>
          نظام إدارة المهام
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{
            marginBottom: "20px",
            textAlign: "right"
          }}>
            <label style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
              color: "#555"
            }}>
              اسم المستخدم:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #ddd",
                borderRadius: "5px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
            />
          </div>
          
          <div style={{
            marginBottom: "20px",
            textAlign: "right"
          }}>
            <label style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
              color: "#555"
            }}>
              كلمة المرور:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #ddd",
                borderRadius: "5px",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={loginMutation.isPending}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              padding: "12px 30px",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: loginMutation.isPending ? "not-allowed" : "pointer",
              width: "100%",
              marginTop: "10px",
              opacity: loginMutation.isPending ? 0.7 : 1
            }}
          >
            {loginMutation.isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
          
          {error && (
            <div style={{
              color: "red",
              marginTop: "10px"
            }}>
              {error}
            </div>
          )}
        </form>
        
        <div style={{
          marginTop: "30px",
          padding: "15px",
          background: "#f8f9fa",
          borderRadius: "5px",
          textAlign: "right",
          fontSize: "14px",
          color: "#666"
        }}>
          <strong>بيانات التسجيل:</strong><br/>
          Finance: ملك (12345)<br/>
          Operator: بدوي (0000)<br/>
          Viewer: هبة (123456)<br/>
          Supervisor: روان (1234567)
        </div>
      </div>
    </div>
  );
}