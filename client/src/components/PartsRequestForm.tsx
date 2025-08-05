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
import { insertPartsRequestSchema, type InsertPartsRequest } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

const partsRequestFormSchema = insertPartsRequestSchema.extend({
  quantity: z.coerce.number().min(1, "يجب أن يكون العدد أكبر من صفر"),
  engineerName: z.string().min(1, "يجب اختيار المهندس"),
  carInfo: z.string().min(1, "يجب إدخال معلومات السيارة"),
  reasonType: z.string().min(1, "يجب اختيار سبب الطلب"),
  partName: z.string().min(1, "يجب إدخال اسم القطعة"),
}).partial({
  carBrand: true,
  carModel: true,
  licensePlate: true,
  chassisNumber: true,
  engineCode: true,
  notes: true,
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
      carInfo: "",
      carBrand: "",
      carModel: "",
      licensePlate: "",
      chassisNumber: "",
      engineCode: "",
      reasonType: "",
      partName: "",
      quantity: 1,
      notes: "",
    },
  });

  const createPartsRequestMutation = useMutation({
    mutationFn: async (data: PartsRequestFormData) => {
      // تحويل البيانات لتتوافق مع schema السيرفر
      const requestData = {
        engineerName: data.engineerName,
        carInfo: data.carInfo || `${data.licensePlate || ''} ${data.chassisNumber || ''} ${data.carBrand || ''} ${data.carModel || ''}`.trim() || 'غير محدد',
        carBrand: data.carBrand,
        carModel: data.carModel,
        licensePlate: data.licensePlate,
        chassisNumber: data.chassisNumber,
        engineCode: data.engineCode,
        reasonType: data.reasonType,
        partName: data.partName,
        quantity: Number(data.quantity),
        notes: data.notes || ""
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

  // البحث المتقدم عن معلومات السيارة (اسم الزبون، رقم الشاسيه، رقم اللوحة)
  const searchCarInfo = async () => {
    const searchTerm = form.getValues("carInfo");
    if (!searchTerm.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الزبون أو رقم الشاسيه أو رقم اللوحة للبحث",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search-car-info/${encodeURIComponent(searchTerm)}`);
      
      if (response.ok) {
        const carData = await response.json();
        
        if (carData && carData.carBrand && carData.carModel) {
          // ملء جميع البيانات المتاحة
          form.setValue("carBrand", carData.carBrand);
          form.setValue("carModel", carData.carModel);
          
          if (carData.licensePlate) {
            form.setValue("licensePlate", carData.licensePlate);
          }
          if (carData.chassisNumber) {
            form.setValue("chassisNumber", carData.chassisNumber);
          }
          if (carData.engineCode) {
            form.setValue("engineCode", carData.engineCode);
          }
          
          // إنشاء وصف شامل
          let description = `${carData.carBrand} ${carData.carModel}`;
          if (carData.customerName) {
            description = `الزبون: ${carData.customerName} - ${description}`;
          }
          if (carData.chassisNumber) {
            description += ` - شاسيه: ${carData.chassisNumber}`;
          }
          if (carData.licensePlate) {
            description += ` - لوحة: ${carData.licensePlate}`;
          }
          
          toast({
            title: "✅ تم العثور على البيانات",
            description: description,
          });
        } else {
          toast({
            title: "لم يتم العثور على بيانات",
            description: "لا توجد معلومات مسجلة لهذا الزبون أو السيارة",
            variant: "destructive",
          });
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("خطأ في البحث:", error);
      toast({
        title: "خطأ في البحث",
        description: "لم يتم العثور على بيانات - يمكنك إدخال البيانات يدوياً",
        variant: "default",
      });
    } finally {
      setIsSearching(false);
    }
  };

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

            {/* معلومات السيارة */}
            <FormField
              control={form.control}
              name="carInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>معلومات السيارة</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="اسم الزبون، رقم الشاسيه، أو رقم اللوحة (بحث تلقائي)"
                          {...field}
                          className={`flex-1 ${isSearching ? 'pr-10' : ''}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              searchCarInfo();
                            }
                          }}
                          onBlur={() => {
                            // البحث التلقائي عند إدخال البيانات وتغيير المجال
                            if (field.value.trim()) {
                              searchCarInfo();
                            }
                          }}
                        />
                        {isSearching && (
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => searchCarInfo()}
                      disabled={isSearching || !field.value.trim()}
                    >
                      <Search className="h-4 w-4" />
                      بحث
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* نوع السيارة */}
            <FormField
              control={form.control}
              name="carBrand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع السيارة</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: AUDI" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* موديل السيارة */}
            <FormField
              control={form.control}
              name="carModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>موديل السيارة</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: A4" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* رقم السيارة */}
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

            {/* رقم الشاسيه */}
            <FormField
              control={form.control}
              name="chassisNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الشاسيه</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: WAUEXXX" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* رمز المحرك */}
            <FormField
              control={form.control}
              name="engineCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رمز المحرك</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: BHF" {...field} value={field.value || ""} />
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