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

const taskFormSchema = insertTaskSchema.extend({
  workerId: z.string().min(1, "يجب اختيار العامل"),
  workerRole: z.string().min(1, "يجب اختيار صفة العامل"),
  description: z.string().min(1, "يجب إدخال وصف المهمة"),
  carBrand: z.string().min(1, "يجب اختيار نوع السيارة"),
  carModel: z.string().min(1, "يجب إدخال موديل السيارة"),
  licensePlate: z.string().min(1, "يجب إدخال رقم اللوحة"),
  estimatedDuration: z.number().optional(),
  engineerName: z.string().optional(),
  supervisorName: z.string().optional(),
}).omit({
  id: true,
  status: true,
  startTime: true,
  endTime: true,
  pausedAt: true,
  pauseReason: true,
  pauseNotes: true,
  totalPausedDuration: true,
  isArchived: true,
  archivedAt: true,
  archivedBy: true,
  archiveNotes: true,
  createdAt: true,
});

type TaskFormData = z.infer<typeof taskFormSchema>;

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

export default function NewTaskForm() {
  const { toast } = useToast();
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const { data: workers } = useQuery({
    queryKey: ['/api/workers'],
  });

  const { data: workerNames } = useQuery({
    queryKey: ['/api/workers/names'],
  });

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      workerId: "",
      workerRole: "",
      description: "",
      carBrand: "",
      carModel: "",
      licensePlate: "",
      estimatedDuration: 60,
      engineerName: "",
      supervisorName: "",
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      form.reset();
      toast({
        title: "تم إنشاء المهمة بنجاح",
        description: `تم بدء مهمة ${data.description} بنجاح`,
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في إنشاء المهمة",
        description: "تأكد من صحة البيانات وحاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    let workerId = data.workerId;
    
    // Check if we need to create a new worker
    if (typeof workerId === 'string' && workerId.startsWith('create-')) {
      const workerName = workerId.replace('create-', '');
      
      // Create the worker first
      try {
        const response = await apiRequest("POST", "/api/workers", {
          name: workerName,
          category: "technician",
          supervisor: "",
          assistant: "",
          engineer: "",
          nationalId: "",
          phoneNumber: "",
          isActive: true
        });
        
        const newWorker = await response.json();
        workerId = newWorker.id.toString();
        
        // Invalidate workers query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
      } catch (error) {
        console.error("Error creating worker:", error);
        toast({
          title: "خطأ في إنشاء العامل",
          description: "حاول مرة أخرى",
          variant: "destructive",
        });
        return;
      }
    }
    
    createTaskMutation.mutate({
      ...data,
      workerId: parseInt(workerId.toString())
    });
  };

  // Get all workers
  const allWorkers = workers || [];
  
  // Use worker names from API, fallback to predefined if needed
  const predefinedWorkerNames = workerNames?.filter(name => name !== "عامل جديد") || 
    ["غدير", "يحيى", "حسام", "مصطفى", "زياد", "سليمان", "علي", "حسن"];

  // Handle role change to show team dialog
  const handleRoleChange = (role: string) => {
    form.setValue("workerRole", role);
    setSelectedRole(role);
    
    // Show dialog for technician, supervisor, or assistant roles
    if (["technician", "supervisor", "assistant"].includes(role)) {
      setShowTeamDialog(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PlusCircle className="ml-2 h-5 w-5" />
          إنشاء مهمة جديدة
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                          {predefinedWorkerNames.map((workerName, index) => {
                            // Check if worker exists in database
                            const existingWorker = allWorkers.find(w => w.name === workerName);
                            if (existingWorker) {
                              return (
                                <SelectItem key={`existing-${existingWorker.id}`} value={existingWorker.id.toString()}>
                                  {existingWorker.name}
                                </SelectItem>
                              );
                            } else {
                              // Worker doesn't exist, will be created when task is submitted
                              return (
                                <SelectItem key={`new-${workerName}-${index}`} value={`create-${workerName}`}>
                                  {workerName}
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
                      <Select onValueChange={handleRoleChange} value={field.value}>
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

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createTaskMutation.isPending}
            >
              <Play className="ml-2 h-4 w-4" />
              {createTaskMutation.isPending ? "جاري الإنشاء..." : "بدء المهمة"}
            </Button>
          </form>
        </Form>
      </CardContent>

      {/* Team Information Dialog */}
      <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>معلومات الفريق</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="engineerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المهندس</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المهندس" />
                      </SelectTrigger>
                      <SelectContent>
                        {predefinedWorkerNames.map((name, index) => (
                          <SelectItem key={`engineer-${index}`} value={name}>
                            {name}
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
              name="supervisorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المشرف</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المشرف" />
                      </SelectTrigger>
                      <SelectContent>
                        {predefinedWorkerNames.map((name, index) => (
                          <SelectItem key={`supervisor-${index}`} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => setShowTeamDialog(false)}
                className="flex-1"
              >
                تأكيد
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowTeamDialog(false)}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}