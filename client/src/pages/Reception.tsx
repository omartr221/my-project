import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Car, Clock, User, Phone, MapPin, Fuel, Gauge } from "lucide-react";
import type { ReceptionEntry, InsertReceptionEntry } from "@shared/schema";

export default function Reception() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<InsertReceptionEntry, 'receptionUserId'>>({
    carOwnerName: "",
    licensePlate: "",
    serviceType: "",
    complaints: "",
    odometerReading: 0,
    fuelLevel: "",
  });

  // Fetch reception entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["/api/reception-entries"],
  });

  // Create reception entry mutation
  const createEntryMutation = useMutation({
    mutationFn: (data: Omit<InsertReceptionEntry, 'receptionUserId'>) => 
      apiRequest("/api/reception-entries", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "تم تسجيل السيارة بنجاح",
        description: "تم إرسال إشعار إلى قسم الورشة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reception-entries"] });
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التسجيل",
        description: error.message || "حدث خطأ أثناء تسجيل السيارة",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      carOwnerName: "",
      licensePlate: "",
      serviceType: "",
      complaints: "",
      odometerReading: 0,
      fuelLevel: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.carOwnerName || !formData.licensePlate || !formData.serviceType || !formData.fuelLevel) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    createEntryMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reception":
        return <Badge variant="secondary">في الاستقبال</Badge>;
      case "workshop":
        return <Badge variant="default">في الورشة</Badge>;
      case "completed":
        return <Badge variant="outline">مكتمل</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">جاري التحميل...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Car className="ml-2 h-5 w-5" />
              قسم الاستقبال
            </CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 ml-1" />
              تسجيل سيارة جديدة
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add new car form */}
          {showForm && (
            <Card className="border-blue-200 bg-blue-50 mb-6">
              <CardHeader>
                <CardTitle className="text-lg">تسجيل سيارة جديدة</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="carOwnerName">اسم صاحب السيارة *</Label>
                      <Input
                        id="carOwnerName"
                        value={formData.carOwnerName}
                        onChange={(e) => setFormData({ ...formData, carOwnerName: e.target.value })}
                        placeholder="أدخل اسم صاحب السيارة"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="licensePlate">رقم السيارة *</Label>
                      <Input
                        id="licensePlate"
                        value={formData.licensePlate}
                        onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                        placeholder="أدخل رقم السيارة"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="serviceType">نوع الصيانة المطلوبة *</Label>
                      <Select 
                        value={formData.serviceType} 
                        onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الصيانة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="صيانة دورية">صيانة دورية</SelectItem>
                          <SelectItem value="إصلاح عطل">إصلاح عطل</SelectItem>
                          <SelectItem value="فحص شامل">فحص شامل</SelectItem>
                          <SelectItem value="تغيير زيت">تغيير زيت</SelectItem>
                          <SelectItem value="إصلاح كهربائي">إصلاح كهربائي</SelectItem>
                          <SelectItem value="إصلاح ميكانيكي">إصلاح ميكانيكي</SelectItem>
                          <SelectItem value="برمجة">برمجة</SelectItem>
                          <SelectItem value="أخرى">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fuelLevel">مستوى البنزين *</Label>
                      <Select 
                        value={formData.fuelLevel} 
                        onValueChange={(value) => setFormData({ ...formData, fuelLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر مستوى البنزين" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ممتلئ">ممتلئ</SelectItem>
                          <SelectItem value="ثلاثة أرباع">ثلاثة أرباع</SelectItem>
                          <SelectItem value="نصف">نصف</SelectItem>
                          <SelectItem value="ربع">ربع</SelectItem>
                          <SelectItem value="فارغ تقريباً">فارغ تقريباً</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="odometerReading">عداد الكيلومترات *</Label>
                      <Input
                        id="odometerReading"
                        type="number"
                        value={formData.odometerReading}
                        onChange={(e) => setFormData({ ...formData, odometerReading: parseInt(e.target.value) || 0 })}
                        placeholder="أدخل قراءة العداد"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="complaints">الشكاوي والأعطال</Label>
                    <Textarea
                      id="complaints"
                      value={formData.complaints || ""}
                      onChange={(e) => setFormData({ ...formData, complaints: e.target.value })}
                      placeholder="اكتب الشكاوي والأعطال المطلوب إصلاحها"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createEntryMutation.isPending}>
                      {createEntryMutation.isPending ? "جاري التسجيل..." : "تسجيل السيارة"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Reception entries list */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">السيارات المسجلة</h3>
            {entries.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                لا توجد سيارات مسجلة حالياً
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry: ReceptionEntry) => (
                  <Card key={entry.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{entry.carOwnerName}</h4>
                            {getStatusBadge(entry.status)}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              {entry.licensePlate}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              نوع الصيانة: {entry.serviceType}
                            </div>
                            <div className="flex items-center gap-2">
                              <Fuel className="h-4 w-4" />
                              مستوى البنزين: {entry.fuelLevel}
                            </div>
                            <div className="flex items-center gap-2">
                              <Gauge className="h-4 w-4" />
                              العداد: {entry.odometerReading?.toLocaleString()} كم
                            </div>
                            {entry.complaints && (
                              <div className="text-gray-500 italic">
                                الشكاوي: {entry.complaints}
                              </div>
                            )}
                            <div className="text-xs text-gray-400">
                              وقت التسجيل: {new Date(entry.entryTime).toLocaleString('ar-SA')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}