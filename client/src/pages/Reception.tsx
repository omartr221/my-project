import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Car, Clock, User, Phone, MapPin, Fuel, Gauge, Search, Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { ReceptionEntry, InsertReceptionEntry, Customer, CustomerCar } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { ExcelImporter } from "@/components/ExcelImporter";
import LicensePlateCamera from "@/components/LicensePlateCamera";

export default function Reception() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<InsertReceptionEntry, 'receptionUserId'>>({
    carOwnerName: "",
    licensePlate: "",
    serviceType: "",
    complaints: "",
    odometerReading: 0,
    fuelLevel: "",
  });
  
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  // Timer state for automatic timer on car reception
  const [receptionTimer, setReceptionTimer] = useState<{[key: number]: {startTime: Date, elapsed: number, isRunning: boolean, pausedAt5PM?: boolean}}>({});
  
  // Tab state for navigation
  const [activeTab, setActiveTab] = useState<'reception' | 'camera' | 'import'>('reception');
  
  // Function to start reception timer with precise timing
  const startReceptionTimer = (entryId: number, entryTime?: Date) => {
    const startTime = entryTime || new Date(); // Use provided entry time or current time
    setReceptionTimer(prev => ({
      ...prev,
      [entryId]: {
        startTime: startTime, // Store the exact start time
        elapsed: 0,
        isRunning: true // Timer starts immediately upon car reception
      }
    }));
  };
  
  // Function to stop reception timer (pause)
  const pauseReceptionTimer = (entryId: number) => {
    setReceptionTimer(prev => {
      if (!prev[entryId]) return prev;
      const now = new Date();
      const additionalElapsed = prev[entryId].isRunning 
        ? Math.floor((now.getTime() - prev[entryId].startTime.getTime()) / 1000)
        : 0;
      
      return {
        ...prev,
        [entryId]: {
          ...prev[entryId],
          elapsed: prev[entryId].elapsed + additionalElapsed,
          isRunning: false
        }
      };
    });
  };

  // Function to resume reception timer
  const resumeReceptionTimer = (entryId: number) => {
    setReceptionTimer(prev => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        startTime: new Date(),
        isRunning: true
      }
    }));
  };

  // Function to finish timer and deliver car (only stops timer on actual delivery to customer)
  const finishTimerAndDeliver = async (entryId: number, licensePlate: string) => {
    // Stop the timer only when actually delivering to customer
    pauseReceptionTimer(entryId);
    
    // Update car status to delivered
    try {
      await fetch(`/api/reception-entries/${entryId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "مكتمل",
          completedBy: "reception"
        }),
      });
      
      toast({
        title: "تم تسليم السيارة",
        description: `تم انهاء المؤقت وتسليم السيارة ${licensePlate} بنجاح`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/reception-entries"] });
      
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسليم السيارة",
        variant: "destructive",
      });
    }
  };

  // Function to move car to workshop (for بدوي)
  const moveCarToWorkshop = async (entryId: number, licensePlate: string) => {
    try {
      await fetch(`/api/reception-entries/${entryId}/enter-workshop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      toast({
        title: "تم إدخال السيارة للورشة",
        description: `تم إدخال السيارة ${licensePlate} للورشة بنجاح`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/reception-entries"] });
      
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إدخال السيارة للورشة",
        variant: "destructive",
      });
    }
  };
  
  // Function to check if it's 5 PM Syria time and pause timers (but don't stop completely)
  const checkAndPauseTimers = useCallback(() => {
    const now = new Date();
    const syriaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Damascus"}));
    const currentHour = syriaTime.getHours();
    
    if (currentHour >= 17) { // 5 PM or later - pause but keep elapsed time
      setReceptionTimer(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          const entryId = parseInt(key);
          if (updated[entryId].isRunning) {
            const now = new Date();
            const additionalElapsed = Math.floor((now.getTime() - updated[entryId].startTime.getTime()) / 1000);
            updated[entryId] = {
              ...updated[entryId],
              elapsed: updated[entryId].elapsed + additionalElapsed,
              isRunning: false,
              pausedAt5PM: true
            };
          }
        });
        return updated;
      });
    }
  }, []);
  
  // Function to format timer display
  const formatTimerDisplay = (entryId: number) => {
    const timer = receptionTimer[entryId];
    if (!timer) return "00:00:00";
    
    const now = new Date();
    const elapsed = timer.isRunning 
      ? Math.floor((now.getTime() - timer.startTime.getTime()) / 1000) + timer.elapsed
      : timer.elapsed;
      
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const serviceOptions = [
    "صيانة دورية",
    "إصلاح عطل", 
    "فحص شامل",
    "تغيير زيت",
    "برمجة"
  ];
  
  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => {
      const updated = prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service];
      
      // Update form data with concatenated services
      setFormData(prevData => ({
        ...prevData,
        serviceType: updated.join(", ")
      }));
      
      return updated;
    });
  };
  
  // Function to check odometer reading against previous entries
  const checkOdometerReading = async (newOdometer: number, customerId: number) => {
    try {
      // Get previous reception entries for this customer
      const response = await fetch(`/api/reception-entries?customerId=${customerId}`);
      if (!response.ok) return;
      
      const customerEntries = await response.json();
      if (customerEntries.length === 0) return;
      
      // Find the most recent entry with higher odometer
      const sortedEntries = customerEntries
        .filter((entry: ReceptionEntry) => (entry.odometerReading || 0) > newOdometer)
        .sort((a: ReceptionEntry, b: ReceptionEntry) => 
          (b.id || 0) - (a.id || 0)
        );
      
      if (sortedEntries.length > 0) {
        const lastHigherEntry = sortedEntries[0];
        toast({
          title: "تنبيه: عداد الدخول",
          description: `عداد الدخول المدخل (${newOdometer}) أقل من آخر زيارة (${lastHigherEntry.odometerReading || 0}). يرجى التحقق من القراءة.`,
          variant: "destructive",
          duration: 8000,
        });
      }
    } catch (error) {
      console.error('Error checking odometer reading:', error);
    }
  };
  
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCar, setSelectedCar] = useState<CustomerCar | null>(null);

  // معالج لبيانات الزبون من الكاميرا
  const handleCameraCustomerFound = (customerData: any) => {
    console.log('📸 تم العثور على بيانات الزبون من الكاميرا:', customerData);
    
    // ملء النموذج ببيانات الزبون
    setFormData(prev => ({
      ...prev,
      carOwnerName: customerData.customerName,
      licensePlate: customerData.licensePlate,
    }));

    // تحضير تفاصيل السيارة الكاملة
    const carDetails = [
      `🚗 السيارة: ${customerData.carBrand || 'غير محدد'} ${customerData.carModel || ''}`,
      customerData.year ? `📅 سنة الصنع: ${customerData.year}` : null,
      customerData.color ? `🎨 اللون: ${customerData.color}` : null,
      customerData.engineCode ? `🔧 كود المحرك: ${customerData.engineCode}` : null,
      customerData.chassisNumber ? `🔍 رقم الشاسيه: ${customerData.chassisNumber}` : null,
      customerData.previousLicensePlate ? `🔄 رقم اللوحة السابق: ${customerData.previousLicensePlate}` : null
    ].filter(Boolean);

    // عرض كافة تفاصيل السيارة
    toast({
      title: `✅ تم العثور على الزبون: ${customerData.customerName}`,
      description: carDetails.join('\n'),
      duration: 10000,
    });
  };

  // Fetch reception entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["/api/reception-entries"],
  });

  // Timer effect for updating display and checking 5 PM cutoff
  useEffect(() => {
    const interval = setInterval(() => {
      // Update timer display by forcing re-render
      setReceptionTimer(prev => ({ ...prev }));
      
      // Check if it's past 5 PM Syria time and pause timers
      checkAndPauseTimers();
    }, 1000);

    return () => clearInterval(interval);
  }, [checkAndPauseTimers]);

  // Initialize timers for existing entries with accurate timing - only for reception status
  useEffect(() => {
    if (Array.isArray(entries) && entries.length > 0) {
      (entries as ReceptionEntry[]).forEach((entry: ReceptionEntry) => {
        if (!receptionTimer[entry.id] && entry.status !== "مكتمل") {
          // Use the exact entry time from database for accurate timing
          const entryTime = entry.entryTime ? new Date(entry.entryTime) : new Date();
          const now = new Date();
          // Calculate precise elapsed time in seconds
          const preciseElapsed = Math.floor((now.getTime() - entryTime.getTime()) / 1000);
          
          setReceptionTimer(prev => ({
            ...prev,
            [entry.id]: {
              startTime: entryTime, // Store the exact entry time
              elapsed: Math.max(0, preciseElapsed),
              isRunning: true // المؤقت يعمل من الاستقبال حتى التسليم للزبون
            }
          }));
        }
      });
    }
  }, [entries]);

  // Fetch customers for autofill
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Fetch customer cars for autofill
  const { data: customerCars = [] } = useQuery<CustomerCar[]>({
    queryKey: ["/api/customer-cars"],
  });

  // Fetch parts requests for cars in reception with auto-refresh every 5 seconds
  const { data: partsRequests = [] } = useQuery({
    queryKey: ["/api/parts-requests"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    const searchLower = customerSearchTerm.toLowerCase();
    
    // البحث في اسم الزبون
    const nameMatch = customer.name.toLowerCase().includes(searchLower);
    
    // البحث في رقم الهاتف (إذا لم يكن فارغاً)
    const phoneMatch = customer.phoneNumber?.toLowerCase().includes(searchLower);
    
    // البحث في أرقام الشاسيه لسيارات هذا الزبون
    const customerCarData = customerCars.filter(car => car.customerId === customer.id);
    const chassisMatch = customerCarData.some(car => 
      car.chassisNumber?.toLowerCase().includes(searchLower)
    );
    
    return nameMatch || phoneMatch || chassisMatch;
  });

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
    onSuccess: (newEntry) => {
      toast({
        title: "تم استقبال السيارة بنجاح",
        description: "تم بدء المؤقت التلقائي وإرسال إشعار إلى قسم الورشة",
      });
      
      // Start automatic timer for the new reception entry with exact entry time
      const entryTime = newEntry.entryTime ? new Date(newEntry.entryTime) : new Date();
      startReceptionTimer(newEntry.id, entryTime);
      
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
    setSelectedServices([]);
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
    
    if (!formData.carOwnerName || !formData.licensePlate || selectedServices.length === 0 || !formData.fuelLevel) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة وتحديد نوع الصيانة",
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
            {activeTab === 'reception' && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 ml-1" />
                استقبال سيارة
              </Button>
            )}
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-4 border-b">
            <button
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === 'reception' 
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('reception')}
            >
              <Car className="ml-2 h-4 w-4 inline" />
              استقبال السيارات
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === 'camera' 
                  ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-500' 
                  : 'text-gray-600 hover:text-purple-600'
              }`}
              onClick={() => setActiveTab('camera')}
            >
              📸 كاميرا رقم اللوحة
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === 'import' 
                  ? 'bg-green-100 text-green-700 border-b-2 border-green-500' 
                  : 'text-gray-600 hover:text-green-600'
              }`}
              onClick={() => setActiveTab('import')}
            >
              <Settings className="ml-2 h-4 w-4 inline" />
              استيراد من Excel
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tab Content */}
          {activeTab === 'reception' && (
            <>
              {/* Add new car form */}
              {showForm && (
            <Card className="border-blue-200 bg-blue-50 mb-6">
              <CardHeader>
                <CardTitle className="text-lg">استقبال سيارة جديدة</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Customer and Car Selection - Combined in one row */}
                  <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-blue-800">بيانات الزبون والسيارة</h4>
                      <div className="flex gap-2">
                        <LicensePlateCamera onCustomerFound={handleCameraCustomerFound} />
                      </div>
                    </div>
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
                            placeholder="ابحث باسم الزبون أو رقم الجوال أو رقم الشاسيه"
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
                      <Label>نوع الصيانة المطلوبة * (يمكن اختيار أكثر من خيار)</Label>
                      <div className="space-y-2 mt-2 p-3 border rounded-md bg-gray-50">
                        {serviceOptions.map((service) => (
                          <div key={service} className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox
                              id={service}
                              checked={selectedServices.includes(service)}
                              onCheckedChange={() => handleServiceToggle(service)}
                            />
                            <Label htmlFor={service} className="text-sm font-normal cursor-pointer">
                              {service}
                            </Label>
                          </div>
                        ))}
                        {selectedServices.length > 0 && (
                          <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
                            <strong>المحدد:</strong> {selectedServices.join(", ")}
                          </div>
                        )}
                      </div>
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
                      <Label htmlFor="odometerReading">عداد الدخول *</Label>
                      <Input
                        id="odometerReading"
                        type="number"
                        value={formData.odometerReading}
                        onChange={(e) => {
                          const newOdometer = parseInt(e.target.value) || 0;
                          setFormData({ ...formData, odometerReading: newOdometer });
                          
                          // Check if customer is selected and has previous entries
                          if (selectedCustomer && newOdometer > 0) {
                            checkOdometerReading(newOdometer, selectedCustomer.id);
                          }
                        }}
                        placeholder="أدخل قراءة عداد الدخول"
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
                      {createEntryMutation.isPending ? "جاري الاستقبال..." : "استقبال السيارة"}
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
            {(entries as ReceptionEntry[]).filter(entry => entry.status !== "مكتمل").length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                لا توجد سيارات مسجلة حالياً
              </div>
            ) : (
              <div className="space-y-3">
                {(entries as ReceptionEntry[]).filter(entry => entry.status !== "مكتمل").map((entry: ReceptionEntry) => (
                  <Card key={entry.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{entry.carOwnerName}</h4>
                            <Badge 
                              variant={
                                (entry.status === "في الاستقبال" || entry.status === "reception") ? "default" : 
                                (entry.status === "في الورشة" || entry.status === "workshop") ? "secondary" : 
                                entry.status === "مكتمل" ? "outline" : "destructive"
                              }
                            >
                              {entry.status === "reception" ? "في الاستقبال" : 
                               entry.status === "workshop" ? "في الورشة" : 
                               entry.status}
                            </Badge>
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
                              عداد الدخول: {entry.odometerReading?.toLocaleString()} كم
                            </div>
                            
                            {/* Timer display */}
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span className={`font-mono text-sm px-2 py-1 rounded ${
                                receptionTimer[entry.id]?.isRunning 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                المؤقت: {formatTimerDisplay(entry.id)}
                                {receptionTimer[entry.id]?.isRunning && (
                                  <span className="ml-1 text-green-600">●</span>
                                )}
                              </span>
                            </div>
                            {entry.complaints && (
                              <div className="text-gray-500 italic">
                                الشكاوي: {entry.complaints}
                              </div>
                            )}
                            
                            {/* عرض طلبات القطع للسيارة - محسن */}
                            {(() => {
                              const carPartsRequests = Array.isArray(partsRequests) ? (partsRequests as any[]).filter((req: any) => 
                                req.licensePlate === entry.licensePlate
                              ) : [];
                              if (carPartsRequests.length > 0) {
                                const pendingCount = carPartsRequests.filter((req: any) => req.status === 'pending').length;
                                const deliveredCount = carPartsRequests.filter((req: any) => req.status === 'delivered').length;
                                const inProgressCount = carPartsRequests.filter((req: any) => 
                                  ['approved', 'in_preparation', 'awaiting_pickup'].includes(req.status)
                                ).length;
                                
                                return (
                                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="text-sm font-bold text-blue-900">
                                        طلبات القطع ({carPartsRequests.length})
                                      </div>
                                      <div className="flex gap-2 text-xs">
                                        {pendingCount > 0 && (
                                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                            {pendingCount} معلق
                                          </span>
                                        )}
                                        {inProgressCount > 0 && (
                                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                            {inProgressCount} تحت التنفيذ
                                          </span>
                                        )}
                                        {deliveredCount > 0 && (
                                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                            {deliveredCount} مكتمل
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-2">
                                      {carPartsRequests
                                        .sort((a: any, b: any) => {
                                          const statusOrder = { 'pending': 1, 'approved': 2, 'in_preparation': 3, 'awaiting_pickup': 4, 'delivered': 5 };
                                          return (statusOrder[a.status as keyof typeof statusOrder] || 6) - (statusOrder[b.status as keyof typeof statusOrder] || 6);
                                        })
                                        .slice(0, 4)
                                        .map((req: any) => {
                                          const statusColors = {
                                            'pending': 'bg-yellow-100 border-yellow-300 text-yellow-800',
                                            'approved': 'bg-green-100 border-green-300 text-green-800',
                                            'in_preparation': 'bg-blue-100 border-blue-300 text-blue-800',
                                            'awaiting_pickup': 'bg-purple-100 border-purple-300 text-purple-800',
                                            'delivered': 'bg-gray-100 border-gray-300 text-gray-700'
                                          };
                                          
                                          const statusLabels = {
                                            'pending': 'قيد المراجعة',
                                            'approved': 'تم الموافقة',
                                            'in_preparation': 'قيد التحضير',
                                            'awaiting_pickup': 'بانتظار الاستلام',
                                            'delivered': 'تم التسليم'
                                          };
                                          
                                          return (
                                            <div key={req.id} className={`p-2 border rounded ${statusColors[req.status as keyof typeof statusColors] || 'bg-gray-100 border-gray-300 text-gray-700'}`}>
                                              <div className="flex justify-between items-start">
                                                <div className="font-medium text-sm">{req.partName}</div>
                                                <div className="text-xs font-medium">
                                                  {statusLabels[req.status as keyof typeof statusLabels] || req.status}
                                                </div>
                                              </div>
                                              <div className="text-xs mt-1 opacity-80">
                                                طلب رقم: {req.requestNumber} | المهندس: {req.engineerName}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      
                                      {carPartsRequests.length > 4 && (
                                        <div className="text-center text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                          +{carPartsRequests.length - 4} طلبات إضافية أخرى
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                            
                            <div className="text-xs text-gray-400">
                              وقت التسجيل: {entry.entryTime ? new Date(entry.entryTime).toLocaleString('ar-SA') : 'غير محدد'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Timer controls and action buttons */}
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          {/* Timer control buttons - only show for reception status */}
                          {(entry.status === "في الاستقبال" || entry.status === "reception") && (
                            <div className="flex flex-col gap-1">
                              <Button
                                size="sm"
                                variant={receptionTimer[entry.id]?.isRunning ? "destructive" : "default"}
                                onClick={() => {
                                  if (receptionTimer[entry.id]?.isRunning) {
                                    // إدخال للورشة بدون إيقاف المؤقت - المؤقت يستمر حتى التسليم
                                    moveCarToWorkshop(entry.id, entry.licensePlate);
                                  } else {
                                    resumeReceptionTimer(entry.id);
                                  }
                                }}
                              >
                                {receptionTimer[entry.id]?.isRunning ? "إدخال للورشة" : "استئناف المؤقت"}
                              </Button>
                            </div>
                          )}
                          
                          {/* Show completed status */}
                          {entry.status === "مكتمل" && (
                            <div className="text-center p-2 bg-green-50 rounded">
                              <div className="text-sm text-green-600 font-medium">
                                تم التسليم ✓
                              </div>
                              <div className="text-xs text-gray-500">
                                الوقت الإجمالي: {formatTimerDisplay(entry.id)}
                              </div>
                            </div>
                          )}
                          
                          {/* Show in workshop status */}
                          {(entry.status === "في الورشة" || entry.status === "workshop") && (
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <div className="text-sm text-blue-600 font-medium">
                                في الورشة
                              </div>
                              <div className="text-xs text-gray-500">
                                المؤقت الإجمالي: {formatTimerDisplay(entry.id)}
                              </div>
                              <div className="text-xs text-blue-400">
                                (المؤقت يستمر حتى التسليم)
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
            </>
          )}
          
          {/* Camera tab content */}
          {activeTab === 'camera' && (
            <div className="p-6">
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    📸 كاميرا رقم اللوحة - البحث السريع
                  </CardTitle>
                  <CardDescription>
                    التقط صورة لرقم اللوحة وسيتم البحث عن بيانات الزبون تلقائياً
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LicensePlateCamera onCustomerFound={(customer) => {
                    // Switch to reception tab and pre-fill the form
                    setActiveTab('reception');
                    setSelectedCustomer(customer);
                    setFormData(prev => ({
                      ...prev,
                      customerName: customer.customerName,
                      carBrand: customer.carBrand,
                      carModel: customer.carModel,
                      licensePlate: customer.licensePlate,
                      chassisNumber: customer.chassisNumber || '',
                      engineCode: customer.engineCode || '',
                      year: customer.year || new Date().getFullYear(),
                      color: customer.color || ''
                    }));
                    setShowForm(true);
                    toast({
                      title: "تم العثور على بيانات الزبون",
                      description: `تم تحديد الزبون: ${customer.customerName} - ${customer.carBrand} ${customer.carModel}`,
                    });
                  }} />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab Content for Import */}
          {activeTab === 'import' && (
            <div>
              <ExcelImporter />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}