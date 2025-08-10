import { useState, useEffect } from "react";
import { Clock, Users, UserCheck, Watch, ListTodo, Archive, LogOut, Package2, Car } from "lucide-react";
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
import PartsRequestForm from "@/components/PartsRequestForm";
import PartsRequestsList from "@/components/PartsRequestsList";
import RequestsList from "@/components/RequestsList";
import PrepareDelivery from "@/components/PrepareDelivery";
import HabaNotificationDialog from "@/components/HabaNotificationDialog";
import WorkshopNotificationDialog from "@/components/WorkshopNotificationDialog";

import CarStatusDisplay from "@/components/CarStatusDisplay";
import CarPositionsView from "@/components/CarPositionsView";

import Reception from "@/pages/Reception";
import Workshop from "@/pages/Workshop";
import { useNotifications } from "@/hooks/useNotifications";

type TabType = "dashboard" | "timers" | "history" | "archive" | "addworker" | "customercard" | "parts-requests" | "requests" | "car-status" | "car-positions" | "car-receipts" | "reception" | "workshop";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isConnected } = useWebSocket();
  const { user, logoutMutation } = useAuth();
  const { canRead, canWrite, canCreate, isFinance, isOperator, isViewer, isSupervisor } = usePermissions();
  const { newRequestsCount } = useNotifications();

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
              <ActiveTimers tasks={activeTasks || []} />
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

                {!isFinance && !isOperator && !isViewer && !isSupervisor && (
                  <Button
                    variant={activeTab === "addworker" ? "default" : "ghost"}
                    onClick={() => setActiveTab("addworker")}
                    className="font-medium"
                  >
                    <UserCheck className="ml-2 h-4 w-4" />
                    إضافة موظف
                  </Button>
                )}
                
                {canRead("customers") && (
                  <Button
                    variant={activeTab === "customercard" ? "default" : "ghost"}
                    onClick={() => setActiveTab("customercard")}
                    className="font-medium"
                  >
                    <Users className="ml-2 h-4 w-4" />
                    بطاقة زبون
                  </Button>
                )}

                {canRead("parts") && (
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

                {/* وضع السيارات - خاص بحساب بدوي */}
                {(user?.username === "بدوي" || isOperator) && (
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
                    onClick={() => setActiveTab("requests")}
                    className="font-medium relative"
                  >
                    <ListTodo className="ml-2 h-4 w-4" />
                    الطلبات
                    {newRequestsCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {newRequestsCount}
                      </span>
                    )}
                  </Button>
                )}
              </>
            )}

{/* تم إزالة زر استلام السيارة للتبسيط */}

            {/* الاستقبال - خاص بمستخدمي الاستقبال والورشة */}
            {(user?.role === "reception" || user?.username === "الاستقبال") && (
              <Button
                variant={activeTab === "reception" ? "default" : "ghost"}
                onClick={() => setActiveTab("reception")}
                className="font-medium"
              >
                <Car className="ml-2 h-4 w-4" />
                الاستقبال
              </Button>
            )}

            {/* الورشة - خاص بمستخدمي الورشة */}
            {(user?.role === "workshop" || user?.username === "بدوي") && (
              <Button
                variant={activeTab === "workshop" ? "default" : "ghost"}
                onClick={() => setActiveTab("workshop")}
                className="font-medium"
              >
                <Watch className="ml-2 h-4 w-4" />
                الورشة
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
