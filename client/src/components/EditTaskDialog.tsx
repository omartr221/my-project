import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TaskWithWorker } from "@shared/schema";
import { Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCarBrandInArabic } from "@/lib/utils";

const editTaskSchema = z.object({
  description: z.string().min(1, "يجب إدخال وصف المهمة"),
  repairOperation: z.string().optional(),
  taskType: z.string().optional(),
  carBrand: z.string().min(1, "يجب اختيار نوع السيارة"),
  carModel: z.string().min(1, "يجب إدخال موديل السيارة"),
  licensePlate: z.string().min(1, "يجب إدخال رقم اللوحة"),
  estimatedDuration: z.number().min(1, "يجب أن يكون الوقت المقدر أكبر من صفر"),
  engineerName: z.string().optional(),
  supervisorName: z.string().optional(),
  technicianName: z.string().optional(),
  assistantName: z.string().optional(),
});

type EditTaskFormData = z.infer<typeof editTaskSchema>;

interface EditTaskDialogProps {
  task: TaskWithWorker;
  disabled?: boolean;
}

export default function EditTaskDialog({ task, disabled }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workers } = useQuery({
    queryKey: ['/api/workers'],
    queryFn: async () => {
      const response = await fetch('/api/workers');
      return response.json();
    },
  });

  const carBrands = [
    { value: "audi", label: "أودي" },
    { value: "seat", label: "سيات" },
    { value: "skoda", label: "سكودا" },
    { value: "volkswagen", label: "فولكسواجن" },
  ];

  const form = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      description: task.description,
      repairOperation: (task as any).repairOperation || "",
      taskType: (task as any).taskType || "",
      carBrand: task.carBrand,
      carModel: task.carModel,
      licensePlate: task.licensePlate,
      estimatedDuration: task.estimatedDuration || 60,
      engineerName: (task as any).engineerName || "",
      supervisorName: (task as any).supervisorName || "",
      technicianName: (task as any).technicianName || "",
      assistantName: (task as any).assistantName || "",
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: EditTaskFormData) => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "فشل في تعديل المهمة");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم التعديل بنجاح",
        description: "تم تعديل المهمة وحفظ البيانات",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التعديل",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditTaskFormData) => {
    updateTaskMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={disabled}
          className="gap-2"
        >
          <Edit className="h-4 w-4" />
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل المهمة {task.taskNumber}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف المهمة</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="وصف المهمة..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="repairOperation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عملية الإصلاح</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="تفاصيل عملية الإصلاح..."
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taskType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع المهمة</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع المهمة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ميكانيك">ميكانيك</SelectItem>
                      <SelectItem value="كهربا">كهربا</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="carBrand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع السيارة</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع السيارة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {carBrands.map((brand) => (
                        <SelectItem key={brand.value} value={brand.value}>
                          {brand.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="carModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>موديل السيارة</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="A4, Golf, Octavia..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم اللوحة</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="مثال: أ ب ج 1234" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="engineerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المهندس</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المهندس" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">بدون اختيار</SelectItem>
                        {workers?.map((worker: any) => (
                          <SelectItem key={worker.id} value={worker.name}>
                            {worker.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supervisorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المشرف</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المشرف" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">بدون اختيار</SelectItem>
                        {workers?.map((worker: any) => (
                          <SelectItem key={worker.id} value={worker.name}>
                            {worker.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="technicianName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفني</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفني" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">بدون اختيار</SelectItem>
                        {workers?.map((worker: any) => (
                          <SelectItem key={worker.id} value={worker.name}>
                            {worker.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assistantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المساعد</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المساعد" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">بدون اختيار</SelectItem>
                        {workers?.map((worker: any) => (
                          <SelectItem key={worker.id} value={worker.name}>
                            {worker.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estimatedDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوقت المقدر (بالدقائق)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || "")}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={updateTaskMutation.isPending}
                className="flex-1"
              >
                {updateTaskMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="flex-1"
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