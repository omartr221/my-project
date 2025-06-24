import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertWorkerSchema, type WorkerWithTasks, type InsertWorker } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDuration } from "@/lib/utils";

interface WorkerStatusGridProps {
  workers: WorkerWithTasks[];
  showManagement?: boolean;
}

const predefinedWorkers = [
  "مصطفى", "حسام", "زياد", "حسن", "يحيى", "محمد العلي", "سليمان", "علي"
];

const workerCategories = [
  { value: "technician", label: "فني" },
  { value: "assistant", label: "مساعد" },
  { value: "supervisor", label: "مشرف" },
  { value: "trainee_technician", label: "فني تحت الإشراف" },
];

export default function WorkerStatusGrid({ 
  workers, 
  showManagement = false 
}: WorkerStatusGridProps) {
  const { toast } = useToast();
  const [isNewWorker, setIsNewWorker] = useState(false);

  const { data: workerNames } = useQuery({
    queryKey: ['/api/workers/names'],
  });
  
  const form = useForm<InsertWorker>({
    resolver: zodResolver(insertWorkerSchema),
    defaultValues: {
      name: "",
      category: "",
      supervisor: "",
      assistant: "",
      engineer: "",
      nationalId: "",
      phoneNumber: "",
      address: "",
      isActive: true,
    },
  });

  const createWorkerMutation = useMutation({
    mutationFn: async (data: InsertWorker) => {
      const response = await apiRequest("POST", "/api/workers", data);
      return response.json();
    },
    onSuccess: (newWorker) => {
      queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workers/names'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      form.reset();
      setIsNewWorker(false);
      toast({
        title: "تم إنشاء العامل بنجاح",
        description: `تم إضافة العامل ${newWorker.name} إلى قائمة الأسماء`,
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في إنشاء العامل",
        description: "حاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertWorker) => {
    createWorkerMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Users className="ml-2 h-5 w-5" />
            حالة العمال
          </CardTitle>
          {showManagement && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة عامل
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>تسجيل عامل جديد</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم العامل</FormLabel>
                          <FormControl>
                            {isNewWorker ? (
                              <Input 
                                placeholder="أدخل اسم العامل الجديد" 
                                {...field} 
                              />
                            ) : (
                              <Select 
                                onValueChange={(value) => {
                                  if (value === "عامل جديد") {
                                    setIsNewWorker(true);
                                    field.onChange("");
                                  } else {
                                    field.onChange(value);
                                  }
                                }} 
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر العامل" />
                                </SelectTrigger>
                                <SelectContent>
                                  {(workerNames || predefinedWorkers).map((name) => (
                                    <SelectItem key={name} value={name}>
                                      {name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {!isNewWorker && (
                      <>
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>التصنيف</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر التصنيف" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {workerCategories.map((category) => (
                                      <SelectItem key={category.value} value={category.value}>
                                        {category.label}
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
                          name="supervisor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>المشرف</FormLabel>
                              <FormControl>
                                <Input placeholder="اسم المشرف" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="assistant"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>المساعد</FormLabel>
                              <FormControl>
                                <Input placeholder="اسم المساعد" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="engineer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>المهندس</FormLabel>
                              <FormControl>
                                <Input placeholder="اسم المهندس" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {isNewWorker && (
                      <>
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>التصنيف</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر التصنيف" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {workerCategories.map((category) => (
                                      <SelectItem key={category.value} value={category.value}>
                                        {category.label}
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
                          name="nationalId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الرقم الوطني</FormLabel>
                              <FormControl>
                                <Input placeholder="الرقم الوطني" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>رقم الهاتف</FormLabel>
                              <FormControl>
                                <Input placeholder="رقم الهاتف" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>عنوان السكن</FormLabel>
                              <FormControl>
                                <Input placeholder="عنوان السكن" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    <div className="flex space-x-reverse space-x-3 pt-4">
                      {isNewWorker && (
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsNewWorker(false);
                            form.reset();
                          }}
                          className="flex-1"
                        >
                          عودة للقائمة
                        </Button>
                      )}
                      <Button 
                        type="submit" 
                        disabled={createWorkerMutation.isPending}
                        className="flex-1"
                      >
                        {createWorkerMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا يوجد عمال مسجلين
            </div>
          ) : (
            workers.map((worker) => (
              <div
                key={worker.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  worker.isAvailable ? 'bg-gray-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center space-x-reverse space-x-3">
                  <div
                    className={`status-indicator ${
                      worker.isAvailable ? 'status-available' : 'status-busy'
                    }`}
                  />
                  <div>
                    <p className="font-medium">{worker.name}</p>
                    <p className="text-sm text-gray-600">
                      {workerCategories.find(c => c.value === worker.category)?.label || worker.category}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`text-sm font-medium ${
                    worker.isAvailable ? 'text-gray-600' : 'error'
                  }`}>
                    {worker.isAvailable ? 'متاح' : 'مشغول'}
                  </p>
                  {worker.currentTask ? (
                    <p className="text-xs text-gray-500">
                      {worker.currentTask.description}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      {formatDuration(worker.totalWorkTime)} ساعة
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
