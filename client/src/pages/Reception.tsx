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
import { Plus, Car, Clock, User, Phone, MapPin, Fuel, Gauge, Search } from "lucide-react";
import type { ReceptionEntry, InsertReceptionEntry, Customer, CustomerCar } from "@shared/schema";

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
  
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCar, setSelectedCar] = useState<CustomerCar | null>(null);

  // Fetch reception entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["/api/reception-entries"],
  });

  // Fetch customers for autofill
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Fetch customer cars for autofill
  const { data: customerCars = [] } = useQuery<CustomerCar[]>({
    queryKey: ["/api/customer-cars"],
  });

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.phoneNumber?.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  // Create reception entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (data: Omit<InsertReceptionEntry, 'receptionUserId'>) => {
      const response = await fetch("/api/reception-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create reception entry");
      }
      return response.json();
    },
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
    setCustomerSearchTerm("");
    setSelectedCustomer(null);
    setSelectedCar(null);
    setShowCustomerSuggestions(false);
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({ ...prev, carOwnerName: customer.name }));
    setCustomerSearchTerm(customer.name);
    setShowCustomerSuggestions(false);
    
    // Show cars for this customer
    const customerCarsForSelected = customerCars.filter(car => car.customerId === customer.id);
    if (customerCarsForSelected.length === 1) {
      // Auto-select if only one car
      handleCarSelect(customerCarsForSelected[0]);
    }
  };

  // Handle car selection
  const handleCarSelect = (car: CustomerCar) => {
    setSelectedCar(car);
    setFormData(prev => ({ 
      ...prev, 
      licensePlate: car.licensePlate,
      customerId: car.customerId,
      carId: car.id
    }));
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

    // Include customer and car IDs if selected
    const submitData: Omit<InsertReceptionEntry, 'receptionUserId'> = {
      ...formData,
      customerId: selectedCustomer?.id,
      carId: selectedCar?.id,
    };

    createEntryMutation.mutate(submitData);
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
                  {/* Customer and Car Selection - Combined in one row */}
                  <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                    <h4 className="font-medium mb-3 text-blue-800">بيانات الزبون والسيارة</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <Label htmlFor="customerSearch">اسم صاحب السيارة *</Label>
                        <div className="relative">
                          <Input
                            id="customerSearch"
                            value={customerSearchTerm}
                            onChange={(e) => {
                              setCustomerSearchTerm(e.target.value);
                              setFormData({ ...formData, carOwnerName: e.target.value });
                              setShowCustomerSuggestions(e.target.value.length > 0);
                            }}
                            placeholder="ابحث باسم الزبون أو رقم الجوال"
                            required
                          />
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        
                        {/* Customer suggestions dropdown */}
                        {showCustomerSuggestions && filteredCustomers.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                            {filteredCustomers.slice(0, 5).map((customer) => (
                              <div
                                key={customer.id}
                                className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                                onClick={() => handleCustomerSelect(customer)}
                              >
                                <div className="font-medium">{customer.name}</div>
                                {customer.phoneNumber && (
                                  <div className="text-sm text-gray-500">{customer.phoneNumber}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="licensePlate">رقم السيارة *</Label>
                        <div className="space-y-2">
                          <Input
                            id="licensePlate"
                            value={formData.licensePlate}
                            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                            placeholder="أدخل رقم السيارة"
                            required
                          />
                          
                          {/* Show customer cars if customer is selected */}
                          {selectedCustomer && (
                            <div className="space-y-1">
                              <Label className="text-sm text-gray-600">سيارات الزبون:</Label>
                              {customerCars
                                .filter(car => car.customerId === selectedCustomer.id)
                                .map((car) => (
                                  <div
                                    key={car.id}
                                    className={`p-2 border rounded cursor-pointer text-sm ${
                                      selectedCar?.id === car.id 
                                        ? 'border-blue-500 bg-blue-100' 
                                        : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                    onClick={() => handleCarSelect(car)}
                                  >
                                    <div className="font-medium">{car.licensePlate}</div>
                                    <div className="text-gray-500">{car.carBrand} {car.carModel}</div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Input
                        id="fuelLevel"
                        value={formData.fuelLevel}
                        onChange={(e) => setFormData({ ...formData, fuelLevel: e.target.value })}
                        placeholder="أدخل مستوى البنزين (مثال: 1/4، نصف، ممتلئ)"
                        required
                      />
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
            {(entries as ReceptionEntry[]).length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                لا توجد سيارات مسجلة حالياً
              </div>
            ) : (
              <div className="space-y-3">
                {(entries as ReceptionEntry[]).map((entry: ReceptionEntry) => (
                  <Card key={entry.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{entry.carOwnerName}</h4>
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
                              وقت التسجيل: {entry.entryTime ? new Date(entry.entryTime).toLocaleString('ar-SA') : 'غير محدد'}
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