import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertWorkerSchema, type InsertWorker } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const workerFormSchema = insertWorkerSchema.extend({
  name: z.string().min(1, "يجب إدخال اسم الموظف"),
});

type WorkerFormData = z.infer<typeof workerFormSchema>;

export default function AddWorkerForm() {
  const [password, setPassword] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<WorkerFormData>({
    resolver: zodResolver(workerFormSchema),
    defaultValues: {
      name: "",
      category: "technician",
      birthDate: undefined,
      maritalStatus: undefined,
      nationalId: "",
      startDate: undefined,
      endDate: undefined,
      phoneNumber: "",
      address: "",
      supervisor: "",
      assistant: "",
      engineer: "",
    },
  });

  const createWorkerMutation = useMutation({
    mutationFn: async (data: WorkerFormData) => {
      const response = await apiRequest("/api/workers", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers"] });
      form.reset();
      setShowForm(false);
      setPassword("");
      toast({
        title: "تم إضافة الموظف بنجاح",
        description: "تم إضافة الموظف الجديد إلى النظام",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في إضافة الموظف",
        description: "حدث خطأ أثناء إضافة الموظف",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: WorkerFormData) => {
    createWorkerMutation.mutate(data);
  };

  const handlePasswordSubmit = () => {
    if (password === "0000") {
      setShowForm(true);
    } else {
      toast({
        title: "كلمة مرور خاطئة",
        description: "يرجى إدخال كلمة المرور الصحيحة",
        variant: "destructive",
      });
    }
  };

  if (!showForm) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>إضافة موظف جديد</CardTitle>
          <CardDescription>
            يتطلب كلمة مرور للوصول
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
            />
          </div>
          <Button onClick={handlePasswordSubmit} className="w-full">
            دخول
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>إضافة موظف جديد</CardTitle>
        <CardDescription>
          أدخل معلومات الموظف الجديد
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الموظف</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسم الموظف" {...field} />
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
                    <FormLabel>تصنيف الموظف</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر تصنيف الموظف" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="technician">فني</SelectItem>
                        <SelectItem value="administrative">إداري</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مواليد</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة الاجتماعية</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحالة الاجتماعية" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single">أعزب</SelectItem>
                        <SelectItem value="married">متزوج</SelectItem>
                        <SelectItem value="divorced">مطلق</SelectItem>
                        <SelectItem value="widowed">أرمل</SelectItem>
                      </SelectContent>
                    </Select>
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
                        placeholder="أدخل الرقم الوطني" 
                        {...field} 
                        value={field.value || ""}
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
                        placeholder="أدخل رقم الهاتف"
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ بداية العمل</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ نهاية العمل</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="أدخل العنوان الكامل"
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={createWorkerMutation.isPending}
                className="flex-1"
              >
                {createWorkerMutation.isPending ? "جاري الإضافة..." : "إضافة الموظف"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  setPassword("");
                  form.reset();
                }}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}