import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, UserCheck } from "lucide-react";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    try {
      await loginMutation.mutateAsync({ username, password });
      setLocation("/");
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="text-center lg:text-right space-y-6">
          <div className="flex justify-center lg:justify-end">
            <div className="bg-gradient-to-r from-red-500 to-red-700 text-white p-6 rounded-2xl shadow-lg">
              <UserCheck className="h-12 w-12 mx-auto" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">
            نظام إدارة المهام
          </h1>
          <h2 className="text-2xl font-semibold text-red-600">
            V POWER TUNING
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            نظام شامل لإدارة المهام وتتبع الأوقات وإدارة فريق العمل
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-800 mb-2">
                إدارة المهام
              </h3>
              <p className="text-sm text-gray-600">
                تتبع المهام اليومية وحالة إنجازها
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-800 mb-2">
                إدارة العملاء
              </h3>
              <p className="text-sm text-gray-600">
                قاعدة بيانات شاملة للعملاء والسيارات
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
            <CardDescription>
              أدخل بيانات المستخدم للوصول إلى النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  "جاري تسجيل الدخول..."
                ) : (
                  <>
                    <LogIn className="w-4 h-4 ml-2" />
                    تسجيل الدخول
                  </>
                )}
              </Button>
            </form>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}