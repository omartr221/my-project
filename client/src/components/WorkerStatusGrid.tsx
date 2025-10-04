import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  "خالد", "حكيم", "محمد العلي", "أنس", "عامر", "زياد", "علي"
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
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAddWorkerDialog, setShowAddWorkerDialog] = useState(false);
  const [password, setPassword] = useState("");

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
      setShowAddWorkerDialog(false);
      toast({
        title: "تم تسجيل العامل بنجاح",
        description: `تم تسجيل ${newWorker.name} بنجاح`,
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تسجيل العامل",
        description: "حدث خطأ أثناء تسجيل العامل",
        variant: "destructive",
      });
    },
  });

  const handlePasswordSubmit = () => {
    if (password === "0000") {
      setShowPasswordDialog(false);
      setShowAddWorkerDialog(true);
      setPassword("");
    } else {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور غير صحيحة",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  const handleAddWorkerClick = () => {
    setShowPasswordDialog(true);
  };

  const onSubmit = (data: InsertWorker) => {
    createWorkerMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {workers.map((worker) => (
          <Card key={worker.id} className="h-40">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{worker.name}</span>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className={`w-3 h-3 rounded-full ${
                    worker.isAvailable ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>المهام النشطة:</span>
                  <span className="font-semibold">{worker.tasks.filter(t => t.status === 'active').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>وقت العمل:</span>
                  <span className="font-semibold">{formatDuration(worker.totalWorkTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>الحالة:</span>
                  <span className={`font-semibold ${
                    worker.isAvailable ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {worker.isAvailable ? 'متاح' : 'مشغول'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {showManagement && (
          <Button 
            onClick={handleAddWorkerClick}
            className="h-40 w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
            variant="outline"
          >
            <div className="flex flex-col items-center gap-2">
              <Plus className="w-8 h-8" />
              <span>إضافة عامل</span>
            </div>
          </Button>
        )}
      </div>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>كلمة المرور</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit();
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePasswordSubmit} className="flex-1">
                تأكيد
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPassword("");
                }}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Worker Dialog */}
      <Dialog open={showAddWorkerDialog} onOpenChange={setShowAddWorkerDialog}>
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
                            {(workerNames || predefinedWorkers).map((name, index) => (
                              <SelectItem key={`${name}-${index}`} value={name || `item-${index}`}>
                                {name}
                              </SelectItem>
                            ))}
                            <SelectItem value="عامل جديد">عامل جديد</SelectItem>
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
                          <Select onValueChange={field.onChange} value={field.value}>
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
                        <FormLabel>العنوان</FormLabel>
                        <FormControl>
                          <Input placeholder="العنوان" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createWorkerMutation.isPending} className="flex-1">
                  {createWorkerMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowAddWorkerDialog(false);
                    setIsNewWorker(false);
                    form.reset();
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}