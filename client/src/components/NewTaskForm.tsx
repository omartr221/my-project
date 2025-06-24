import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Play } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertTaskSchema, type InsertTask } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const taskFormSchema = insertTaskSchema.extend({
  workerId: z.number().min(1, "يجب اختيار العامل"),
  description: z.string().min(1, "يجب إدخال وصف المهمة"),
  carBrand: z.string().min(1, "يجب اختيار نوع السيارة"),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

const carBrands = [
  { value: "audi", label: "أودي" },
  { value: "seat", label: "سيات" },
  { value: "skoda", label: "سكودا" },
  { value: "volkswagen", label: "فولكس فاجن" },
];

export default function NewTaskForm() {
  const { toast } = useToast();

  const { data: workers } = useQuery({
    queryKey: ['/api/workers'],
  });

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      workerId: 0,
      description: "",
      carBrand: "",
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

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate(data);
  };

  // Get available workers (not currently busy)
  const availableWorkers = workers?.filter(worker => worker.isAvailable) || [];

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="workerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العامل</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر العامل" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableWorkers.length === 0 ? (
                            <SelectItem value="0" disabled>
                              لا يوجد عمال متاحين
                            </SelectItem>
                          ) : (
                            availableWorkers.map((worker) => (
                              <SelectItem key={worker.id} value={worker.id.toString()}>
                                {worker.name}
                              </SelectItem>
                            ))
                          )}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف المهمة</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="مثال: صيانة دورية" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-end">
                <Button 
                  type="submit" 
                  disabled={createTaskMutation.isPending || availableWorkers.length === 0}
                  className="w-full"
                >
                  <Play className="ml-2 h-4 w-4" />
                  {createTaskMutation.isPending ? "جاري البدء..." : "بدء المهمة"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
