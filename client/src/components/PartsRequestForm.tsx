import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Search } from "lucide-react";
import { insertPartsRequestSchema, type InsertPartsRequest } from "@shared/schema-sqlite";
import { useAuth } from "@/hooks/use-auth";

const partsRequestFormSchema = insertPartsRequestSchema.extend({
  quantity: z.coerce.number().min(1, "يجب أن يكون العدد أكبر من صفر"),
});

type PartsRequestFormData = z.infer<typeof partsRequestFormSchema>;

// قائمة أسماء المهندسين
const engineerNames = [
  "غدير",
  "سليمان", 
  "حسام",
  "حسن",
  "يحيى",
  "زياد",
  "بدوي",
  "عبد الحفيظ",
  "محمد العلي"
];

export default function PartsRequestForm() {
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // التحقق من صلاحية إنشاء طلبات القطع
  const canCreateRequest = user?.permissions?.includes('parts:create');
  
  // إذا لم يكن لديه صلاحية، لا نعرض النموذج
  if (!canCreateRequest) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">ليس لديك صلاحية لإنشاء طلبات القطع</p>
        </CardContent>
      </Card>
    );
  }

  const form = useForm<PartsRequestFormData>({
    resolver: zodResolver(partsRequestFormSchema),
    defaultValues: {
      engineerName: "",
      licensePlate: "",
      reasonType: "",
      partName: "",
      quantity: 1,
      notes: "",
      status: "pending",
    },
  });

  const createPartsRequestMutation = useMutation({
    mutationFn: async (data: PartsRequestFormData) => {
      // تحويل البيانات لتتوافق مع schema السيرفر
      const requestData = {
        engineerName: data.engineerName,
        carInfo: data.licensePlate || 'غير محدد',
        licensePlate: data.licensePlate,
        reasonType: data.reasonType,
        partName: data.partName,
        quantity: Number(data.quantity),
        notes: data.notes,
        status: data.status || 'pending'
      };
      
      console.log('Sending parts request data:', requestData);
      const response = await apiRequest("POST", "/api/parts-requests", requestData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء طلب القطعة بنجاح",
        description: "سيتم مراجعة الطلب والموافقة عليه",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/parts-requests"] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في إنشاء طلب القطعة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // البحث عن معلومات السيارة غير ضروري الآن - نحتاج فقط رقم السيارة

  const onSubmit = (data: PartsRequestFormData) => {
    createPartsRequestMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          طلب قطعة جديد
        </CardTitle>
        <CardDescription>
          إنشاء طلب قطعة جديد للسيارة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* المهندس */}
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
                      {engineerNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* رقم السيارة فقط */}
            <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم السيارة</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: 12345" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* سبب الطلب */}
            <FormField
              control={form.control}
              name="reasonType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب الطلب</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر سبب الطلب" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expense">صرف</SelectItem>
                      <SelectItem value="loan">إعارة</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* اسم القطعة */}
            <FormField
              control={form.control}
              name="partName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم القطعة</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: فلتر الهواء" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* العدد */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العدد</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ملاحظات */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أي ملاحظات إضافية..."
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createPartsRequestMutation.isPending}
            >
              {createPartsRequestMutation.isPending ? "جاري الإنشاء..." : "إنشاء طلب القطعة"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}