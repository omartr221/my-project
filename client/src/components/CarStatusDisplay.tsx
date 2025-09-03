import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Car, Clock, Package, Users, RefreshCw, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type CarStatus } from "@shared/schema";
import { cn } from "@/lib/utils";

const statusColors = {
  "في الاستقبال": "bg-blue-500 text-white",
  "في الورشة": "bg-orange-500 text-white",
  "بانتظار قطع": "bg-purple-500 text-white",
  "جاهزة للتسليم": "bg-green-500 text-white",
  "تم التسليم": "bg-gray-500 text-white",
  "مؤجلة": "bg-red-500 text-white",
};

const statusIcons = {
  "في الاستقبال": Users,
  "في الورشة": Car,
  "بانتظار قطع": Package,
  "جاهزة للتسليم": RefreshCw,
  "تم التسليم": Clock,
  "مؤجلة": Clock,
};

export default function CarStatusDisplay() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const isBadawi = user?.username === 'بدوي';
  
  // Debug logging
  console.log('🟢 CarStatusDisplay - Current user:', user);
  console.log('🟢 CarStatusDisplay - isBadawi:', isBadawi);
  
  // Fetch car statuses
  const { data: carStatuses = [], isLoading, refetch } = useQuery<CarStatus[]>({
    queryKey: ['/api/car-status'],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  // Mutation for updating car status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<CarStatus> }) => {
      const response = await apiRequest("PATCH", `/api/car-status/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/car-status'] });
      toast({
        title: "تم تحديث حالة السيارة",
        description: "تم حفظ التغييرات بنجاح",
      });
    },
    onError: (error) => {
      console.error("Error updating car status:", error);
      toast({
        variant: "destructive",
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث حالة السيارة",
      });
    },
  });

  // Mutation for returning car to reception (for بدوي)
  const returnToReceptionMutation = useMutation({
    mutationFn: async (carId: number) => {
      const response = await apiRequest("POST", `/api/car-status/${carId}/return-to-reception`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/car-status'] });
      toast({
        title: "تم تسليم السيارة للاستقبال",
        description: "تم نقل السيارة من الورشة إلى الاستقبال بنجاح",
      });
    },
    onError: (error) => {
      console.error("Error returning car to reception:", error);
      toast({
        variant: "destructive",
        title: "خطأ في التسليم",
        description: "حدث خطأ أثناء تسليم السيارة للاستقبال",
      });
    },
  });

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Filter cars based on search term
  const filteredCars = carStatuses.filter(car =>
    car.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.carBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.carModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug: Log all cars and their statuses
  console.log('🚗 All cars:', carStatuses);
  console.log('🚗 Cars in workshop:', carStatuses.filter(car => car.currentStatus === "في الورشة"));
  console.log('🚗 Filtered cars:', filteredCars);

  const handleStatusChange = (carId: number, newStatus: string) => {
    const updates: Partial<CarStatus> = {
      currentStatus: newStatus as any,
    };

    // Add timestamp based on status
    if (newStatus === "في الورشة") {
      updates.enteredWorkshopAt = new Date();
    } else if (newStatus === "في الاستقبال") {
      // عند تحديد "جاهزة للتسليم" نغير الحالة إلى "في الاستقبال" ونضيف returnedToReceptionAt
      updates.returnedToReceptionAt = new Date();
      updates.returnedBy = user?.username || "غير محدد";
    }

    updateStatusMutation.mutate({ id: carId, updates });
  };

  const getStatusBadge = (status: string) => {
    const StatusIcon = statusIcons[status as keyof typeof statusIcons] || Car;
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-500 text-white"}>
        <StatusIcon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getElapsedTime = (car: CarStatus) => {
    const now = new Date();
    const startTime = new Date(car.receivedAt);
    const diffInMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} دقيقة`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} ساعة`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} يوم`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="mr-2">جاري تحميل وضع السيارات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Car className="ml-2 h-5 w-5" />
              وضع السيارات - التتبع المباشر
            </div>
            <Badge variant="outline" className="text-sm">
              {filteredCars.length} سيارة
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث في السيارات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Car Status Grid */}
          <div className="space-y-4">
            {filteredCars.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد سيارات تطابق البحث</p>
              </div>
            ) : (
              filteredCars.map((car) => (
                <Card key={car.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-reverse space-x-4 mb-2">
                          <h3 className="font-bold text-lg">{car.customerName}</h3>
                          <Badge variant="outline">{car.licensePlate}</Badge>
                          <span className="text-gray-600">{car.carBrand} {car.carModel}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                          {car.maintenanceType && (
                            <div>نوع الصيانة: {car.maintenanceType}</div>
                          )}
                          {car.kmReading && (
                            <div>الكيلومترات: {car.kmReading.toLocaleString()}</div>
                          )}
                          {car.fuelLevel && (
                            <div>البنزين: {car.fuelLevel}</div>
                          )}
                        </div>

                        {car.complaints && (
                          <div className="text-sm text-gray-700 mb-2">
                            <strong>الشكاوي:</strong> {car.complaints}
                          </div>
                        )}

                        <div className="flex items-center space-x-reverse space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            منذ {getElapsedTime(car)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        {getStatusBadge(car.currentStatus)}
                        
                        {/* Quick Status Change Buttons */}
                        <div className="flex flex-wrap gap-1">
                          {car.currentStatus === "في الاستقبال" && user?.username === 'بدوي' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(car.id, "في الورشة")}
                              disabled={updateStatusMutation.isPending}
                            >
                              إدخال للورشة
                            </Button>
                          )}
                          {car.currentStatus === "في الورشة" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(car.id, "في الاستقبال")}
                              disabled={updateStatusMutation.isPending}
                            >
                              جاهزة للتسليم
                            </Button>
                          )}

                          

                          
                          {/* زر تسليم للاستقبال - لبدوي فقط والسيارات في الورشة */}
                          {user?.username === 'بدوي' && (car.currentStatus === "في الورشة" || car.currentStatus === "workshop") && (
                            <Button
                              size="lg"
                              onClick={() => {
                                console.log('🔵 بدوي clicked return to reception for car:', car.id, car.licensePlate);
                                returnToReceptionMutation.mutate(car.id);
                              }}
                              disabled={returnToReceptionMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white w-full text-lg font-bold mb-2"
                            >
                              <ArrowLeft className="ml-2 h-5 w-5" />
                              🚗 تسليم السيارة للاستقبال 🚗
                            </Button>
                          )}
                          
                          {/* معلومات السيارة */}
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            المستخدم: {user?.username} | حالة: {car.currentStatus} | رقم: {car.id}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}