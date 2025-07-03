import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Clock, Archive, UserCheck } from "lucide-react";

export default function TestDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "timers" | "history" | "archive" | "addworker">("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">إجمالي العمال</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">12</div>
                  <p className="text-sm text-gray-600">موظف مسجل</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">العمال المتاحون</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">11</div>
                  <p className="text-sm text-gray-600">متاح للعمل</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">العمال المشغولون</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">1</div>
                  <p className="text-sm text-gray-600">يعمل حالياً</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">المهام النشطة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">1</div>
                  <p className="text-sm text-gray-600">قيد التنفيذ</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>النظام يعمل بشكل صحيح</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">هذا اختبار للتأكد من أن النظام يعمل بشكل صحيح</p>
              </CardContent>
            </Card>
          </div>
        );
        
      case "timers":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>المؤقتات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">صفحة المؤقتات - سيتم إضافة النماذج هنا</p>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الصفحة الافتراضية</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">اختر علامة تبويب من الأعلى</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold">V POWER TUNING</h1>
              <p className="text-red-100">نظام إدارة المهام</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-red-100">اختبار النظام</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <nav className="flex space-x-reverse space-x-4 bg-white rounded-lg shadow p-2">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              onClick={() => setActiveTab("dashboard")}
              className="font-medium"
            >
              <Users className="ml-2 h-4 w-4" />
              لوحة المتابعة
            </Button>
            <Button
              variant={activeTab === "timers" ? "default" : "ghost"}
              onClick={() => setActiveTab("timers")}
              className="font-medium"
            >
              <Clock className="ml-2 h-4 w-4" />
              المؤقتات
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "ghost"}
              onClick={() => setActiveTab("history")}
              className="font-medium"
            >
              <Clock className="ml-2 h-4 w-4" />
              سجل المهام
            </Button>
            <Button
              variant={activeTab === "archive" ? "default" : "ghost"}
              onClick={() => setActiveTab("archive")}
              className="font-medium"
            >
              <Archive className="ml-2 h-4 w-4" />
              استلام نهائي
            </Button>
            <Button
              variant={activeTab === "addworker" ? "default" : "ghost"}
              onClick={() => setActiveTab("addworker")}
              className="font-medium"
            >
              <UserCheck className="ml-2 h-4 w-4" />
              إضافة موظف
            </Button>
          </nav>
        </div>

        <main>{renderContent()}</main>
      </div>
    </div>
  );
}