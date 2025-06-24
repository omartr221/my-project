import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Pause, Play, CheckCircle, User, UserCheck, Wrench } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDuration, formatTime, getCarBrandInArabic, getWorkerCategoryInArabic, getTaskStatusInArabic, getTaskStatusColor } from "@/lib/utils";
import { type TaskWithWorker } from "@shared/schema";
import { useState, useEffect } from "react";

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

  // Update timer every second with Syria time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const syriaTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
      setCurrentTime(syriaTime.getTime());
    }, 1000);

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
    
    const startTime = new Date(task.startTime).getTime();
    const elapsed = Math.floor((currentTime - startTime) / 1000);
    const pausedDuration = task.totalPausedDuration || 0;
    
    return Math.max(0, elapsed - pausedDuration);
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
                      <p className="font-medium">{task.worker.name}</p>
                      <p className="text-sm text-gray-600">
                        {task.description} - {getCarBrandInArabic(task.carBrand)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {task.carModel} - {task.licensePlate}
                      </p>
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => pauseTaskMutation.mutate(task.id)}
                          disabled={pauseTaskMutation.isPending}
                          className="warning-bg"
                        >
                          <Pause className="ml-1 h-3 w-3" />
                          إيقاف
                        </Button>
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
