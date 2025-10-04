import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pause } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const pauseFormSchema = z.object({
  reason: z.string().min(1, "يجب اختيار سبب الإيقاف"),
  notes: z.string().optional(),
});

type PauseFormData = z.infer<typeof pauseFormSchema>;

const pauseReasons = [
  { value: "break", label: "استراحة" },
  { value: "waiting_parts", label: "انتظار قطع غيار" },
  { value: "waiting_customer", label: "انتظار العميل" },
  { value: "technical_issue", label: "مشكلة فنية" },
  { value: "urgent_task", label: "مهمة عاجلة أخرى" },
  { value: "other", label: "أخرى" },
];

interface PauseTaskDialogProps {
  taskId: number;
  disabled?: boolean;
}

export default function PauseTaskDialog({ taskId, disabled }: PauseTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<PauseFormData>({
    resolver: zodResolver(pauseFormSchema),
    defaultValues: {
      reason: "",
      notes: "",
    },
  });

  const pauseTaskMutation = useMutation({
    mutationFn: async (data: PauseFormData) => {
      const response = await apiRequest("POST", `/api/tasks/${taskId}/pause`, {
        reason: data.reason,
        notes: data.notes,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      setIsOpen(false);
      form.reset();
      toast({
        title: "تم إيقاف المهمة مؤقتاً",
        description: "تم حفظ سبب الإيقاف وإيقاف المؤقت",
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

  const onSubmit = (data: PauseFormData) => {
    pauseTaskMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
        >
          <Pause className="h-4 w-4 ml-1" />
          إيقاف مؤقت
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Pause className="ml-2 h-5 w-5" />
            سبب الإيقاف المؤقت
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب الإيقاف</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر سبب الإيقاف" />
                      </SelectTrigger>
                      <SelectContent>
                        {pauseReasons.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أدخل أي ملاحظات إضافية..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={pauseTaskMutation.isPending}
                className="flex-1"
              >
                {pauseTaskMutation.isPending ? "جاري الإيقاف..." : "تأكيد الإيقاف"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}