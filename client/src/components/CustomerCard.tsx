import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Save, X, User, Car, Phone, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getCarBrandInArabic } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-auth";
import { type Customer, type CustomerCar, type InsertCustomer, type InsertCustomerCar, type CustomerWithCars } from "@shared/schema";

// Car models by brand
const getModelsByBrand = (brand: string): string[] => {
  switch (brand) {
    case "AUDI":
      return ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "TT", "R8", "e-tron", "e-tron GT", "RS3", "RS4", "RS5", "RS6", "RS7", "RS Q3", "RS Q8", "أخرى"];
    case "VOLKSWAGEN":
      return ["Golf", "Jetta", "Passat", "Passat cc", "Polo", "Tiguan", "Touareg", "Arteon", "T-Cross", "T-Roc", "Sharan", "Touran", "Caddy", "Crafter", "Amarok", "ID.3", "ID.4", "أخرى"];
    case "SKODA":
      return ["Fabia", "Octavia", "Superb", "Kamiq", "Karoq", "Kodiaq", "Scala", "Rapid", "Yeti", "Citigo", "Enyaq", "أخرى"];
    case "SEAT":
      return ["Ibiza", "Leon", "Ateca", "Tarraco", "Arona", "Mii", "Alhambra", "Toledo", "Altea", "Cupra", "أخرى"];
    case "PORSCHE":
      return ["911", "Cayenne", "Macan", "Panamera", "Taycan", "718 Boxster", "718 Cayman", "Carrera", "Turbo", "GT3", "أخرى"];
    default:
      return [];
  }
};

export default function CustomerCard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [editingCar, setEditingCar] = useState<CustomerCar | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const { canWrite, isFinance, isOperator } = usePermissions();

  const [customerForm, setCustomerForm] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    notes: "",
    customerStatus: "A" as "A" | "B" | "C",
    carBrand: "",
    carModel: "",
    customModel: "",
    year: "",
    color: "",
    engineCode: "",
    chassisNumber: "",
    licensePlate: "",
    previousLicensePlate: "",
    previousOwner: "",
  });

  const [carForm, setCarForm] = useState({
    carBrand: "",
    carModel: "",
    customModel: "",
    licensePlate: "",
    previousLicensePlate: "",
    color: "",
    year: "",
    engineCode: "",
    chassisNumber: "",
    previousOwner: "",
    notes: "",
  });

  // Fetch customers data
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
  });

  // Fetch customer cars data  
  const { data: customerCars = [] } = useQuery<CustomerCar[]>({
    queryKey: ['/api/customer-cars'],
  });

  const filteredCustomers = customers.filter((customer: Customer) => {
    const searchLower = searchTerm.toLowerCase();
    
    // البحث في اسم الزبون
    const nameMatch = customer.name.toLowerCase().includes(searchLower);
    
    // البحث في أرقام اللوحات لسيارات هذا الزبون
    const customerCarData = customerCars.filter(car => car.customerId === customer.id);
    const licensePlateMatch = customerCarData.some(car => 
      car.licensePlate.toLowerCase().includes(searchLower)
    );
    
    // البحث في أرقام الشاسيه لسيارات هذا الزبون
    const chassisMatch = customerCarData.some(car => 
      car.chassisNumber?.toLowerCase().includes(searchLower)
    );
    
    return nameMatch || licensePlateMatch || chassisMatch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSelectedCustomer(null); // Close any open customer details
  };

  // Reset page when search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const resetCustomerForm = () => {
    setCustomerForm({
      name: "",
      phoneNumber: "",
      address: "",
      notes: "",
      customerStatus: "A" as "A" | "B" | "C",
      carBrand: "",
      carModel: "",
      customModel: "",
      year: "",
      color: "",
      engineCode: "",
      chassisNumber: "",
      licensePlate: "",
      previousLicensePlate: "",
      previousOwner: "",
    });
  };

  const resetCarForm = () => {
    setCarForm({
      carBrand: "",
      carModel: "",
      customModel: "",
      licensePlate: "",
      previousLicensePlate: "",
      color: "",
      year: "",
      engineCode: "",
      chassisNumber: "",
      previousOwner: "",
      notes: "",
    });
  };

  const addCustomerMutation = useMutation({
    mutationFn: async (data: InsertCustomer) => {
      // Check for duplicate customer name before creating
      if (customers && customers.some(c => c.name.toLowerCase().trim() === data.name.toLowerCase().trim())) {
        throw new Error(`زبون بالاسم "${data.name}" موجود مسبقاً. يرجى استخدام اسم مختلف أو رقم هاتف مختلف.`);
      }
      
      // First create the customer
      const customerResponse = await apiRequest("POST", "/api/customers", data);
      const customer = await customerResponse.json();
      
      // Then create the car for this customer
      const carData: InsertCustomerCar = {
        customerId: customer.id,
        carBrand: customerForm.carBrand,
        carModel: customerForm.carModel === "أخرى" ? customerForm.customModel : customerForm.carModel,
        licensePlate: customerForm.licensePlate,
        previousLicensePlate: customerForm.previousLicensePlate || undefined,
        color: customerForm.color || undefined,
        year: customerForm.year ? parseInt(customerForm.year) : undefined,
        engineCode: customerForm.engineCode || undefined,
        chassisNumber: customerForm.chassisNumber || undefined,
      };
      
      await apiRequest("POST", "/api/customer-cars", carData);
      
      return customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customer-cars"] });
      toast({
        title: "تم إضافة الزبون بنجاح",
        description: `تم إضافة ${customerForm.name} والسيارة إلى قاعدة البيانات`,
      });
      resetCustomerForm();
      setShowAddForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إضافة الزبون",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddCustomer = () => {
    // Validate required fields
    const effectiveCarModel = customerForm.carModel === "أخرى" ? customerForm.customModel : customerForm.carModel;
    if (!customerForm.name || !customerForm.phoneNumber || !customerForm.carBrand || 
        !effectiveCarModel || !customerForm.year || !customerForm.color || 
        !customerForm.engineCode || !customerForm.chassisNumber || !customerForm.licensePlate) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال جميع البيانات المطلوبة",
        variant: "destructive",
      });
      return;
    }

    // Validate chassis number length
    if (customerForm.chassisNumber && customerForm.chassisNumber.length !== 17) {
      toast({
        title: "خطأ في رقم الشاسيه",
        description: "رقم الشاسيه يجب أن يكون 17 حرف ورقم بالضبط",
        variant: "destructive",
      });
      return;
    }

    // Create customer data (name, phone, and status for customer table)
    const customerData: InsertCustomer = {
      name: customerForm.name,
      phoneNumber: customerForm.phoneNumber,
      address: customerForm.address || undefined,
      notes: customerForm.notes || undefined,
      customerStatus: customerForm.customerStatus,
    };

    // Create mutation that will also create the car
    addCustomerMutation.mutate(customerData);
  };

  const addCarMutation = useMutation({
    mutationFn: async (data: InsertCustomerCar) => {
      const response = await apiRequest("POST", "/api/customer-cars", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-cars"] });
      toast({
        title: "تم إضافة السيارة بنجاح",
        description: `تم إضافة ${getCarBrandInArabic(carForm.carBrand)} ${carForm.carModel} للزبون ${selectedCustomer?.name}`,
      });
      resetCarForm();
      setShowAddCarForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إضافة السيارة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddCar = () => {
    const effectiveCarModel = carForm.carModel === "أخرى" ? carForm.customModel : carForm.carModel;
    if (!selectedCustomer || !carForm.carBrand || !effectiveCarModel || !carForm.licensePlate) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال جميع البيانات المطلوبة للسيارة",
        variant: "destructive",
      });
      return;
    }

    // Validate chassis number length if provided
    if (carForm.chassisNumber && carForm.chassisNumber.length !== 17) {
      toast({
        title: "خطأ في رقم الشاسيه",
        description: "رقم الشاسيه يجب أن يكون 17 حرف ورقم بالضبط",
        variant: "destructive",
      });
      return;
    }

    const carData: InsertCustomerCar = {
      customerId: selectedCustomer.id,
      carBrand: carForm.carBrand,
      carModel: carForm.carModel === "أخرى" ? carForm.customModel : carForm.carModel,
      licensePlate: carForm.licensePlate,
      previousLicensePlate: carForm.previousLicensePlate || undefined,
      color: carForm.color || undefined,
      year: carForm.year ? parseInt(carForm.year) : undefined,
      engineCode: carForm.engineCode || undefined,
      chassisNumber: carForm.chassisNumber || undefined,
      previousOwner: carForm.previousOwner || undefined,
      notes: carForm.notes || undefined,
    };

    addCarMutation.mutate(carData);
  };

  const editCarMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<InsertCustomerCar> }) => {
      const response = await apiRequest("PUT", `/api/customer-cars/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-cars"] });
      toast({
        title: "تم تحديث السيارة بنجاح",
        description: "تم تحديث بيانات السيارة بنجاح",
      });
      setEditingCar(null);
      resetCarForm();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تحديث السيارة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditCar = () => {
    if (!editingCar) return;

    const chassisNumber = carForm.chassisNumber || editingCar.chassisNumber || "";
    
    // Validate chassis number length if provided
    if (chassisNumber && chassisNumber.length !== 17) {
      toast({
        title: "خطأ في رقم الشاسيه",
        description: "رقم الشاسيه يجب أن يكون 17 حرف ورقم بالضبط",
        variant: "destructive",
      });
      return;
    }

    const updates: Partial<InsertCustomerCar> = {
      carBrand: carForm.carBrand || editingCar.carBrand,
      carModel: (carForm.carModel === "أخرى" ? carForm.customModel : carForm.carModel) || editingCar.carModel,
      licensePlate: carForm.licensePlate || editingCar.licensePlate,
      previousLicensePlate: carForm.previousLicensePlate || editingCar.previousLicensePlate || undefined,
      color: carForm.color || editingCar.color || undefined,
      year: carForm.year ? parseInt(carForm.year) : editingCar.year || undefined,
      engineCode: carForm.engineCode || editingCar.engineCode || undefined,
      chassisNumber: chassisNumber || undefined,
      previousOwner: carForm.previousOwner || editingCar.previousOwner || undefined,
      notes: carForm.notes || editingCar.notes || undefined,
    };

    editCarMutation.mutate({ id: editingCar.id, updates });
  };

  const editCustomerMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<InsertCustomer> }) => {
      const response = await apiRequest("PUT", `/api/customers/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "تم تحديث الزبون بنجاح",
        description: "تم تحديث بيانات الزبون بنجاح",
      });
      setEditingCustomer(null);
      resetCustomerForm();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تحديث الزبون",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditCustomer = () => {
    if (!editingCustomer) return;

    const updates: Partial<InsertCustomer> = {
      name: customerForm.name || editingCustomer.name,
      phoneNumber: customerForm.phoneNumber || editingCustomer.phoneNumber,
      address: customerForm.address || editingCustomer.address || undefined,
      notes: customerForm.notes || editingCustomer.notes || undefined,
      customerStatus: customerForm.customerStatus || editingCustomer.customerStatus,
    };

    editCustomerMutation.mutate({ id: editingCustomer.id, updates });
  };

  const getCustomerCars = (customerId: number) => {
    return customerCars.filter((car: CustomerCar) => car.customerId === customerId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="ml-2 h-5 w-5" />
            إدارة بطاقات الزبائن
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن سيارة (اسم صاحب السيارة، رقم اللوحة، رقم الشاسيه)"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pr-10"
                />
              </div>
              {canWrite("customers") && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة زبون جديد
                </Button>
              )}
            </div>

            {/* Add Customer Form */}
            {showAddForm && canWrite("customers") && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg">إضافة زبون جديد</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customerName">اسم الزبون *</Label>
                      <Input
                        id="customerName"
                        value={customerForm.name}
                        onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                        placeholder="أدخل اسم الزبون"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone">الهاتف *</Label>
                      <Input
                        id="customerPhone"
                        value={customerForm.phoneNumber}
                        onChange={(e) => setCustomerForm({...customerForm, phoneNumber: e.target.value})}
                        placeholder="0991234567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerStatus">تصنيف الزبون *</Label>
                      <Select value={customerForm.customerStatus} onValueChange={(value) => setCustomerForm({...customerForm, customerStatus: value as "A" | "B" | "C"})}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر تصنيف الزبون" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A - ممتاز</SelectItem>
                          <SelectItem value="B">B - جيد</SelectItem>
                          <SelectItem value="C">C - عادي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="carBrand">الصانع *</Label>
                      <Select value={customerForm.carBrand} onValueChange={(value) => setCustomerForm({...customerForm, carBrand: value, carModel: ""})}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الصانع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AUDI">AUDI</SelectItem>
                          <SelectItem value="VOLKSWAGEN">VOLKSWAGEN</SelectItem>
                          <SelectItem value="SKODA">SKODA</SelectItem>
                          <SelectItem value="SEAT">SEAT</SelectItem>
                          <SelectItem value="PORSCHE">PORSCHE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="carModel">الطراز *</Label>
                      <Select value={customerForm.carModel} onValueChange={(value) => setCustomerForm({...customerForm, carModel: value, customModel: ""})}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الطراز" />
                        </SelectTrigger>
                        <SelectContent>
                          {getModelsByBrand(customerForm.carBrand).map((model) => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {customerForm.carModel === "أخرى" && (
                      <div>
                        <Label htmlFor="customModel">اكتب الطراز *</Label>
                        <Input
                          id="customModel"
                          value={customerForm.customModel}
                          onChange={(e) => setCustomerForm({...customerForm, customModel: e.target.value})}
                          placeholder="أدخل اسم الطراز"
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="carYear">سنة الصنع *</Label>
                      <Input
                        id="carYear"
                        value={customerForm.year}
                        onChange={(e) => setCustomerForm({...customerForm, year: e.target.value})}
                        placeholder="2020"
                        type="number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="carColor">اللون *</Label>
                      <Select value={customerForm.color} onValueChange={(value) => setCustomerForm({...customerForm, color: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر اللون" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="أبيض">أبيض</SelectItem>
                          <SelectItem value="أسود">أسود</SelectItem>
                          <SelectItem value="أزرق">أزرق</SelectItem>
                          <SelectItem value="أحمر">أحمر</SelectItem>
                          <SelectItem value="أخضر">أخضر</SelectItem>
                          <SelectItem value="أصفر">أصفر</SelectItem>
                          <SelectItem value="برتقالي">برتقالي</SelectItem>
                          <SelectItem value="بنفسجي">بنفسجي</SelectItem>
                          <SelectItem value="وردي">وردي</SelectItem>
                          <SelectItem value="بني">بني</SelectItem>
                          <SelectItem value="رمادي">رمادي</SelectItem>
                          <SelectItem value="فضي">فضي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="engineCode">رمز المحرك *</Label>
                      <Input
                        id="engineCode"
                        value={customerForm.engineCode}
                        onChange={(e) => setCustomerForm({...customerForm, engineCode: e.target.value.toUpperCase()})}
                        placeholder="أدخل رمز المحرك"
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="chassisNumber">رقم الشاسيه * (17 حرف ورقم)</Label>
                      <Input
                        id="chassisNumber"
                        value={customerForm.chassisNumber}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                          if (value.length <= 17) {
                            setCustomerForm({...customerForm, chassisNumber: value});
                          }
                        }}
                        placeholder="أدخل رقم الشاسيه (17 حرف ورقم)"
                        maxLength={17}
                      />
                      {customerForm.chassisNumber && customerForm.chassisNumber.length !== 17 && (
                        <p className="text-red-500 text-sm mt-1">
                          رقم الشاسيه يجب أن يكون 17 حرف ورقم بالضبط (حالياً: {customerForm.chassisNumber.length})
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="previousOwner">المالك السابق (اختياري)</Label>
                      <Input
                        id="previousOwner"
                        value={customerForm.previousOwner}
                        onChange={(e) => setCustomerForm({...customerForm, previousOwner: e.target.value})}
                        placeholder="اسم المالك السابق إن وجد"
                      />
                    </div>
                    <div>
                      <Label htmlFor="licensePlate">رقم اللوحة *</Label>
                      <Input
                        id="licensePlate"
                        value={customerForm.licensePlate}
                        onChange={(e) => setCustomerForm({...customerForm, licensePlate: e.target.value})}
                        placeholder="أدخل رقم اللوحة"
                      />
                    </div>
                    <div>
                      <Label htmlFor="previousLicensePlate">رقم اللوحة السابق (اختياري)</Label>
                      <Input
                        id="previousLicensePlate"
                        value={customerForm.previousLicensePlate}
                        onChange={(e) => setCustomerForm({...customerForm, previousLicensePlate: e.target.value})}
                        placeholder="أدخل رقم اللوحة السابق إن وجد"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleAddCustomer}>
                      <Save className="h-4 w-4 ml-1" />
                      حفظ الزبون
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setShowAddForm(false);
                      resetCustomerForm();
                    }}>
                      <X className="h-4 w-4 ml-1" />
                      إلغاء
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edit Customer Form */}
            {editingCustomer && canWrite("customers") && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">تعديل بيانات الزبون</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCustomer(null);
                        resetCustomerForm();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editCustomerName">اسم الزبون *</Label>
                      <Input
                        id="editCustomerName"
                        value={customerForm.name || editingCustomer.name}
                        onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                        placeholder="أدخل اسم الزبون"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editCustomerPhone">الهاتف *</Label>
                      <Input
                        id="editCustomerPhone"
                        value={customerForm.phoneNumber || editingCustomer.phoneNumber}
                        onChange={(e) => setCustomerForm({...customerForm, phoneNumber: e.target.value})}
                        placeholder="أدخل رقم الهاتف"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editCustomerAddress">العنوان</Label>
                      <Input
                        id="editCustomerAddress"
                        value={customerForm.address || editingCustomer.address || ""}
                        onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                        placeholder="أدخل العنوان"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editCustomerStatus">تصنيف الزبون *</Label>
                      <Select 
                        value={customerForm.customerStatus || editingCustomer.customerStatus} 
                        onValueChange={(value) => setCustomerForm({...customerForm, customerStatus: value as "A" | "B" | "C"})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر تصنيف الزبون" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A - ممتاز</SelectItem>
                          <SelectItem value="B">B - جيد</SelectItem>
                          <SelectItem value="C">C - ضعيف</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="editCustomerNotes">ملاحظات</Label>
                      <Input
                        id="editCustomerNotes"
                        value={customerForm.notes || editingCustomer.notes || ""}
                        onChange={(e) => setCustomerForm({...customerForm, notes: e.target.value})}
                        placeholder="أي ملاحظات إضافية"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleEditCustomer} disabled={editCustomerMutation.isPending}>
                      {editCustomerMutation.isPending ? "جاري التحديث..." : "تحديث الزبون"}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setEditingCustomer(null);
                      resetCustomerForm();
                    }}>
                      إلغاء
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Customer List */}
            <div className="space-y-3">
              {currentCustomers.map((customer) => (
                <Card key={customer.id} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{customer.name}</h3>
                          <Badge 
                            variant={
                              customer.customerStatus === 'A' ? 'default' : 
                              customer.customerStatus === 'B' ? 'secondary' : 
                              'destructive'
                            }
                            className="text-xs font-bold"
                          >
                            {customer.customerStatus}
                          </Badge>
                          <Badge variant="outline">
                            {getCustomerCars(customer.id).length} سيارة
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {customer.phoneNumber}
                          </div>
                          {customer.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {customer.address}
                            </div>
                          )}
                          {customer.notes && (
                            <div className="text-gray-500 italic">
                              {customer.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <Car className="h-4 w-4 ml-1" />
                          السيارات
                        </Button>
                        {canWrite("customers") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCustomer(customer);
                              // Load customer data into form
                              setCustomerForm({
                                name: customer.name,
                                phoneNumber: customer.phoneNumber,
                                address: customer.address || "",
                                notes: customer.notes || "",
                                customerStatus: customer.customerStatus || "A",
                                carBrand: "",
                                carModel: "",
                                customModel: "",
                                year: "",
                                color: "",
                                engineCode: "",
                                chassisNumber: "",
                                licensePlate: "",
                                previousLicensePlate: "",
                                previousOwner: "",
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Customer's Cars */}
                    {selectedCustomer?.id === customer.id && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">سيارات الزبون</h4>
                          {canWrite("customers") && (
                            <Button
                              size="sm"
                              onClick={() => setShowAddCarForm(true)}
                            >
                              <Plus className="h-4 w-4 ml-1" />
                              إضافة سيارة
                            </Button>
                          )}
                        </div>

                        {/* Add Car Form */}
                        {showAddCarForm && canWrite("customers") && (
                          <Card className="border-green-200 bg-green-50 mb-3">
                            <CardContent className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor="carBrand">الصانع *</Label>
                                  <Select value={carForm.carBrand} onValueChange={(value) => setCarForm({...carForm, carBrand: value, carModel: ""})}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر الصانع" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="AUDI">AUDI</SelectItem>
                                      <SelectItem value="VOLKSWAGEN">VOLKSWAGEN</SelectItem>
                                      <SelectItem value="SKODA">SKODA</SelectItem>
                                      <SelectItem value="SEAT">SEAT</SelectItem>
                                      <SelectItem value="PORSCHE">PORSCHE</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="carModel">الطراز *</Label>
                                  <Select value={carForm.carModel} onValueChange={(value) => setCarForm({...carForm, carModel: value, customModel: ""})}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر الطراز" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getModelsByBrand(carForm.carBrand).map((model) => (
                                        <SelectItem key={model} value={model}>{model}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                {carForm.carModel === "أخرى" && (
                                  <div>
                                    <Label htmlFor="customCarModel">اكتب الطراز *</Label>
                                    <Input
                                      id="customCarModel"
                                      value={carForm.customModel}
                                      onChange={(e) => setCarForm({...carForm, customModel: e.target.value})}
                                      placeholder="أدخل اسم الطراز"
                                    />
                                  </div>
                                )}
                                <div>
                                  <Label htmlFor="licensePlate">رقم اللوحة *</Label>
                                  <Input
                                    id="licensePlate"
                                    value={carForm.licensePlate}
                                    onChange={(e) => setCarForm({...carForm, licensePlate: e.target.value})}
                                    placeholder="123456"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="previousLicensePlate">رقم اللوحة السابق (اختياري)</Label>
                                  <Input
                                    id="previousLicensePlate"
                                    value={carForm.previousLicensePlate}
                                    onChange={(e) => setCarForm({...carForm, previousLicensePlate: e.target.value})}
                                    placeholder="رقم اللوحة السابق إن وجد"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="carColor">اللون</Label>
                                  <Select value={carForm.color} onValueChange={(value) => setCarForm({...carForm, color: value})}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر اللون" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="أبيض">أبيض</SelectItem>
                                      <SelectItem value="أسود">أسود</SelectItem>
                                      <SelectItem value="أزرق">أزرق</SelectItem>
                                      <SelectItem value="أحمر">أحمر</SelectItem>
                                      <SelectItem value="أخضر">أخضر</SelectItem>
                                      <SelectItem value="أصفر">أصفر</SelectItem>
                                      <SelectItem value="برتقالي">برتقالي</SelectItem>
                                      <SelectItem value="بنفسجي">بنفسجي</SelectItem>
                                      <SelectItem value="وردي">وردي</SelectItem>
                                      <SelectItem value="بني">بني</SelectItem>
                                      <SelectItem value="رمادي">رمادي</SelectItem>
                                      <SelectItem value="فضي">فضي</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="carYear">سنة الصنع</Label>
                                  <Input
                                    id="carYear"
                                    value={carForm.year}
                                    onChange={(e) => setCarForm({...carForm, year: e.target.value})}
                                    placeholder="2020"
                                    type="number"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="engineCode">رمز المحرك</Label>
                                  <Input
                                    id="engineCode"
                                    value={carForm.engineCode}
                                    onChange={(e) => setCarForm({...carForm, engineCode: e.target.value.toUpperCase()})}
                                    placeholder="أدخل رمز المحرك"
                                    style={{ textTransform: 'uppercase' }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="chassisNumber">رقم الشاسيه (17 حرف ورقم)</Label>
                                  <Input
                                    id="chassisNumber"
                                    value={carForm.chassisNumber}
                                    onChange={(e) => {
                                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                      if (value.length <= 17) {
                                        setCarForm({...carForm, chassisNumber: value});
                                      }
                                    }}
                                    placeholder="أدخل رقم الشاسيه (17 حرف ورقم)"
                                    maxLength={17}
                                  />
                                  {carForm.chassisNumber && carForm.chassisNumber.length !== 17 && (
                                    <p className="text-red-500 text-sm mt-1">
                                      رقم الشاسيه يجب أن يكون 17 حرف ورقم بالضبط (حالياً: {carForm.chassisNumber.length})
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <Label htmlFor="previousOwner">المالك السابق (اختياري)</Label>
                                  <Input
                                    id="previousOwner"
                                    value={carForm.previousOwner}
                                    onChange={(e) => setCarForm({...carForm, previousOwner: e.target.value})}
                                    placeholder="اسم المالك السابق إن وجد"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="carNotes">ملاحظات</Label>
                                  <Input
                                    id="carNotes"
                                    value={carForm.notes}
                                    onChange={(e) => setCarForm({...carForm, notes: e.target.value})}
                                    placeholder="أي ملاحظات إضافية"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button onClick={handleAddCar}>
                                  <Save className="h-4 w-4 ml-1" />
                                  حفظ السيارة
                                </Button>
                                <Button variant="outline" onClick={() => {
                                  setShowAddCarForm(false);
                                  resetCarForm();
                                }}>
                                  <X className="h-4 w-4 ml-1" />
                                  إلغاء
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Edit Car Form */}
                        {editingCar && canWrite("customers") && (
                          <Card className="border-blue-200 bg-blue-50 mb-3">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center mb-3">
                                <h5 className="font-medium">تعديل بيانات السيارة</h5>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingCar(null);
                                    resetCarForm();
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor="editCarBrand">الصانع *</Label>
                                  <Select 
                                    value={carForm.carBrand || editingCar.carBrand} 
                                    onValueChange={(value) => setCarForm({...carForm, carBrand: value, carModel: ""})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر الصانع" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="AUDI">AUDI</SelectItem>
                                      <SelectItem value="VOLKSWAGEN">VOLKSWAGEN</SelectItem>
                                      <SelectItem value="SKODA">SKODA</SelectItem>
                                      <SelectItem value="SEAT">SEAT</SelectItem>
                                      <SelectItem value="PORSCHE">PORSCHE</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="editCarModel">الطراز *</Label>
                                  <Select 
                                    value={carForm.carModel || editingCar.carModel} 
                                    onValueChange={(value) => setCarForm({...carForm, carModel: value, customModel: ""})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر الطراز" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getModelsByBrand(carForm.carBrand || editingCar.carBrand).map((model) => (
                                        <SelectItem key={model} value={model}>{model}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                {(carForm.carModel === "أخرى" || editingCar.carModel === "أخرى") && (
                                  <div>
                                    <Label htmlFor="editCustomCarModel">اكتب الطراز *</Label>
                                    <Input
                                      id="editCustomCarModel"
                                      value={carForm.customModel || (editingCar.carModel === "أخرى" ? editingCar.carModel : "")}
                                      onChange={(e) => setCarForm({...carForm, customModel: e.target.value})}
                                      placeholder="أدخل اسم الطراز"
                                    />
                                  </div>
                                )}
                                <div>
                                  <Label htmlFor="editLicensePlate">رقم اللوحة *</Label>
                                  <Input
                                    id="editLicensePlate"
                                    value={carForm.licensePlate || editingCar.licensePlate}
                                    onChange={(e) => setCarForm({...carForm, licensePlate: e.target.value})}
                                    placeholder="123456"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editPreviousLicensePlate">رقم اللوحة السابق (اختياري)</Label>
                                  <Input
                                    id="editPreviousLicensePlate"
                                    value={carForm.previousLicensePlate || editingCar.previousLicensePlate || ""}
                                    onChange={(e) => setCarForm({...carForm, previousLicensePlate: e.target.value})}
                                    placeholder="رقم اللوحة السابق إن وجد"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editCarColor">اللون</Label>
                                  <Select 
                                    value={carForm.color || editingCar.color || ""} 
                                    onValueChange={(value) => setCarForm({...carForm, color: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر اللون" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="أبيض">أبيض</SelectItem>
                                      <SelectItem value="أسود">أسود</SelectItem>
                                      <SelectItem value="أزرق">أزرق</SelectItem>
                                      <SelectItem value="أحمر">أحمر</SelectItem>
                                      <SelectItem value="أخضر">أخضر</SelectItem>
                                      <SelectItem value="أصفر">أصفر</SelectItem>
                                      <SelectItem value="برتقالي">برتقالي</SelectItem>
                                      <SelectItem value="بنفسجي">بنفسجي</SelectItem>
                                      <SelectItem value="وردي">وردي</SelectItem>
                                      <SelectItem value="بني">بني</SelectItem>
                                      <SelectItem value="رمادي">رمادي</SelectItem>
                                      <SelectItem value="فضي">فضي</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="editCarYear">سنة الصنع</Label>
                                  <Input
                                    id="editCarYear"
                                    value={carForm.year || editingCar.year || ""}
                                    onChange={(e) => setCarForm({...carForm, year: e.target.value})}
                                    placeholder="2020"
                                    type="number"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editEngineCode">رمز المحرك</Label>
                                  <Input
                                    id="editEngineCode"
                                    value={carForm.engineCode || editingCar.engineCode || ""}
                                    onChange={(e) => setCarForm({...carForm, engineCode: e.target.value.toUpperCase()})}
                                    placeholder="أدخل رمز المحرك"
                                    style={{ textTransform: 'uppercase' }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editChassisNumber">رقم الشاسيه (17 حرف ورقم)</Label>
                                  <Input
                                    id="editChassisNumber"
                                    value={carForm.chassisNumber || editingCar.chassisNumber || ""}
                                    onChange={(e) => {
                                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                      if (value.length <= 17) {
                                        setCarForm({...carForm, chassisNumber: value});
                                      }
                                    }}
                                    placeholder="أدخل رقم الشاسيه (17 حرف ورقم)"
                                    maxLength={17}
                                  />
                                  {(carForm.chassisNumber || editingCar.chassisNumber) && 
                                   (carForm.chassisNumber || editingCar.chassisNumber)!.length !== 17 && (
                                    <p className="text-red-500 text-sm mt-1">
                                      رقم الشاسيه يجب أن يكون 17 حرف ورقم بالضبط (حالياً: {(carForm.chassisNumber || editingCar.chassisNumber)!.length})
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <Label htmlFor="editPreviousOwner">المالك السابق (اختياري)</Label>
                                  <Input
                                    id="editPreviousOwner"
                                    value={carForm.previousOwner || editingCar.previousOwner || ""}
                                    onChange={(e) => setCarForm({...carForm, previousOwner: e.target.value})}
                                    placeholder="اسم المالك السابق إن وجد"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="editCarNotes">ملاحظات</Label>
                                  <Input
                                    id="editCarNotes"
                                    value={carForm.notes || editingCar.notes || ""}
                                    onChange={(e) => setCarForm({...carForm, notes: e.target.value})}
                                    placeholder="أي ملاحظات إضافية"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button onClick={handleEditCar}>
                                  <Save className="h-4 w-4 ml-1" />
                                  تحديث السيارة
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setEditingCar(null);
                                    resetCarForm();
                                  }}
                                >
                                  <X className="h-4 w-4 ml-1" />
                                  إلغاء
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Cars List */}
                        <div className="space-y-2">
                          {getCustomerCars(customer.id).map((car) => (
                            <div key={car.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div className="flex items-center gap-3">
                                <Car className="h-5 w-5 text-gray-500" />
                                <div>
                                  <div className="font-medium">
                                    {getCarBrandInArabic(car.carBrand)} {car.carModel}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {car.licensePlate}
                                    {car.color && ` - ${car.color}`}
                                    {car.year && ` - ${car.year}`}
                                  </div>
                                  {car.engineCode && (
                                    <div className="text-xs text-gray-600">
                                      رمز المحرك: {car.engineCode}
                                    </div>
                                  )}
                                  {car.chassisNumber && (
                                    <div className="text-xs text-gray-600">
                                      رقم الشاسيه: {car.chassisNumber}
                                    </div>
                                  )}
                                  {car.previousLicensePlate && (
                                    <div className="text-xs text-gray-600">
                                      رقم اللوحة السابق: {car.previousLicensePlate}
                                    </div>
                                  )}
                                  {car.previousOwner && (
                                    <div className="text-xs text-gray-600">
                                      المالك السابق: {car.previousOwner}
                                    </div>
                                  )}
                                  {car.notes && (
                                    <div className="text-xs text-gray-500 italic">
                                      {car.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {canWrite("customers") && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingCar(car);
                                        // Load car data into form
                                        setCarForm({
                                          carBrand: car.carBrand,
                                          carModel: car.carModel,
                                          customModel: "",
                                          licensePlate: car.licensePlate,
                                          previousLicensePlate: car.previousLicensePlate || "",
                                          color: car.color || "",
                                          year: car.year?.toString() || "",
                                          engineCode: car.engineCode || "",
                                          chassisNumber: car.chassisNumber || "",
                                          previousOwner: car.previousOwner || "",
                                          notes: car.notes || "",
                                        });
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {filteredCustomers.length > 0 && totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronRight className="h-4 w-4" />
                  السابق
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="min-w-[2.5rem]"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Pagination Info */}
            {filteredCustomers.length > 0 && (
              <div className="text-center text-sm text-gray-500 mt-4">
                عرض {startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)} من {filteredCustomers.length} زبون
              </div>
            )}

            {filteredCustomers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "لا توجد نتائج للبحث" : "لا يوجد زبائن مسجلون"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}