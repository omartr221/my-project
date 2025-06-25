import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  { value: "technician", label: "فني" },
  { value: "administrative", label: "إداري" },
];

export default function AddWorkerForm() {
  const { toast } = useToast();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAddWorkerForm, setShowAddWorkerForm] = useState(false);
  const [password, setPassword] = useState("");

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
      const response = await apiRequest("POST", "/api/workers", data);
      return response.json();
    },
    onSuccess: (newWorker) => {
      queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workers/names'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      form.reset();
      setShowAddWorkerForm(false);
      toast({
        title: "تم إضافة العامل بنجاح",
        description: `تم إضافة ${newWorker.name} بنجاح`,
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في إضافة العامل",
        description: "حدث خطأ أثناء إضافة العامل",
        variant: "destructive",
      });
    },
  });

  const handlePasswordSubmit = () => {
    if (password === "0000") {
      setShowPasswordDialog(false);
      setShowAddWorkerForm(true);
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

  const onSubmit = async (data: WorkerFormData) => {
    createWorkerMutation.mutate(data);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            إضافة عامل جديد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAddWorkerClick} className="w-full">
            <UserPlus className="w-4 h-4 mr-2" />
            إضافة عامل جديد
          </Button>
        </CardContent>
      </Card>

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

      {/* Add Worker Form Dialog */}
      <Dialog open={showAddWorkerForm} onOpenChange={setShowAddWorkerForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة عامل جديد</DialogTitle>
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
                      <Input placeholder="أدخل اسم العامل" {...field} />
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
                    <FormLabel>تصنيف العامل</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر تصنيف العامل" />
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
                      <Input placeholder="أدخل الرقم الوطني" {...field} />
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
                      <Input placeholder="أدخل رقم الهاتف" {...field} />
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
                      <Input placeholder="أدخل العنوان" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createWorkerMutation.isPending}
                >
                  {createWorkerMutation.isPending ? "جاري الإضافة..." : "إضافة العامل"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowAddWorkerForm(false);
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
    </>
  );
}