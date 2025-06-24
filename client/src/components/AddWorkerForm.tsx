import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertWorkerSchema, type InsertWorker } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const workerFormSchema = insertWorkerSchema.extend({
  name: z.string().min(1, "يجب إدخال الاسم"),
  nationalId: z.string().min(1, "يجب إدخال الرقم الوطني"),
  phoneNumber: z.string().min(1, "يجب إدخال رقم الهاتف"),
  address: z.string().min(1, "يجب إدخال السكن"),
}).omit({
  id: true,
  supervisor: true,
  assistant: true,
  engineer: true,
  isActive: true,
  isPredefined: true,
});

type WorkerFormData = z.infer<typeof workerFormSchema>;

const workerCategories = [
  { value: "assistant", label: "مساعد" },
  { value: "technician", label: "فني" },
  { value: "supervisor", label: "مشرف" },
  { value: "engineer", label: "مهندس" },
];

export default function AddWorkerForm() {
  const { toast } = useToast();

  const form = useForm<WorkerFormData>({
    resolver: zodResolver(workerFormSchema),
    defaultValues: {
      name: "",
      category: "",
      nationalId: "",
      phoneNumber: "",
      address: "",
    },
  });

  const createWorkerMutation = useMutation({
    mutationFn: async (data: WorkerFormData) => {
      const workerData = {
        ...data,
        supervisor: "",
        assistant: "",
        engineer: "",
        isActive: true,
        isPredefined: false,
      };
      const response = await apiRequest("POST", "/api/workers", workerData);
      return response.json();
    },
    onSuccess: (newWorker) => {
      queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workers/names'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      form.reset();
      toast({
        title: "تم إضافة العامل بنجاح",
        description: `تم إضافة العامل ${newWorker.name} إلى النظام وأصبح متاحاً في قائمة المؤقتات`,
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في إضافة العامل",
        description: "تأكد من صحة البيانات وحاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WorkerFormData) => {
    createWorkerMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="ml-2 h-5 w-5" />
            إضافة عامل جديد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="اسم العامل الكامل" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفئة</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر فئة العامل" />
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
                        <Input 
                          placeholder="الرقم الوطني" 
                          {...field} 
                        />
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
                        <Input 
                          placeholder="رقم الهاتف" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>السكن</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="العنوان الكامل" 
                          {...field} 
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
                disabled={createWorkerMutation.isPending}
              >
                <UserPlus className="ml-2 h-4 w-4" />
                {createWorkerMutation.isPending ? "جاري الإضافة..." : "إضافة العامل"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}