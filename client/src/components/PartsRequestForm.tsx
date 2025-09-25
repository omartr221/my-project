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
  forWorkshop: true,
});

type PartsRequestFormData = z.infer<typeof partsRequestFormSchema>;

// قائمة أسماء المهندسين
const engineerNames = [
  "بدوي",
  "خالد",
  "حكيم",
  "محمد العلي",
  "أنس",
  "عامر",
  "زياد",
  "علي",
  "عبد الحفيظ",
  "مصطفى",
  "حسام"
];

export default function PartsRequestForm() {
  const [isSearching, setIsSearching] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // التحقق من صلاحية إنشاء طلبات القطع - فارس لديه صلاحية كاملة
  const canCreateRequest = user?.permissions?.includes('parts:create') || user?.username === 'فارس';
  
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
      forWorkshop: "",
    },
  });

  const createPartsRequestMutation = useMutation({
    mutationFn: async (data: PartsRequestFormData) => {
      // تحويل البيانات لتتوافق مع schema السيرفر
      const requestData = {
        engineerName: data.engineerName,
        customerName: (window as any).lastFoundCustomerName || "", // اسم الزبون من البحث
        carInfo: data.carInfo || `${data.licensePlate || ''} ${data.chassisNumber || ''} ${data.carBrand || ''} ${data.carModel || ''}`.trim() || 'غير محدد',
        carBrand: data.carBrand,
        carModel: data.carModel,
        licensePlate: data.licensePlate,
        chassisNumber: data.chassisNumber,
        engineCode: data.engineCode,
        reasonType: data.reasonType,
        partName: data.partName,
        quantity: Number(data.quantity),
        notes: data.notes || "",
        forWorkshop: data.forWorkshop || ""
      };
      
      console.log('Sending parts request data:', requestData);
      
      // استخدام fetch مباشرة بدلاً من apiRequest لضمان التوافق
      const response = await fetch("/api/parts-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // مهم للـ sessions
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error}`);
      }
      
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

  // دالة البحث المحسنة للزبائن والسيارات
  const searchCustomerCars = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setCustomerSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch(`/api/search-customer-cars?query=${encodeURIComponent(searchTerm.trim())}`);
      
      if (response.ok) {
        const results = await response.json();
        console.log("Customer cars found:", results);
        
        if (results && results.length > 0) {
          setCustomerSuggestions(results);
          setShowSuggestions(true);
        } else {
          setCustomerSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setCustomerSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("خطأ في البحث:", error);
      setCustomerSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  // دالة اختيار زبون وسيارة
  const selectCustomerCar = (customerCar: any) => {
    setSelectedCustomer(customerCar);
    setShowSuggestions(false);
    
    // تعبئة جميع الحقول
    form.setValue("carInfo", `${customerCar.customerName} - ${customerCar.carBrand} ${customerCar.carModel} - ${customerCar.licensePlate}`);
    form.setValue("carBrand", customerCar.carBrand || "");
    form.setValue("carModel", customerCar.carModel || "");
    form.setValue("licensePlate", customerCar.licensePlate || "");
    form.setValue("chassisNumber", customerCar.chassisNumber || "");
    form.setValue("engineCode", customerCar.engineCode || "");
    
    // حفظ اسم الزبون للاستخدام عند الإرسال
    (window as any).lastFoundCustomerName = customerCar.customerName || "";
    
    toast({
      title: "✅ تم اختيار السيارة",
      description: `${customerCar.customerName} - ${customerCar.carBrand} ${customerCar.carModel} - ${customerCar.licensePlate}`,
    });
  };

  // البحث التلقائي عن معلومات السيارة من بطاقة الزبون
  const searchCarInfo = async (searchTerm?: string) => {
    const term = searchTerm || form.getValues("carInfo");
    if (!term?.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الزبون أو رقم الشاسيه أو رقم اللوحة للبحث",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search-car-info/${encodeURIComponent(term.trim())}`);
      
      if (response.ok) {
        const carData = await response.json();
        
        if (carData && carData.carBrand) {
          // ملء جميع البيانات المتاحة مع الحفاظ على البيانات المدخلة يدوياً
          form.setValue("carBrand", carData.carBrand);
          form.setValue("carModel", carData.carModel || "");
          
          if (carData.licensePlate && !form.getValues("licensePlate")) {
            form.setValue("licensePlate", carData.licensePlate);
          }
          if (carData.chassisNumber && !form.getValues("chassisNumber")) {
            form.setValue("chassisNumber", carData.chassisNumber);
          }
          if (carData.engineCode && !form.getValues("engineCode")) {
            form.setValue("engineCode", carData.engineCode);
          }
          
          // تحديث معلومات السيارة المدمجة
          const updatedCarInfo = `${carData.customerName || ''} - ${carData.carBrand} ${carData.carModel || ''} - ${carData.licensePlate || ''}`.trim();
          form.setValue("carInfo", updatedCarInfo);
          
          // حفظ اسم الزبون للاستخدام عند الإرسال
          (window as any).lastFoundCustomerName = carData.customerName || "";
          
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

  // البحث التلقائي عند تغيير معلومات السيارة
  const handleCarInfoChange = async (value: string) => {
    form.setValue("carInfo", value);
    
    // إذا كان النص يحتوي على أكثر من 2 أحرف، قم بالبحث عن السيارات المتعددة
    if (value.trim().length >= 2) {
      // تأخير البحث لتجنب الطلبات المتكررة
      setTimeout(() => {
        if (form.getValues("carInfo") === value) {
          searchCustomerCars(value);
        }
      }, 500);
    } else {
      setShowSuggestions(false);
      setCustomerSuggestions([]);
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
                  <div className="relative">
                    <div className="flex gap-2">
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="اسم الزبون، رقم الشاسيه، أو رقم اللوحة (بحث تلقائي)"
                            {...field}
                            className={`flex-1 ${isSearching ? 'pr-10' : ''}`}
                            onChange={(e) => {
                              field.onChange(e);
                              handleCarInfoChange(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                searchCarInfo();
                              }
                              if (e.key === 'Escape') {
                                setShowSuggestions(false);
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
                    
                    {/* قائمة الاقتراحات للسيارات المتعددة */}
                    {showSuggestions && customerSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2 bg-gray-50 border-b text-sm text-gray-600">
                          تم العثور على {customerSuggestions.length} سيارة - اختر واحدة:
                        </div>
                        {customerSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => selectCustomerCar(suggestion)}
                          >
                            <div className="font-medium text-gray-900">
                              {suggestion.customerName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {suggestion.carBrand} {suggestion.carModel} - لوحة: {suggestion.licensePlate}
                            </div>
                            {suggestion.chassisNumber && (
                              <div className="text-xs text-gray-500">
                                شاسيه: {suggestion.chassisNumber}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
                  <FormLabel>الصانع</FormLabel>
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
                  <FormLabel>الطراز</FormLabel>
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

            {/* للورشة */}
            <FormField
              control={form.control}
              name="forWorkshop"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>للورشة (اختياري)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="اكتب اسم الورشة أو اتركه فارغاً..."
                      {...field}
                      value={field.value || ""}
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