import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertTaskSchema, type InsertTask } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const taskFormSchema = z.object({
  workerId: z.string().min(1, "يجب اختيار المهندس"),
  workerRole: z.string().default("assistant"),
  description: z.string().min(1, "يجب إدخال وصف المهمة"),
  carBrand: z.string().min(1, "يجب اختيار نوع السيارة"),
  carModel: z.string().min(1, "يجب إدخال موديل السيارة"),
  licensePlate: z.string().min(1, "يجب إدخال رقم اللوحة"),
  estimatedDuration: z.number().nullable().optional(),
  engineerName: z.string().optional(),
  supervisorName: z.string().optional(),
  assistantName: z.string().min(1, "يجب اختيار المساعد"),
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
      workerId: "",
      workerRole: "assistant",
      estimatedDuration: null,
      engineerName: "",
      supervisorName: "",
      assistantName: "",
    },
  });

  const { data: workerNames = [], isLoading: isLoadingWorkers } = useQuery({
    queryKey: ['/api/workers/names'],
    queryFn: async () => {
      const response = await fetch('/api/workers/names');
      if (!response.ok) throw new Error('Failed to fetch worker names');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const taskData = {
        description: data.description,
        carBrand: data.carBrand,
        carModel: data.carModel,
        licensePlate: data.licensePlate,
        workerId: parseInt(data.workerId),
        workerRole: data.workerRole || "assistant",
        estimatedDuration: data.estimatedDuration || null,
        engineerName: data.engineerName || null,
        supervisorName: data.supervisorName || null,
        assistantName: data.assistantName || null,
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
    
    // Validate required fields manually
    if (!data.assistantName || data.assistantName.trim() === "") {
      toast({
        title: "خطأ في البيانات",
        description: "يجب اختيار المساعد",
        variant: "destructive",
      });
      return;
    }
    
    createTaskMutation.mutate(data);
  };

  const getAvailableWorkers = (excludeRoles: string[] = []) => {
    return workerNames.filter((name: string) => {
      if (name === "عامل جديد") return false;
      const currentValues = form.getValues();
      return !excludeRoles.some(role => currentValues[role as keyof TaskFormData] === name);
    });
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
                  name="workerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المهندس</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          const selectedIndex = parseInt(value) - 26;
                          const selectedName = workerNames[selectedIndex] || "";
                          setSelectedWorkers(prev => ({ ...prev, engineer: selectedName }));
                        }} 
                        value={field.value || ""}
                        disabled={isLoadingWorkers}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المهندس" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAvailableWorkers(['supervisorName', 'engineerName', 'assistantName']).map((name: string, index: number) => {
                            const realIndex = workerNames.indexOf(name);
                            return (
                              <SelectItem key={index} value={(realIndex + 26).toString()}>
                                {name}
                              </SelectItem>
                            );
                          })}
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
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedWorkers(prev => ({ ...prev, supervisor: value }));
                        }} 
                        value={field.value || ""}
                        disabled={isLoadingWorkers}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المشرف" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAvailableWorkers(['workerId', 'engineerName', 'assistantName']).map((name: string, index: number) => (
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
                  name="engineerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفني</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedWorkers(prev => ({ ...prev, technician: value }));
                        }} 
                        value={field.value || ""}
                        disabled={isLoadingWorkers}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الفني" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAvailableWorkers(['workerId', 'supervisorName', 'assistantName']).map((name: string, index: number) => (
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
                      <FormLabel>المساعد</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("workerRole", "assistant");
                          setSelectedWorkers(prev => ({ ...prev, assistant: value }));
                        }} 
                        value={field.value || ""}
                        disabled={isLoadingWorkers}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المساعد" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAvailableWorkers(['workerId', 'supervisorName', 'engineerName']).map((name: string, index: number) => (
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
              <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-inner">
                <div className="flex items-center mb-4">
                  <Users className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-gray-800">الفريق المختار للمهمة</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="glass-effect rounded-lg p-3 border border-white/50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-600">المهندس</span>
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div className="mt-2 p-2 bg-white/60 rounded-md border">
                      <span className="text-gray-800 font-medium">
                        {(() => {
                          const workerId = form.watch("workerId");
                          if (!workerId || !Array.isArray(workerNames)) return "غير محدد";
                          const index = parseInt(workerId) - 26;
                          return workerNames[index] || "غير محدد";
                        })()}
                      </span>
                    </div>
                  </div>
                  <div className="glass-effect rounded-lg p-3 border border-white/50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-green-600">المشرف</span>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <div className="mt-2 p-2 bg-white/60 rounded-md border">
                      <span className="text-gray-800 font-medium">
                        {form.watch("supervisorName") || "غير محدد"}
                      </span>
                    </div>
                  </div>
                  <div className="glass-effect rounded-lg p-3 border border-white/50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-orange-600">الفني</span>
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    </div>
                    <div className="mt-2 p-2 bg-white/60 rounded-md border">
                      <span className="text-gray-800 font-medium">
                        {form.watch("engineerName") || "غير محدد"}
                      </span>
                    </div>
                  </div>
                  <div className="glass-effect rounded-lg p-3 border border-white/50">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-purple-600">المساعد</span>
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    </div>
                    <div className="mt-2 p-2 bg-white/60 rounded-md border">
                      <span className="text-gray-800 font-medium">
                        {form.watch("assistantName") || "غير محدد"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 space-x-reverse">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTaskMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {createTaskMutation.isPending ? "جاري الإنشاء..." : "إنشاء وبدء المهمة"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}