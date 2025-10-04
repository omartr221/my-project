import { useState, useEffect } from "react";
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
import { usePermissions } from "@/hooks/use-auth";
import { z } from "zod";

const taskFormSchema = z.object({
  workerRole: z.string().default("assistant"),
  description: z.string().min(1, "يجب إدخال وصف المهمة"),
  carBrand: z.string().min(1, "يجب اختيار نوع السيارة"),
  customCarBrand: z.string().optional(),
  carModel: z.string().min(1, "يجب إدخال موديل السيارة"),
  licensePlate: z.string().min(1, "يجب إدخال رقم اللوحة"),
  estimatedDuration: z.number().nullable().optional(),
  engineerName: z.string().optional(),
  supervisorName: z.string().optional(),
  technicianName: z.string().optional(),
  assistantName: z.string().optional(),
  supervisors: z.array(z.string()).default([]),
  technicians: z.array(z.string()).default([]),
  assistants: z.array(z.string()).default([]),
  repairOperation: z.string().optional(),
  taskType: z.string().optional(),
  invoiceType: z.string().optional(),
  color: z.string().optional(),
  timerType: z.string().default("automatic"),
  consumedTime: z.number().optional(),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

const carBrands = [
  { value: "audi", label: "أودي" },
  { value: "seat", label: "سيات" },
  { value: "skoda", label: "سكودا" },
  { value: "volkswagen", label: "فولكس فاجن" },
  { value: "other", label: "أخرى" },
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
  const { canWrite, isSupervisor } = usePermissions();

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
      supervisors: [],
      technicians: [],
      assistants: [],
      repairOperation: "",
      taskType: "",
      invoiceType: "",
      color: "",
      timerType: "automatic",
      consumedTime: undefined,
      dueDate: "",
    },
  });

  const { data: workers } = useQuery({
    queryKey: ['/api/workers'],
    queryFn: async () => {
      const response = await fetch('/api/workers', {
        credentials: 'include'
      });
      return response.json();
    },
  });

  const { data: customerCars } = useQuery({
    queryKey: ['/api/customer-cars'],
    queryFn: async () => {
      const response = await fetch('/api/customer-cars', {
        credentials: 'include'
      });
      return response.json();
    },
  });

  const workerNames = Array.isArray(workers) ? workers.map((w: any) => w.name) : [];

  // Function to fetch car data by license plate for autofill
  const fetchCarDataByLicensePlate = async (licensePlate: string) => {
    if (!licensePlate.trim()) return;
    
    try {
      // Find car by license plate (exact match or partial match)
      const carData = customerCars?.find((car: any) => 
        car.licensePlate.toLowerCase() === licensePlate.toLowerCase() ||
        car.licensePlate.toLowerCase().includes(licensePlate.toLowerCase())
      );
      
      if (carData) {
        console.log("Car data found:", carData); // Debug log
        
        // Autofill the form with found data
        form.setValue("carBrand", carData.carBrand.toLowerCase());
        form.setValue("carModel", carData.carModel);
        if (carData.color) {
          form.setValue("color", carData.color);
        }
        
        toast({
          title: "تم العثور على بيانات السيارة",
          description: `تم تعبئة: ${carData.carBrand} ${carData.carModel}${carData.color ? ' - ' + carData.color : ''}`,
        });
      }
    } catch (error) {
      console.error("Error fetching car data:", error);
    }
  };

  // Watch license plate changes for autofill
  const licensePlateValue = form.watch("licensePlate");
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (licensePlateValue && licensePlateValue.length >= 3) {
        fetchCarDataByLicensePlate(licensePlateValue);
      }
    }, 500); // Debounce for 500ms
    
    return () => clearTimeout(timeoutId);
  }, [licensePlateValue, customerCars]);

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      // Find the worker ID from the assistant name
      const assistantWorker = workers?.find((w: any) => w.name === data.assistantName);
      
      // Get first available worker as fallback
      const firstWorker = workers?.[0];
      const workerId = assistantWorker?.id || firstWorker?.id;
      
      if (!workerId) {
        throw new Error("لا يوجد عمال في النظام");
      }
      
      const taskData = {
        description: data.description,
        carBrand: data.carBrand === "other" ? data.customCarBrand : data.carBrand,
        carModel: data.carModel,
        licensePlate: data.licensePlate,
        workerId: workerId,
        workerRole: data.workerRole || "assistant",
        estimatedDuration: data.estimatedDuration || null,
        engineerName: data.engineerName === "none" ? null : data.engineerName || null,
        supervisorName: data.supervisorName === "none" ? null : data.supervisorName || null,
        technicianName: data.technicianName === "none" ? null : data.technicianName || null,
        assistantName: data.assistantName === "none" ? null : data.assistantName || null,
        supervisors: data.supervisors || [],
        technicians: data.technicians || [],
        assistants: data.assistants || [],
        repairOperation: data.repairOperation || null,
        taskType: data.taskType || null,
        color: data.color || null,
        timerType: data.timerType || "automatic",
        consumedTime: data.consumedTime || null,
        dueDate: data.dueDate || null,
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
    
    // إرسال البيانات مع القوائم المتعددة
    const taskData = {
      ...data,
      supervisors: data.supervisors || [],
      technicians: data.technicians || [],
      assistants: data.assistants || []
    };
    
    console.log("Sending task data:", taskData);
    
    createTaskMutation.mutate(taskData);
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
                          <SelectItem value="ميكانيك 1">ميكانيك 1</SelectItem>
                          <SelectItem value="ميكانيك 2">ميكانيك 2</SelectItem>
                          <SelectItem value="كهربا 1">كهربا 1</SelectItem>
                          <SelectItem value="كهربا 2">كهربا 2</SelectItem>
                          <SelectItem value="فحص وتشخيص">فحص وتشخيص</SelectItem>
                          <SelectItem value="فحص دوري">فحص دوري</SelectItem>
                          <SelectItem value="دوزان">دوزان</SelectItem>
                          <SelectItem value="طلب مخططات">طلب مخططات</SelectItem>
                          <SelectItem value="تجريب في الخارج">تجريب في الخارج</SelectItem>
                          <SelectItem value="اختبارات داخل الورشة">اختبارات داخل الورشة</SelectItem>
                          <SelectItem value="اختبار خارج الورشة">اختبار خارج الورشة</SelectItem>
                          <SelectItem value="تبديل زيت">تبديل زيت</SelectItem>
                          <SelectItem value="نعبئة غاز مكيف">نعبئة غاز مكيف</SelectItem>
                          <SelectItem value="غسيل محرك السيارة">غسيل محرك السيارة</SelectItem>
                          <SelectItem value="غسيل محرك">غسيل محرك</SelectItem>
                          <SelectItem value="خدمات خارجية">خدمات خارجية</SelectItem>
                          <SelectItem value="حدادة">حدادة</SelectItem>
                          <SelectItem value="برمجة">برمجة</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع الفاتورة (اختياري)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع الفاتورة (اختياري)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NB">NB</SelectItem>
                          <SelectItem value="NBP">NBP</SelectItem>
                          <SelectItem value="NBC">NBC</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اللون (اختياري)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر اللون" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="أبيض">أبيض</SelectItem>
                          <SelectItem value="أسود">أسود</SelectItem>
                          <SelectItem value="أحمر">أحمر</SelectItem>
                          <SelectItem value="أزرق">أزرق</SelectItem>
                          <SelectItem value="رمادي">رمادي</SelectItem>
                          <SelectItem value="فضي">فضي</SelectItem>
                          <SelectItem value="أخضر">أخضر</SelectItem>
                          <SelectItem value="بني">بني</SelectItem>
                          <SelectItem value="أصفر">أصفر</SelectItem>
                          <SelectItem value="برتقالي">برتقالي</SelectItem>
                          <SelectItem value="ذهبي">ذهبي</SelectItem>
                          <SelectItem value="بنفسجي">بنفسجي</SelectItem>
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

                {form.watch("carBrand") === "other" && (
                  <FormField
                    control={form.control}
                    name="customCarBrand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع السيارة المخصص</FormLabel>
                        <FormControl>
                          <Input placeholder="اكتب نوع السيارة" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="carModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>موديل السيارة</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: A4" {...field} />
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
                      <FormLabel>رقم اللوحة (AUTO FILL)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="أدخل رقم اللوحة - سيتم تعبئة البيانات تلقائياً" 
                          {...field}
                          className="bg-blue-50 border-blue-200 focus:border-blue-500"
                        />
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
                  name="timerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع المؤقت</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع المؤقت" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="automatic">مؤقت أوتوماتيكي</SelectItem>
                          <SelectItem value="manual">مؤقت يدوي</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* حقل الوقت المستهلك - يظهر فقط عند اختيار المؤقت اليدوي */}
                {form.watch("timerType") === "manual" && (
                  <>
                    <FormField
                      control={form.control}
                      name="consumedTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الوقت المستهلك (دقيقة)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="أدخل الوقت المستهلك"
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
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ انتهاء المهمة</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              data-testid="input-due-date"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

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
                  name="supervisors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المشرفون (اختياري)</FormLabel>
                      <FormControl>
                        <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                          {workerNames?.filter((name: string) => 
                            name !== "عامل جديد"
                          ).map((name: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`supervisor-${index}`}
                                checked={field.value?.includes(name) || false}
                                onChange={(e) => {
                                  const currentValue = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...currentValue, name]);
                                  } else {
                                    field.onChange(currentValue.filter(v => v !== name));
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <label htmlFor={`supervisor-${index}`} className="text-sm font-medium leading-none">
                                {name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="technicians"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفنيون (اختياري)</FormLabel>
                      <FormControl>
                        <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                          {workerNames?.filter((name: string) => 
                            name !== "عامل جديد"
                          ).map((name: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`tech-${index}`}
                                checked={field.value?.includes(name) || false}
                                onChange={(e) => {
                                  const currentValue = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...currentValue, name]);
                                  } else {
                                    field.onChange(currentValue.filter(v => v !== name));
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <label htmlFor={`tech-${index}`} className="text-sm font-medium leading-none">
                                {name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assistants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المساعدون (اختياري)</FormLabel>
                      <FormControl>
                        <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                          {workerNames?.filter((name: string) => 
                            name !== "عامل جديد"
                          ).map((name: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`asst-${index}`}
                                checked={field.value?.includes(name) || false}
                                onChange={(e) => {
                                  const currentValue = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...currentValue, name]);
                                  } else {
                                    field.onChange(currentValue.filter(v => v !== name));
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <label htmlFor={`asst-${index}`} className="text-sm font-medium leading-none">
                                {name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
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
                    <span className="font-medium text-green-600 w-20">المشرفون:</span>
                    <span className="text-gray-800 bg-yellow-100 px-2 py-1 rounded">
                      {form.watch("supervisors")?.length > 0 ? form.watch("supervisors").join(", ") : "غير محدد"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded border">
                    <span className="font-medium text-orange-600 w-20">الفنيون:</span>
                    <span className="text-gray-800 bg-yellow-100 px-2 py-1 rounded">
                      {form.watch("technicians")?.length > 0 ? form.watch("technicians").join(", ") : "غير محدد"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white rounded border">
                    <span className="font-medium text-purple-600 w-20">المساعدون:</span>
                    <span className="text-gray-800 bg-yellow-100 px-2 py-1 rounded">
                      {form.watch("assistants")?.length > 0 ? form.watch("assistants").join(", ") : "غير محدد"}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  ملاحظة: يمكن اختيار عدة مشرفين وفنيين ومساعدين للمهمة الواحدة
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