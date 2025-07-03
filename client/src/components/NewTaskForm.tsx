import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, Play } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertTaskSchema, type InsertTask } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const taskFormSchema = z.object({
  workerRole: z.string().default("assistant"),
  description: z.string().min(1, "يجب إدخال وصف المهمة"),
  carBrand: z.string().min(1, "يجب اختيار نوع السيارة"),
  carModel: z.string().min(1, "يجب إدخال موديل السيارة"),
  licensePlate: z.string().min(1, "يجب إدخال رقم اللوحة"),
  estimatedDuration: z.number().nullable().optional(),
  engineerName: z.string().optional(),
  supervisorName: z.string().optional(),
  technicianName: z.string().optional(),
  assistantName: z.string().min(1, "يجب اختيار المساعد"),
  repairOperation: z.string().optional(),
  taskType: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

const carBrands = [
  { value: "audi", label: "أودي" },
  { value: "seat", label: "سيات" },
  { value: "skoda", label: "سكودا" },
  { value: "volkswagen", label: "فولكس فاجن" },
];

export default function NewTaskForm() {
  const [open, setOpen] = useState(false);
  const [selectedWorkers, setSelectedWorkers] = useState({
    engineer: "",
    supervisor: "", 
    technician: "",
    assistant: ""
  });
  const { toast } = useToast();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      description: "",
      carBrand: "audi",
      carModel: "",
      licensePlate: "",
      workerRole: "assistant",
      estimatedDuration: null,
      engineerName: "",
      supervisorName: "",
      technicianName: "",
      assistantName: "",
      repairOperation: "",
      taskType: "",
    },
  });

  const { data: workers } = useQuery({
    queryKey: ['/api/workers'],
    queryFn: async () => {
      const response = await fetch('/api/workers');
      return response.json();
    },
  });

  const workerNames = workers?.map((w: any) => w.name) || [];

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      // Find the worker ID from the assistant name
      const assistantWorker = workers?.find((w: any) => w.name === data.assistantName);
      
      const taskData = {
        description: data.description,
        carBrand: data.carBrand,
        carModel: data.carModel,
        licensePlate: data.licensePlate,
        workerId: assistantWorker?.id || 1, // Fallback to first worker if not found
        workerRole: data.workerRole || "assistant",
        estimatedDuration: data.estimatedDuration || null,
        engineerName: data.engineerName === "none" ? null : data.engineerName || null,
        supervisorName: data.supervisorName === "none" ? null : data.supervisorName || null,
        technicianName: data.technicianName === "none" ? null : data.technicianName || null,
        assistantName: data.assistantName === "none" ? null : data.assistantName || null,
        repairOperation: data.repairOperation || null,
        taskType: data.taskType || null,
      };
      
      console.log("Sending task data:", taskData);
      
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setSelectedWorkers({ engineer: "", supervisor: "", technician: "", assistant: "" });
      form.reset();
      setOpen(false);
      toast({
        title: "تم إنشاء المهمة بنجاح",
        description: "تم بدء المهمة وتشغيل العداد",
      });
    },
    onError: (error: any) => {
      console.error("Task creation error:", error);
      const errorMessage = error?.message || "حدث خطأ غير متوقع";
      toast({
        title: "خطأ في إنشاء المهمة", 
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    console.log("Form data:", data);
    console.log("Selected workers state:", selectedWorkers);
    
    // جميع حقول العمال اختيارية الآن
    
    createTaskMutation.mutate(data);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
      >
        <PlusCircle className="ml-2 h-4 w-4" />
        إنشاء مهمة جديدة
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إنشاء مهمة جديدة</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وصف المهمة</FormLabel>
                      <FormControl>
                        <Input placeholder="أدخل وصف المهمة" {...field} />
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
                        <Input placeholder="تفاصيل عملية الإصلاح" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Input placeholder="مثال: A4 2024" {...field} />
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
                        <Input placeholder="أدخل رقم اللوحة" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوقت المقدر (دقيقة)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="60"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="engineerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المهندس (اختياري)</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        const selectedValue = value === "none" ? "" : value;
                        setSelectedWorkers(prev => ({ ...prev, engineer: selectedValue }));
                      }} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المهندس (اختياري)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">بدون مهندس</SelectItem>
                          {workerNames?.filter((name: string) => 
                            name !== "عامل جديد"
                          ).map((name: string, index: number) => (
                            <SelectItem key={index} value={name}>
                              {name}
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
                      <FormLabel>المشرف (اختياري)</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        const selectedValue = value === "none" ? "" : value;
                        console.log("Selected supervisor:", selectedValue);
                        setSelectedWorkers(prev => ({ ...prev, supervisor: selectedValue }));
                      }} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المشرف (اختياري)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">بدون مشرف</SelectItem>
                          {workerNames?.filter((name: string) => 
                            name !== "عامل جديد"
                          ).map((name: string, index: number) => (
                            <SelectItem key={index} value={name}>
                              {name}
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
                  name="technicianName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفني (اختياري)</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        const selectedValue = value === "none" ? "" : value;
                        console.log("Selected technician:", selectedValue);
                        setSelectedWorkers(prev => ({ ...prev, technician: selectedValue }));
                      }} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الفني (اختياري)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">بدون فني</SelectItem>
                          {workerNames?.filter((name: string) => 
                            name !== "عامل جديد"
                          ).map((name: string, index: number) => (
                            <SelectItem key={index} value={name}>
                              {name}
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
                      <FormLabel>المساعد (اختياري)</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        const selectedValue = value === "none" ? "" : value;
                        if (selectedValue) {
                          form.setValue("workerRole", "assistant");
                        }
                        console.log("Selected assistant:", selectedValue);
                        setSelectedWorkers(prev => ({ ...prev, assistant: selectedValue }));
                      }} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المساعد (اختياري)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">بدون مساعد</SelectItem>
                          {workerNames?.filter((name: string) => 
                            name !== "عامل جديد"
                          ).map((name: string, index: number) => (
                            <SelectItem key={index} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* عرض الأشخاص المختارين */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium mb-3 text-gray-800">الفريق المختار للمهمة:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-white rounded border">
                    <span className="font-medium text-blue-600 w-20">المهندس:</span>
                    <span className="text-gray-800 bg-yellow-100 px-2 py-1 rounded">
                      {form.watch("engineerName") || "غير محدد"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded border">
                    <span className="font-medium text-green-600 w-20">المشرف:</span>
                    <span className="text-gray-800 bg-yellow-100 px-2 py-1 rounded">
                      {form.watch("supervisorName") || "غير محدد"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded border">
                    <span className="font-medium text-orange-600 w-20">الفني:</span>
                    <span className="text-gray-800 bg-yellow-100 px-2 py-1 rounded">
                      {selectedWorkers.technician || "غير محدد"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded border">
                    <span className="font-medium text-purple-600 w-20">المساعد:</span>
                    <span className="text-gray-800 bg-yellow-100 px-2 py-1 rounded">
                      {form.watch("assistantName") || "غير محدد"}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  ملاحظة: لا يمكن اختيار نفس الشخص في أكثر من دور
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={createTaskMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <Play className="ml-2 h-4 w-4" />
                  {createTaskMutation.isPending ? "جاري الإنشاء..." : "إنشاء وبدء المهمة"}
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
    </>
  );
}