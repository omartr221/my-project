import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatTime, getCarBrandInArabic } from "@/lib/utils";
import { type TaskWithWorker } from "@shared/schema";

interface PausedTasksListProps {
  tasks: TaskWithWorker[];
}

const pauseReasonLabels: Record<string, string> = {
  break: "استراحة",
  waiting_parts: "انتظار قطع غيار",
  waiting_customer: "انتظار العميل",
  technical_issue: "مشكلة فنية",
  urgent_task: "مهمة عاجلة أخرى",
  other: "أخرى",
};

export default function PausedTasksList({ tasks }: PausedTasksListProps) {
  const { toast } = useToast();

  const resumeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/resume`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/history'] });
      toast({
        title: "تم استئناف المهمة",
        description: "تم بدء المؤقت مرة أخرى",
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

  const pausedTasks = tasks.filter(task => task.status === "paused");

  if (pausedTasks.length === 0) {
    return null;
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center text-yellow-800">
          <AlertCircle className="ml-2 h-5 w-5" />
          المهام المعلقة ({pausedTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pausedTasks.map((task) => (
            <div
              key={task.id}
              className="p-3 border border-yellow-300 rounded-lg bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{(task as any).engineerName || task.worker.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {getCarBrandInArabic(task.carBrand)}
                    </Badge>
                  </div>
                  
                  {/* عرض أعضاء الفريق */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(task as any).supervisorName && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        مشرف: {(task as any).supervisorName}
                      </Badge>
                    )}
                    {(task as any).technicians && Array.isArray((task as any).technicians) && (task as any).technicians.length > 0 && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        فنيون: {(task as any).technicians.join(', ')}
                      </Badge>
                    )}
                    {(task as any).assistants && Array.isArray((task as any).assistants) && (task as any).assistants.length > 0 && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                        مساعدون: {(task as any).assistants.join(', ')}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-1">
                    {task.description}
                  </p>
                  
                  <p className="text-xs text-gray-500 mb-2">
                    {task.carModel} - {task.licensePlate}
                  </p>
                  
                  {task.pauseReason && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-yellow-700 font-medium">
                        سبب الإيقاف:
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {pauseReasonLabels[task.pauseReason] || task.pauseReason}
                      </Badge>
                    </div>
                  )}
                  
                  {task.pauseNotes && (
                    <p className="text-xs text-gray-600 italic">
                      "{task.pauseNotes}"
                    </p>
                  )}
                  
                  {task.pausedAt && (
                    <div className="text-xs text-gray-500 mt-1">
                      <p>تم الإيقاف في: {formatTime(new Date(task.pausedAt))}</p>
                      <p className="text-orange-600 font-medium">
                        ⏸️ المؤقت متوقف - اضغط "بدء المهمة" للاستمرار
                      </p>
                    </div>
                  )}
                </div>
                
                <Button
                  size="sm"
                  onClick={() => resumeTaskMutation.mutate(task.id)}
                  disabled={resumeTaskMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="h-4 w-4 ml-1" />
                  بدء المهمة
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}