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
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const editTaskSchema = z.object({
  description: z.string().min(1, "يجب إدخال وصف المهمة"),
  repairOperation: z.string().optional(),
  taskType: z.string().optional(),
  invoiceType: z.string().optional(),
  color: z.string().optional(),
  carBrand: z.string().min(1, "يجب اختيار نوع السيارة"),
  customCarBrand: z.string().optional(),
  carModel: z.string().min(1, "يجب إدخال موديل السيارة"),
  licensePlate: z.string().min(1, "يجب إدخال رقم اللوحة"),
  estimatedDuration: z.number().min(1, "يجب أن يكون الوقت المقدر أكبر من صفر"),
  engineerName: z.string().optional(),
  supervisorName: z.string().optional(),
  technicianName: z.string().optional(),
  assistantName: z.string().optional(),
  technicians: z.array(z.string()).optional(),
  assistants: z.array(z.string()).optional(),
  timerType: z.string().optional(),
  consumedTime: z.number().nullable().optional(),
  endTime: z.string().optional(),
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
    { value: "other", label: "أخرى" },
  ];

  const form = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      description: task.description,
      repairOperation: (task as any).repairOperation || "",
      taskType: (task as any).taskType || "",
      invoiceType: (task as any).invoiceType || "",
      color: (task as any).color || "",
      carBrand: task.carBrand,
      customCarBrand: "",
      carModel: task.carModel,
      licensePlate: task.licensePlate,
      estimatedDuration: task.estimatedDuration || 60,
      engineerName: (task as any).engineerName || "",
      supervisorName: (task as any).supervisorName || "",
      technicianName: (task as any).technicianName || "",
      assistantName: (task as any).assistantName || "",
      technicians: Array.isArray((task as any).technicians) 
        ? (task as any).technicians 
        : typeof (task as any).technicians === 'string' && (task as any).technicians.trim()
        ? (task as any).technicians.split(',').map((name: string) => name.trim())
        : [],
      assistants: Array.isArray((task as any).assistants) 
        ? (task as any).assistants 
        : typeof (task as any).assistants === 'string' && (task as any).assistants.trim()
        ? (task as any).assistants.split(',').map((name: string) => name.trim())
        : [],
      timerType: (task as any).timerType || "automatic",
      consumedTime: (task as any).consumedTime,
      endTime: task.endTime ? format(new Date(task.endTime), "yyyy-MM-dd'T'HH:mm") : "",
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: EditTaskFormData) => {
      const payload = {
        ...data,
        carBrand: data.carBrand === "other" ? data.customCarBrand : data.carBrand,
      };
      console.log("Sending PATCH request to:", `/api/tasks/${task.id}`);
      console.log("Payload:", payload);
      
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
      queryClient.invalidateQueries({ queryKey: ["/api/archive"] });
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
    console.log("Form submitted with data:", data);
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
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل المهمة {task.taskNumber}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" 
                onClick={(e) => {
                  if (e.target instanceof HTMLButtonElement && e.target.type === 'submit') {
                    console.log("Submit button clicked");
                  }
                }}>
            {/* معلومات المهمة الأساسية */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            </div>

            {/* معلومات السيارة */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                    <Input {...field} placeholder="مثال: A4" />
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
            </div>

            {/* معلومات العاملين */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                        <SelectItem value="none">بدون اختيار</SelectItem>
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
                        <SelectItem value="none">بدون اختيار</SelectItem>
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
                name="technicians"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفنيون</FormLabel>
                    <FormControl>
                      <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                        {workers?.map((worker: any, index: number) => (
                          <div key={worker.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`tech-edit-${worker.id}`}
                              value={worker.name}
                              checked={field.value?.includes(worker.name)}
                              onChange={(e) => {
                                const currentValue = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...currentValue, worker.name]);
                                } else {
                                  field.onChange(currentValue.filter(v => v !== worker.name));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor={`tech-edit-${worker.id}`} className="text-sm font-medium leading-none">
                              {worker.name}
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
                    <FormLabel>المساعدون</FormLabel>
                    <FormControl>
                      <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                        {workers?.map((worker: any, index: number) => (
                          <div key={worker.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`assist-edit-${worker.id}`}
                              value={worker.name}
                              checked={field.value?.includes(worker.name)}
                              onChange={(e) => {
                                const currentValue = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...currentValue, worker.name]);
                                } else {
                                  field.onChange(currentValue.filter(v => v !== worker.name));
                                }
                              }}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor={`assist-edit-${worker.id}`} className="text-sm font-medium leading-none">
                              {worker.name}
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

            {/* الوقت المقدر ونوع المؤقت */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="timerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع المؤقت</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ ووقت انتهاء المهمة</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* حقل الوقت المستهلك - يظهر فقط عند اختيار المؤقت اليدوي */}
              {form.watch("timerType") === "manual" && (
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
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                disabled={updateTaskMutation.isPending}
                className="flex-1"
                onClick={(e) => {
                  console.log("Button clicked", e);
                  console.log("Form errors:", form.formState.errors);
                }}
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