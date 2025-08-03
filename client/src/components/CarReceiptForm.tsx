import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { insertCarReceiptSchema, type InsertCarReceipt } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

export default function CarReceiptForm() {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertCarReceipt>({
    resolver: zodResolver(insertCarReceiptSchema),
    defaultValues: {
      licensePlate: "",
      customerName: "",

      carBrand: "",
      carModel: "",
      carColor: "",
      chassisNumber: "",
      engineCode: "",
      entryMileage: "",
      fuelLevel: "",
      entryNotes: "",
      repairType: "",
    },
  });

  const createReceiptMutation = useMutation({
    mutationFn: async (data: InsertCarReceipt) => {
      const response = await apiRequest("POST", "/api/car-receipts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء إيصال استلام السيارة بنجاح",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/car-receipts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await apiRequest("GET", `/api/car-search?q=${encodeURIComponent(searchInput)}`);
      const carData = await response.json();
      
      if (carData && carData.licensePlate) {
        // Fill form with customer and car data
        form.setValue("licensePlate", carData.licensePlate);
        form.setValue("customerName", carData.customerName || "");

        form.setValue("carBrand", carData.carBrand || "");
        form.setValue("carModel", carData.carModel || "");
        form.setValue("carColor", carData.color || "");
        form.setValue("chassisNumber", carData.chassisNumber || "");
        form.setValue("engineCode", carData.engineCode || "");
        
        toast({
          title: "تم العثور على البيانات",
          description: `تم تعبئة بيانات السيارة للزبون ${carData.customerName}`,
        });
      } else {
        toast({
          title: "لم يتم العثور على بيانات",
          description: "لم يتم العثور على سيارة بهذا الرقم",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في البحث",
        description: "حدث خطأ أثناء البحث عن بيانات السيارة",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = (data: InsertCarReceipt) => {
    createReceiptMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>استلام السيارة</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium mb-2 block">
              البحث بواسطة رقم السيارة أو اسم الزبون
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="ادخل رقم السيارة أو اسم الزبون"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={handleSearch}
                disabled={isSearching}
                variant="outline"
              >
                <Search className="h-4 w-4" />
                {isSearching ? "جاري البحث..." : "بحث"}
              </Button>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم السيارة *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="يتم ملؤه من البحث" 
                          readOnly 
                          className="bg-gray-100" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الزبون *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="يتم ملؤه من البحث" 
                          readOnly 
                          className="bg-gray-100" 
                        />
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
                      <FormLabel>نوع السيارة *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="يتم ملؤه من بطاقة الزبون" 
                          readOnly 
                          className="bg-gray-100" 
                        />
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
                      <FormLabel>موديل السيارة *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="يتم ملؤه من بطاقة الزبون" 
                          readOnly 
                          className="bg-gray-100" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="carColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>لون السيارة</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          placeholder="يتم ملؤه من بطاقة الزبون" 
                          readOnly 
                          className="bg-gray-100" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chassisNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الشاسيه</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          placeholder="يتم ملؤه من بطاقة الزبون" 
                          readOnly 
                          className="bg-gray-100" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="engineCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رمز المحرك</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""} 
                          placeholder="يتم ملؤه من بطاقة الزبون" 
                          readOnly 
                          className="bg-gray-100" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="entryMileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عداد الدخول *</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder="ادخل قراءة العداد يدوياً"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuelLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نسبة البنزين *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="ادخل نسبة البنزين يدوياً (مثال: ربع، نصف، ممتلئ)" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repairType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>طلبات الإصلاح *</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="اكتب جميع طلبات الإصلاح (مثال: ميكانيك - تغيير زيت، كهربا - فحص البطارية)"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="entryNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الشكوى</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""}
                        placeholder="اكتب شكوى الزبون وما يريد إصلاحه"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={createReceiptMutation.isPending}
              >
                {createReceiptMutation.isPending ? "جاري الحفظ..." : "حفظ إيصال الاستلام"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}