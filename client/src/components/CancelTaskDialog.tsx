import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { TaskWithWorker } from "@/../../shared/schema";

interface CancelTaskDialogProps {
  task: TaskWithWorker;
  disabled?: boolean;
}

export default function CancelTaskDialog({ task, disabled }: CancelTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [cancelledBy, setCancelledBy] = useState("");
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: async (data: { cancelledBy: string; reason: string }) => {
      return apiRequest("POST", `/api/tasks/${task.id}/cancel`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/archive"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      setOpen(false);
      setCancelledBy("");
      setReason("");
      toast({
        title: "تم إلغاء المهمة",
        description: "تم إلغاء المهمة وحفظها في الأرشيف بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: `فشل في إلغاء المهمة: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCancel = () => {
    if (!cancelledBy.trim() || !reason.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    cancelMutation.mutate({
      cancelledBy: cancelledBy.trim(),
      reason: reason.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={disabled || cancelMutation.isPending}
          className="h-8 px-2"
        >
          <X className="h-4 w-4" />
          إلغاء
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            إلغاء المهمة {task.taskNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              ⚠️ تحذير: سيتم إلغاء هذه المهمة نهائياً وحفظها في الأرشيف كمهمة ملغاة.
              هذا الإجراء لا يمكن التراجع عنه.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancelledBy">المُلغِي</Label>
            <Input
              id="cancelledBy"
              placeholder="اسم الشخص الذي قام بالإلغاء"
              value={cancelledBy}
              onChange={(e) => setCancelledBy(e.target.value)}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">سبب الإلغاء</Label>
            <Textarea
              id="reason"
              placeholder="اذكر سبب إلغاء المهمة..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-right min-h-[80px]"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelMutation.isPending || !cancelledBy.trim() || !reason.trim()}
            className="flex-1"
          >
            {cancelMutation.isPending ? "جار الإلغاء..." : "إلغاء المهمة"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={cancelMutation.isPending}
            className="flex-1"
          >
            تراجع
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}