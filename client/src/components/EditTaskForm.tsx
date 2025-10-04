import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertTaskSchema, type TaskWithWorker } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const editTaskFormSchema = insertTaskSchema.extend({
  workerId: z.string().min(1, "يجب اختيار العامل"),
  workerRole: z.string().min(1, "يجب اختيار صفة العامل"),
  description: z.string().min(1, "يجب إدخال وصف المهمة"),
  carBrand: z.string().min(1, "يجب اختيار نوع السيارة"),
  carModel: z.string().min(1, "يجب إدخال موديل السيارة"),
  licensePlate: z.string().min(1, "يجب إدخال رقم اللوحة"),
  estimatedDuration: z.number().optional(),
}).omit({
  id: true,
  status: true,
  startTime: true,
  endTime: true,
  pausedAt: true,
  totalPausedDuration: true,
  isArchived: true,
  archivedAt: true,
  archivedBy: true,
  archiveNotes: true,
  createdAt: true,
});

type EditTaskFormData = z.infer<typeof editTaskFormSchema>;

const carBrands = [
  { value: "audi", label: "أودي" },
  { value: "seat", label: "سيات" },
  { value: "skoda", label: "سكودا" },
  { value: "volkswagen", label: "فولكس فاجن" },
];

const workerRoles = [
  { value: "assistant", label: "مساعد" },
  { value: "technician", label: "فني" },
  { value: "supervisor", label: "مشرف" },
  { value: "engineer", label: "مهندس" },
];

interface EditTaskFormProps {
  task: TaskWithWorker;
}

export default function EditTaskForm({ task }: EditTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const { data: workers } = useQuery({
    queryKey: ['/api/workers'],
  });

  const { data: workerNames } = useQuery({
    queryKey: ['/api/workers/names'],
  });

  const form = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskFormSchema),
    defaultValues: {
      workerId: task.workerId.toString(),
      workerRole: task.workerRole || "technician",
      description: task.description,
      carBrand: task.carBrand,
      carModel: task.carModel,
      licensePlate: task.licensePlate,
      estimatedDuration: task.estimatedDuration || 60,
      repairOperation: (task as any).repairOperation || "",
      taskType: (task as any).taskType || "",
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: EditTaskFormData) => {
      let workerId = data.workerId;
      
      // Check if we need to create a new worker
      if (typeof workerId === 'string' && workerId.startsWith('create-')) {
        const workerName = workerId.replace('create-', '');
        
        try {
          const response = await apiRequest("POST", "/api/workers", {
            name: workerName,
            category: "technician",
            supervisor: "",
            assistant: "",
            engineer: "",
            nationalId: "",
            phoneNumber: "",
            address: "",
            isActive: true
          });
          
          const newWorker = await response.json();
          workerId = newWorker.id.toString();
          
          queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
          queryClient.invalidateQueries({ queryKey: ['/api/workers/names'] });
        } catch (error) {
          throw new Error("فشل في إنشاء العامل الجديد");
        }
      }

      const response = await apiRequest("PATCH", `/api/tasks/${task.id}`, {
        ...data,
        workerId: parseInt(workerId.toString())
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      setIsOpen(false);
      toast({
        title: "تم تحديث المهمة بنجاح",
        description: "تم حفظ التغييرات على المهمة",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث المهمة",
        description: error.message || "حاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditTaskFormData) => {
    updateTaskMutation.mutate(data);
  };

  // Get all workers
  const allWorkers = workers || [];
  
  // Use worker names from API, fallback to predefined if needed
  const availableWorkerNames = workerNames?.filter(name => name !== "عامل جديد") || 
    ["غدير", "يحيى", "زياد", "سليمان", "علي", "حسن"];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 ml-1" />
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Edit className="ml-2 h-5 w-5" />
            تعديل المهمة
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="workerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العامل</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر العامل" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableWorkerNames.map((workerName, index) => {
                            const existingWorker = allWorkers.find(w => w.name === workerName);
                            if (existingWorker) {
                              return (
                                <SelectItem key={`existing-${existingWorker.id}`} value={existingWorker.id.toString()}>
                                  {existingWorker.name}
                                </SelectItem>
                              );
                            } else {
                              return (
                                <SelectItem key={`new-${workerName}-${index}`} value={`create-${workerName}`}>
                                  {workerName} (جديد)
                                </SelectItem>
                              );
                            }
                          })}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workerRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>صفة العامل</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر صفة العامل" />
                        </SelectTrigger>
                        <SelectContent>
                          {workerRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
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
                name="carBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع السيارة</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع السيارة" />
                        </SelectTrigger>
                        <SelectContent>
                          {carBrands.map((brand) => (
                            <SelectItem key={brand.value} value={brand.value}>
                              {brand.label}
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
                name="carModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>موديل السيارة</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="مثال: A4 2020" 
                        {...field} 
                      />
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
                      <Input 
                        placeholder="مثال: أ ب ج 1234" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف المهمة</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="مثال: صيانة دورية - تغيير زيت" 
                        {...field} 
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
                    <FormLabel>عملية الإصلاح (اختياري)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="تفاصيل عملية الإصلاح" 
                        {...field} 
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
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوقت المقدر (بالدقائق)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={updateTaskMutation.isPending}
                className="flex-1"
              >
                <Save className="ml-2 h-4 w-4" />
                {updateTaskMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                <X className="ml-2 h-4 w-4" />
                إلغاء
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}