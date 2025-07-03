import { useState, useEffect } from "react";
import { Clock, Users, UserCheck, Watch, ListTodo, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import logoImage from "@assets/Empty Logo with brands_1750921899348.png";
import { formatTime, formatDate } from "@/lib/utils";
import ActiveTimers from "@/components/ActiveTimers";
import SimpleTaskForm from "@/components/SimpleTaskForm";
import TaskHistoryTable from "@/components/TaskHistoryTable";
import ArchiveView from "@/components/ArchiveView";
import AddWorkerForm from "@/components/AddWorkerForm";
import PausedTasksList from "@/components/PausedTasksList";

type TabType = "dashboard" | "timers" | "history" | "archive" | "addworker";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isConnected } = useWebSocket();


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
                        {(stats as any)?.totalWorkers || 0}
                      </p>
                      {workers && Array.isArray(workers) && workers.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">الأسماء:</p>
                          <p className="text-xs text-gray-600">
                            {(workers as any[]).map((w: any) => w.name).join('، ')}
                          </p>
                        </div>
                      ) as any}
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
                        {(stats as any)?.availableWorkers || 0}
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
                        {(stats as any)?.busyWorkers || 0}
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
                        {(stats as any)?.activeTasks || 0}
                      </p>
                    </div>
                    <ListTodo className="h-8 w-8 warning opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>



            {/* Active Timers */}
            <div className="mt-8 space-y-4">
              <ActiveTimers tasks={(activeTasks as any[]) || []} />
              <PausedTasksList tasks={(activeTasks as any[]) || []} />
            </div>
          </div>
        );
      
      case "timers":
        return (
          <div className="space-y-6">
            <SimpleTaskForm />
            <ActiveTimers tasks={(activeTasks as any[]) || []} showControls />
            <PausedTasksList tasks={(activeTasks as any[]) || []} />
          </div>
        );
      

      
      case "history":
        return <TaskHistoryTable />;
      
      case "archive":
        return <ArchiveView />;
      
      case "addworker":
        return <AddWorkerForm />;
      
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
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Navigation */}
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

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
