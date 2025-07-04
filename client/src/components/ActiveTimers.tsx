import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Pause, Play, CheckCircle, User, UserCheck, Wrench, Edit } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDuration, formatTime, getCarBrandInArabic, getWorkerCategoryInArabic, getTaskStatusInArabic, getTaskStatusColor } from "@/lib/utils";
import { type TaskWithWorker } from "@shared/schema";
import { useState, useEffect } from "react";
import PauseTaskDialog from "./PauseTaskDialog";
import EditTaskDialog from "./EditTaskDialog";
import CancelTaskDialog from "./CancelTaskDialog";

interface ActiveTimersProps {
  tasks: TaskWithWorker[];
  showControls?: boolean;
}

export default function ActiveTimers({ 
  tasks, 
  showControls = false 
}: ActiveTimersProps) {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update timer with more precision (every 100ms for smoother updates)
  useEffect(() => {
    // Update immediately on mount
    setCurrentTime(Date.now());
    
    // Then update every 100ms for more accurate timing
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const pauseTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/pause`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "تم إيقاف المهمة",
        description: "تم إيقاف المهمة مؤقتاً",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في إيقاف المهمة",
        description: "حاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const resumeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/resume`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "تم استئناف المهمة",
        description: "تم استئناف المهمة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في استئناف المهمة",
        description: "حاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const finishTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/finish`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/history'] });
      toast({
        title: "تم إنهاء المهمة",
        description: "تم إنهاء المهمة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في إنهاء المهمة",
        description: "حاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const calculateCurrentDuration = (task: TaskWithWorker) => {
    if (!task.startTime) return 0;
    
    // If task is paused, return the duration at the time it was paused (frozen)
    if (task.status === "paused") {
      return task.currentDuration || 0;
    }
    
    // For active tasks, calculate from start time minus any paused time
    // Use manual start time if available for manual timers
    const effectiveStartTime = (task as any).manualStartTime ? 
      new Date((task as any).manualStartTime).getTime() : 
      new Date(task.startTime).getTime();
    
    // Use precise millisecond calculation and convert to seconds
    const totalElapsedMs = currentTime - effectiveStartTime;
    const totalElapsed = totalElapsedMs / 1000;
    const pausedTime = task.totalPausedDuration || 0;
    
    // Return exact duration without rounding for display accuracy
    return Math.max(0, totalElapsed - pausedTime);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="ml-2 h-5 w-5" />
          المؤقتات النشطة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد مهام نشطة حالياً
            </div>
          ) : (
            tasks.map((task) => {
              const currentDuration = calculateCurrentDuration(task);
              const isActive = task.status === 'active';
              
              return (
                <div
                  key={task.id}
                  className={`p-4 border rounded-lg ${
                    isActive ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-medium">
                        {((task as any).engineerName && (task as any).engineerName !== '') ? (task as any).engineerName : 
                         ((task as any).supervisorName && (task as any).supervisorName !== '') ? (task as any).supervisorName : 
                         ((task as any).technicianName && (task as any).technicianName !== '') ? (task as any).technicianName : 
                         ((task as any).assistantName && (task as any).assistantName !== '') ? (task as any).assistantName : 
                         task.worker.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {task.description} - {getCarBrandInArabic(task.carBrand)}
                      </p>
                      {(task as any).repairOperation && (
                        <p className="text-xs text-gray-500">
                          عملية الإصلاح: {(task as any).repairOperation}
                        </p>
                      )}
                      {(task as any).taskType && (
                        <p className="text-xs text-gray-500">
                          نوع المهمة: {(task as any).taskType}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {task.carModel} - {task.licensePlate}
                      </p>
                      <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2">
                        {(task as any).engineerName && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            مهندس: {(task as any).engineerName}
                          </span>
                        )}
                        {(task as any).supervisorName && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                            مشرف: {(task as any).supervisorName}
                          </span>
                        )}
                        {(task as any).technicians && (task as any).technicians.length > 0 && (
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            فنيون: {(task as any).technicians.join(", ")}
                          </span>
                        )}
                        {(task as any).assistants && (task as any).assistants.length > 0 && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            مساعدون: {(task as any).assistants.join(", ")}
                          </span>
                        )}
                        {(task as any).technicianName && (task as any).technicianName !== '' && (
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            فني: {(task as any).technicianName}
                          </span>
                        )}
                        {(task as any).assistantName && (task as any).assistantName !== '' && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            مساعد: {(task as any).assistantName}
                          </span>
                        )}
                      </div>

                    </div>
                    <div className="text-left">
                      <p className={`timer-display ${isActive ? 'error' : 'warning'}`}>
                        {formatDuration(currentDuration)}
                      </p>
                      <p className="text-xs text-gray-500">
                        بدء في {task.startTime ? formatTime(new Date(task.startTime)) : '--'}
                      </p>
                    </div>
                  </div>
                  
                  {showControls && (
                    <div className="flex space-x-reverse space-x-2">
                      {isActive ? (
                        <PauseTaskDialog 
                          taskId={task.id} 
                          disabled={pauseTaskMutation.isPending}
                        />
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resumeTaskMutation.mutate(task.id)}
                          disabled={resumeTaskMutation.isPending}
                          className="success-bg"
                        >
                          <Play className="ml-1 h-3 w-3" />
                          استئناف
                        </Button>
                      )}
                      
                      <EditTaskDialog 
                        task={task} 
                        disabled={pauseTaskMutation.isPending || resumeTaskMutation.isPending || finishTaskMutation.isPending}
                      />
                      
                      <CancelTaskDialog 
                        task={task} 
                        disabled={pauseTaskMutation.isPending || resumeTaskMutation.isPending || finishTaskMutation.isPending}
                      />
                      
                      <Button
                        size="sm"
                        onClick={() => finishTaskMutation.mutate(task.id)}
                        disabled={finishTaskMutation.isPending}
                        className="success-bg"
                      >
                        <CheckCircle className="ml-1 h-3 w-3" />
                        إنهاء
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
