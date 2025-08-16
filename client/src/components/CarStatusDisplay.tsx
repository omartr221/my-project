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
  "بانتظار قطع": "bg-yellow-500 text-white",
  "جاهزة للتسليم": "bg-green-500 text-white"
};

const statusIcons = {
  "في الاستقبال": Car,
  "في الورشة": RefreshCw,
  "بانتظار قطع": Package,
  "جاهزة للتسليم": Users
};

export default function CarStatusDisplay() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const isBadawi = user?.username === 'بدوي';
  
  // Fetch car statuses
  const { data: carStatuses = [], isLoading, refetch } = useQuery<CarStatus[]>({
    queryKey: ['/api/car-status'],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  // Fetch parts requests to show with car status
  const { data: partsRequests = [] } = useQuery<any[]>({
    queryKey: ["/api/parts-requests"],
    refetchInterval: 5000,
  });

  // Handle WebSocket updates
  useEffect(() => {
    if (lastMessage) {
      try {
        const message = JSON.parse(lastMessage);
        if (message.type === 'CAR_STATUS_CREATED' || 
            message.type === 'CAR_STATUS_UPDATED' || 
            message.type === 'CAR_STATUS_DELETED') {
          refetch();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage, refetch]);

  // Update car status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number, updates: Partial<CarStatus> }) =>
      apiRequest(`/api/car-status/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث وضع السيارة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/car-status'] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث وضع السيارة",
        variant: "destructive",
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
        description: "تم تحويل السيارة للاستقبال بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تسليم السيارة للاستقبال",
        variant: "destructive",
      });
    },
  });

  // تشخيص للمساعدة
  console.log('Current user:', user?.username);
  console.log('Is Badawi:', isBadawi);
  console.log('Car statuses:', carStatuses?.length);

  // Filter cars based on search term
  const filteredCars = carStatuses.filter((car) =>
    car.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.carBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.carModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (carId: number, newStatus: string) => {
    const updates: Partial<CarStatus> = {
      currentStatus: newStatus as any,
    };

    // Add timestamp based on status
    if (newStatus === "في الورشة") {
      updates.enteredWorkshopAt = new Date();
    } else if (newStatus === "جاهزة للتسليم") {
      updates.completedAt = new Date();
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
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ابحث عن سيارة (الزبون، رقم السيارة، نوع السيارة)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Status Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Object.entries(statusColors).map(([status, colorClass]) => {
              const count = carStatuses.filter(car => car.currentStatus === status).length;
              const StatusIcon = statusIcons[status as keyof typeof statusIcons];
              return (
                <Card key={status} className="p-4">
                  <div className="flex items-center space-x-reverse space-x-2">
                    <StatusIcon className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">{status}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Cars List */}
          <div className="space-y-4">
            {filteredCars.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {searchTerm ? "لا توجد سيارات تطابق البحث" : "لا توجد سيارات مسجلة حالياً"}
              </div>
            ) : (
              filteredCars.map((car) => (
                <Card key={car.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
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

                      {/* عرض طلبات القطع للسيارة */}
                      {(() => {
                        const carPartsRequests = partsRequests.filter((req: any) => 
                          req.licensePlate === car.licensePlate
                        );
                        if (carPartsRequests.length > 0) {
                          return (
                            <div className="mt-2 p-2 bg-blue-50 rounded border">
                              <div className="text-sm font-medium text-blue-800 mb-1">
                                طلبات القطع ({carPartsRequests.length}):
                              </div>
                              <div className="space-y-1">
                                {carPartsRequests.slice(0, 3).map((req: any) => (
                                  <div key={req.id} className="text-xs text-blue-700">
                                    • {req.partName} - {req.status === 'pending' ? 'قيد المراجعة' : 
                                      req.status === 'approved' ? 'تم الموافقة' :
                                      req.status === 'in_preparation' ? 'قيد التحضير' :
                                      req.status === 'awaiting_pickup' ? 'بانتظار الاستلام' :
                                      req.status === 'delivered' ? 'تم التسليم' : req.status}
                                  </div>
                                ))}
                                {carPartsRequests.length > 3 && (
                                  <div className="text-xs text-blue-600">
                                    +{carPartsRequests.length - 3} طلبات أخرى
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <div className="flex items-center space-x-reverse space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          منذ {getElapsedTime(car)}
                        </div>
                        {car.partsRequestsCount > 0 && (
                          <div className="flex items-center">
                            <Package className="h-3 w-3 mr-1" />
                            {car.partsRequestsCount} طلب قطع ({car.completedPartsCount} مكتمل)
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(car.currentStatus)}
                      
                      {/* Quick Status Change Buttons */}
                      <div className="flex flex-wrap gap-1">
                        {car.currentStatus === "في الاستقبال" && (
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
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(car.id, "بانتظار قطع")}
                              disabled={updateStatusMutation.isPending}
                            >
                              طلب قطع
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(car.id, "جاهزة للتسليم")}
                              disabled={updateStatusMutation.isPending}
                            >
                              جاهزة للتسليم
                            </Button>
                          </>
                        )}
                        {car.currentStatus === "بانتظار قطع" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(car.id, "جاهزة للتسليم")}
                            disabled={updateStatusMutation.isPending}
                          >
                            جاهزة للتسليم
                          </Button>
                        )}
                        
                        {/* زر تسليم السيارة للاستقبال - لحساب بدوي فقط */}
                        {isBadawi && car.currentStatus === "في الورشة" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              console.log('Button clicked for car:', car.id, car.licensePlate);
                              returnToReceptionMutation.mutate(car.id);
                            }}
                            disabled={returnToReceptionMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <ArrowLeft className="ml-1 h-3 w-3" />
                            تسليم للاستقبال
                          </Button>
                        )}
                        
                        {/* زر اختبار مؤقت - يظهر دائماً لبدوي */}
                        {isBadawi && (
                          <Button
                            size="sm"
                            onClick={() => console.log('Test button clicked, car status:', car.currentStatus)}
                            className="bg-purple-600 hover:bg-purple-700 text-white mt-2"
                          >
                            اختبار ({car.currentStatus})
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}