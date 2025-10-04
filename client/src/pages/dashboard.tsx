import { useState, useEffect } from "react";
import { Clock, Users, UserCheck, Watch, ListTodo, Archive, LogOut, Package2, Car, ArrowLeft, CheckCircle, BookOpen, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth, usePermissions } from "@/hooks/use-auth";
import logoImage from "@assets/Empty Logo with brands_1750921899348.png";
import { NotificationCenter } from "@/components/NotificationCenter";
import { formatTime, formatDate } from "@/lib/utils";
import ActiveTimers from "@/components/ActiveTimers";
import NewTaskForm from "@/components/NewTaskForm";
import TaskHistoryTable from "@/components/TaskHistoryTable";
import ArchiveView from "@/components/ArchiveView";
import AddWorkerForm from "@/components/AddWorkerForm";
import PausedTasksList from "@/components/PausedTasksList";
import CustomerCard from "@/components/CustomerCard";
import CustomerAccount from "@/components/CustomerAccount";
import TaskDistribution from "@/components/TaskDistribution";
import PartsRequestForm from "@/components/PartsRequestForm";
import PartsRequestsList from "@/components/PartsRequestsList";
import RequestsList from "@/components/RequestsList";
import PrepareDelivery from "@/components/PrepareDelivery";
import HabaNotificationDialog from "@/components/HabaNotificationDialog";
import WorkshopNotificationDialog from "@/components/WorkshopNotificationDialog";

import CarStatusDisplay from "@/components/CarStatusDisplay";
import CarPositionsView from "@/components/CarPositionsView";
import CarDeliveryView from "@/components/CarDeliveryView";
import CustomerDeliveryView from "@/components/CustomerDeliveryView";

import Reception from "@/pages/Reception";
import Workshop from "@/pages/Workshop";
import { MaintenanceGuides } from "@/components/MaintenanceGuides";
import BackupPage from "@/pages/BackupPage";
import { useNotifications } from "@/hooks/useNotifications";

type TabType = "dashboard" | "timers" | "history" | "archive" | "addworker" | "customercard" | "customer-account" | "task-distribution" | "parts-requests" | "requests" | "car-status" | "car-positions" | "car-receipts" | "reception" | "workshop" | "car-delivery" | "customer-delivery" | "maintenance" | "backup";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isConnected } = useWebSocket();
  const { user, logoutMutation } = useAuth();
  const { canRead, canWrite, canCreate, isFinance, isOperator, isViewer, isSupervisor } = usePermissions();
  const { newRequestsCount, newPartsRequestsCount, markPartsRequestsAsViewed } = useNotifications();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };


  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Add notification listener for new car receptions (بدوي only)
  useEffect(() => {
    if (user?.username !== 'بدوي') return;

    const handleNewCarReception = (event: CustomEvent) => {
      const { licensePlate, carOwnerName, message } = event.detail;
      
      // Show notification toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-md';
      toast.innerHTML = `
        <div class="flex items-center">
          <div class="flex-shrink-0 mr-3">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <p class="font-medium">🚗 سيارة جديدة في الاستقبال!</p>
            <p class="text-sm">${carOwnerName} - ${licensePlate}</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(toast);
      
      // Remove toast after 5 seconds
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 5000);
    };

    window.addEventListener('newCarReception', handleNewCarReception as EventListener);
    
    return () => {
      window.removeEventListener('newCarReception', handleNewCarReception as EventListener);
    };
  }, [user?.username]);

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: workers } = useQuery({
    queryKey: ['/api/workers'],
  });

  const { data: activeTasks } = useQuery({
    queryKey: ['/api/tasks/active'],
  });

  const { data: allTasks } = useQuery({
    queryKey: ['/api/tasks/history'],
  });



  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        // Redirect الاستقبال user to car-receipts tab
        if (user?.username === "الاستقبال") {
          return <div className="text-center text-gray-500">يرجى استخدام تبويب "استلام السيارة"</div>;
        }
        return (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">إجمالي العمال</p>
                      <p className="text-2xl font-bold text-primary">
                        {Array.isArray(workers) ? workers.length : 0}
                      </p>
                      {Array.isArray(workers) && workers.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">الأسماء:</p>
                          <p className="text-xs text-gray-600">
                            {workers.map((w: any) => w.name).join('، ')}
                          </p>
                        </div>
                      )}
                    </div>
                    <Users className="h-8 w-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">العمال المتاحين</p>
                      <p className="text-2xl font-bold success">
                        {Array.isArray(workers) ? workers.filter((w: any) => w.status === "available").length : 0}
                      </p>
                    </div>
                    <UserCheck className="h-8 w-8 success opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">العمال المشغولين</p>
                      <p className="text-2xl font-bold error">
                        {Array.isArray(workers) ? workers.filter((w: any) => w.status === "busy").length : 0}
                      </p>
                    </div>
                    <Watch className="h-8 w-8 error opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">المهام النشطة</p>
                      <p className="text-2xl font-bold warning">
                        {Array.isArray(activeTasks) ? activeTasks.length : 0}
                      </p>
                    </div>
                    <ListTodo className="h-8 w-8 warning opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>



            {/* Active Timers */}
            <div className="mt-8 space-y-4">
              <ActiveTimers tasks={activeTasks || []} showControls />
              <PausedTasksList tasks={activeTasks || []} />
            </div>
          </div>
        );
      
      case "timers":
        return (
          <div className="space-y-6">
            {(canWrite("tasks") || canCreate("tasks")) && <NewTaskForm />}
            <ActiveTimers tasks={activeTasks || []} showControls />
            <PausedTasksList tasks={activeTasks || []} />
          </div>
        );
      

      
      case "history":
        return <TaskHistoryTable />;
      
      case "archive":
        return <ArchiveView />;
      
      case "addworker":
        return <AddWorkerForm />;
      
      case "customercard":
        return <CustomerCard />;
      
      case "customer-account":
        return <CustomerAccount />;
      
      case "task-distribution":
        return <TaskDistribution />;
      
      case "parts-requests":
        return (
          <div className="space-y-6">
            {canCreate("parts") && <PartsRequestForm />}
            <PartsRequestsList />
          </div>
        );
      
      case "requests":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">الطلبات الواردة</h2>
              <RequestsList />
            </div>
          </div>
        );

{/* Removed prepare-delivery case as requested */}
      case "car-status":
        return <CarStatusDisplay />;
      
      case "car-positions":
        return <CarPositionsView />;
      
{/* تم حذف case "finish-delivery" */}
        
      case "reception":
        return <Reception />;
      
      case "workshop":
        return <Workshop />;
      
      case "maintenance":
        return <MaintenanceGuides />;
      
      case "car-delivery":
        return <CarDeliveryView />;
      
      case "customer-delivery":
        return <CustomerDeliveryView />;
      
      case "backup":
        return <BackupPage />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 arabic-font">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-gray-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-reverse space-x-4">
              <img 
                src={logoImage} 
                alt="V POWER TUNING Logo" 
                className="h-12 w-auto object-contain bg-white rounded p-1"
              />
              <Clock className="h-6 w-6" />
              <div>
                <h1 className="text-xl font-bold">توزيع المهام</h1>
                <p className="text-red-200 text-sm">V POWER TUNING</p>
              </div>
            </div>
            <div className="flex items-center space-x-reverse space-x-4">
              <div className="flex items-center space-x-reverse space-x-2">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-400' : 'bg-red-400'
                  }`}
                />
                <span className="text-sm">
                  {isConnected ? 'متصل' : 'غير متصل'}
                </span>
              </div>
              <span className="text-sm">{formatTime(currentTime)}</span>
              <span className="text-sm">
                {new Intl.DateTimeFormat('ar-EG', {
                  day: 'numeric',
                  month: 'numeric',
                  year: 'numeric',
                  calendar: 'gregory',
                  timeZone: 'Asia/Damascus'
                }).format(currentTime)}
              </span>
              <div className="flex items-center space-x-reverse space-x-4">
                <NotificationCenter />
                <span className="text-sm">
                  مرحباً، {user?.username || 'المستخدم'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white hover:bg-red-700"
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4 ml-2" />
                  خروج
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-reverse space-x-4 bg-white rounded-lg shadow p-2">
            {/* Show limited tabs for الاستقبال user */}
            {user?.username === "الاستقبال" ? (
              <>
                <Button
                  variant={activeTab === "customercard" ? "default" : "ghost"}
                  onClick={() => setActiveTab("customercard")}
                  className="font-medium"
                >
                  <Users className="ml-2 h-4 w-4" />
                  بطاقة زبون
                </Button>

                <Button
                  variant={activeTab === "car-status" ? "default" : "ghost"}
                  onClick={() => setActiveTab("car-status")}
                  className="font-medium"
                >
                  <Car className="ml-2 h-4 w-4" />
                  وضع السيارات
                </Button>

                {/* تبويب تسليم للزبون - للاستقبال فقط */}
                {(user?.role === "reception" || user?.username === "الاستقبال" || user?.username === "فارس") && (
                  <Button
                    variant={activeTab === "customer-delivery" ? "default" : "ghost"}
                    onClick={() => setActiveTab("customer-delivery")}
                    className="font-medium"
                  >
                    <CheckCircle className="ml-2 h-4 w-4" />
                    تسليم للزبون
                  </Button>
                )}



              </>
            ) : (
              <>
                {canRead("dashboard") && (
                  <Button
                    variant={activeTab === "dashboard" ? "default" : "ghost"}
                    onClick={() => setActiveTab("dashboard")}
                    className="font-medium"
                  >
                    <Users className="ml-2 h-4 w-4" />
                    لوحة المتابعة
                  </Button>
                )}
                
                {(canRead("timers") || canWrite("timers")) && (
                  <Button
                    variant={activeTab === "timers" ? "default" : "ghost"}
                    onClick={() => setActiveTab("timers")}
                    className="font-medium"
                  >
                    <Clock className="ml-2 h-4 w-4" />
                    المؤقتات
                  </Button>
                )}

                {canRead("tasks") && (
                  <Button
                    variant={activeTab === "history" ? "default" : "ghost"}
                    onClick={() => setActiveTab("history")}
                    className="font-medium"
                  >
                    <Clock className="ml-2 h-4 w-4" />
                    سجل المهام
                  </Button>
                )}
                
                {canRead("archive") && !isViewer && (
                  <Button
                    variant={activeTab === "archive" ? "default" : "ghost"}
                    onClick={() => setActiveTab("archive")}
                    className="font-medium"
                  >
                    <Archive className="ml-2 h-4 w-4" />
                    الأرشيف
                  </Button>
                )}

                {(!isFinance && !isOperator && !isViewer && !isSupervisor) || user?.username === "فارس" && (
                  <Button
                    variant={activeTab === "addworker" ? "default" : "ghost"}
                    onClick={() => setActiveTab("addworker")}
                    className="font-medium"
                  >
                    <UserCheck className="ml-2 h-4 w-4" />
                    إضافة موظف
                  </Button>
                )}
                
                {(canRead("customers") || user?.username === "فارس" || user?.username === "ملك") && (
                  <Button
                    variant={activeTab === "customercard" ? "default" : "ghost"}
                    onClick={() => setActiveTab("customercard")}
                    className="font-medium"
                  >
                    <Users className="ml-2 h-4 w-4" />
                    بطاقة زبون
                  </Button>
                )}

                {/* حساب الزبون - متاح لملك */}
                {user?.username === "ملك" && (
                  <Button
                    variant={activeTab === "customer-account" ? "default" : "ghost"}
                    onClick={() => setActiveTab("customer-account")}
                    className="font-medium"
                  >
                    <Users className="ml-2 h-4 w-4" />
                    حساب الزبون
                  </Button>
                )}

                {/* توزيع المهام - متاح لملك */}
                {user?.username === "ملك" && (
                  <Button
                    variant={activeTab === "task-distribution" ? "default" : "ghost"}
                    onClick={() => setActiveTab("task-distribution")}
                    className="font-medium"
                  >
                    <Archive className="ml-2 h-4 w-4" />
                    توزيع المهام
                  </Button>
                )}

                {(canRead("parts") || user?.username === "فارس") && (
                  <Button
                    variant={activeTab === "parts-requests" ? "default" : "ghost"}
                    onClick={() => setActiveTab("parts-requests")}
                    className="font-medium"
                  >
                    <Package2 className="ml-2 h-4 w-4" />
                    طلبات القطع
                  </Button>
                )}

{/* Removed prepare-delivery button for بدوي as requested */}

                {/* وضع السيارات - متاح لبدوي وفارس */}
                {(user?.username === "بدوي" || user?.username === "فارس" || isOperator) && (
                  <Button
                    variant={activeTab === "car-positions" ? "default" : "ghost"}
                    onClick={() => setActiveTab("car-positions")}
                    className="font-medium"
                  >
                    <Car className="ml-2 h-4 w-4" />
                    وضع السيارات
                  </Button>
                )}

{/* تم حذف خانة "انهاء المؤقت والتسليم" كما طلب المستخدم */}

                {/* الطلبات - خاص بحساب هبة */}
                {(user?.username === "هبة" || user?.role === "viewer") && (
                  <Button
                    variant={activeTab === "requests" ? "default" : "ghost"}
                    onClick={() => {
                      setActiveTab("requests");
                      // تحديد الطلبات كمقروءة عند النقر على الخانة (فقط لهبة)
                      if (user?.username === "هبة") {
                        markPartsRequestsAsViewed();
                      }
                    }}
                    className="font-medium relative"
                  >
                    <ListTodo className="ml-2 h-4 w-4" />
                    الطلبات
                    {user?.username === "هبة" && newPartsRequestsCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {newPartsRequestsCount}
                      </span>
                    )}
                  </Button>
                )}
              </>
            )}

{/* تم إزالة زر استلام السيارة للتبسيط */}

            {/* الاستقبال - متاح لفارس والاستقبال */}
            {(user?.role === "reception" || user?.username === "الاستقبال" || user?.username === "فارس") && (
              <Button
                variant={activeTab === "reception" ? "default" : "ghost"}
                onClick={() => setActiveTab("reception")}
                className="font-medium"
              >
                <Car className="ml-2 h-4 w-4" />
                الاستقبال
              </Button>
            )}

            {/* الورشة - متاح لفارس فقط */}
            {user?.username === "فارس" && (
              <Button
                variant={activeTab === "workshop" ? "default" : "ghost"}
                onClick={() => setActiveTab("workshop")}
                className="font-medium"
              >
                <Watch className="ml-2 h-4 w-4" />
                الورشة
              </Button>
            )}

            {/* دليل الصيانة - متاح للجميع */}
            <Button
              variant={activeTab === "maintenance" ? "default" : "ghost"}
              onClick={() => setActiveTab("maintenance")}
              className="font-medium"
              data-testid="tab-maintenance"
            >
              <BookOpen className="ml-2 h-4 w-4" />
              دليل الصيانة
            </Button>

            {/* النسخ الاحتياطي - متاح لفارس فقط */}
            {user?.username === "فارس" && (
              <Button
                variant={activeTab === "backup" ? "default" : "ghost"}
                onClick={() => setActiveTab("backup")}
                className="font-medium"
                data-testid="tab-backup"
              >
                <Database className="ml-2 h-4 w-4" />
                النسخ الاحتياطي
              </Button>
            )}

            {/* تبويب تسليم السيارة - لبدوي وفارس */}
            {(user?.username === "بدوي" || user?.username === "فارس") && (
              <Button
                variant={activeTab === "car-delivery" ? "default" : "ghost"}
                onClick={() => setActiveTab("car-delivery")}
                className="font-medium"
              >
                <ArrowLeft className="ml-2 h-4 w-4" />
                تسليم السيارة
              </Button>
            )}

            {/* تبويب تسليم للزبون - لفارس */}
            {user?.username === "فارس" && (
              <Button
                variant={activeTab === "customer-delivery" ? "default" : "ghost"}
                onClick={() => setActiveTab("customer-delivery")}
                className="font-medium"
              >
                <CheckCircle className="ml-2 h-4 w-4" />
                تسليم للزبون
              </Button>
            )}


          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
      
      {/* نافذة التنبيه الخاصة بهبة */}
      <HabaNotificationDialog />
      
      {/* نافذة التنبيه الخاصة ببدوي */}
      <WorkshopNotificationDialog />
    </div>
  );
}
