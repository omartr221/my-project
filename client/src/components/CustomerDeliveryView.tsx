import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, User, Calendar, Package, FileText, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CarForDelivery {
  id: number;
  licensePlate: string;
  currentStatus: string;
  customerName?: string;
  customerPhone?: string;
  carModel?: string;
  carBrand?: string;
  engineCode?: string;
  entryTime?: string;
  returnedToReceptionAt?: string;
  returnedBy?: string;
  // Parts and service data
  partsUsed?: string[];
  serviceDescription?: string;
  estimatedCost?: number;
  actualCost?: number;
}

export default function CustomerDeliveryView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب السيارات الجاهزة للتسليم للزبون (في الاستقبال)
  const { data: carStatuses = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/car-status'],
    refetchInterval: 3000,
  });

  // جلب القطع المستخدمة لكل سيارة
  const { data: allPartsRequests = [] } = useQuery<any[]>({
    queryKey: ['/api/parts-requests'],
    refetchInterval: 5000,
  });

  console.log('🚗 All car statuses:', carStatuses);

  // دالة للحصول على القطع المستخدمة لسيارة معينة
  const getPartsUsedForCar = (licensePlate: string) => {
    const carParts = allPartsRequests.filter((part: any) => 
      part.licensePlate === licensePlate && 
      (part.status === "delivered" || part.status === "مُسلم")
    );
    return carParts.map((part: any) => `${part.partName} (${part.quantity})`);
  };

  // فلترة السيارات في الاستقبال والجاهزة للتسليم
  const carsForDelivery = carStatuses.filter(car => {
    const isReadyForDelivery = car.currentStatus === "في الاستقبال" && car.returnedToReceptionAt;
    console.log(`🔍 Car ${car.licensePlate}: status="${car.currentStatus}", returned="${car.returnedToReceptionAt}", ready=${isReadyForDelivery}`);
    return isReadyForDelivery;
  }).map((status: any) => ({
    id: status.id,
    licensePlate: status.licensePlate,
    currentStatus: status.currentStatus,
    customerName: status.customerName,
    customerPhone: status.customerPhone,
    carModel: status.carModel || status.carBrand,
    carBrand: status.carBrand,
    engineCode: status.engineCode,
    entryTime: status.receivedAt || status.createdAt,
    returnedToReceptionAt: status.returnedToReceptionAt,
    returnedBy: status.returnedBy,
    partsUsed: getPartsUsedForCar(status.licensePlate),
    serviceDescription: status.serviceDescription || "خدمة صيانة عامة",
    estimatedCost: status.estimatedCost || 0,
    actualCost: status.actualCost || 0
  }));

  // فلترة السيارات المسلمة للزبائن
  const deliveredCars = carStatuses.filter(car => {
    return car.currentStatus === "مكتمل" && car.deliveredAt;
  }).map((status: any) => ({
    id: status.id,
    licensePlate: status.licensePlate,
    currentStatus: status.currentStatus,
    customerName: status.customerName,
    customerPhone: status.customerPhone,
    carModel: status.carModel || status.carBrand,
    carBrand: status.carBrand,
    engineCode: status.engineCode,
    entryTime: status.receivedAt || status.createdAt,
    enteredWorkshopAt: status.enteredWorkshopAt,
    returnedToReceptionAt: status.returnedToReceptionAt,
    deliveredAt: status.deliveredAt,
    deliveredBy: status.deliveredBy,
    returnedBy: status.returnedBy,
    partsUsed: getPartsUsedForCar(status.licensePlate),
    serviceDescription: status.serviceDescription || "خدمة صيانة عامة",
    estimatedCost: status.estimatedCost || 0,
    actualCost: status.actualCost || 0
  }));

  // تسليم السيارة للزبون
  const deliverToCustomerMutation = useMutation({
    mutationFn: async (carId: number) => {
      // أولاً: تحديث حالة السيارة وإيقاف المؤقت
      const response = await apiRequest("PATCH", `/api/car-status/${carId}`, {
        currentStatus: "مكتمل",
        deliveredAt: new Date().toISOString(),
        deliveredBy: "الاستقبال"
      });
      
      // ثانياً: إيقاف المؤقت في صفحة الاستقبال
      const car = carsForDelivery.find(c => c.id === carId);
      if (car) {
        await apiRequest("PATCH", `/api/reception-entries/stop-timer/${car.licensePlate}`, {
          stopReason: "delivered_to_customer"
        });
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم التسليم بنجاح ✅",
        description: "تم تسليم السيارة للزبون وإيقاف المؤقت",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/car-status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reception-entries'] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التسليم ❌",
        description: "فشل في تسليم السيارة للزبون",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل السيارات الجاهزة للتسليم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="ml-2 h-5 w-5" />
            تسليم السيارات للزبائن
          </CardTitle>
          <p className="text-sm text-gray-600">
            السيارات الجاهزة للتسليم للزبائن (تم إرجاعها من الورشة)
          </p>
        </CardHeader>
        <CardContent>
          {carsForDelivery.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                لا توجد سيارات جاهزة للتسليم
              </h3>
              <p className="text-gray-500">
                لا توجد سيارات تم إرجاعها من الورشة وجاهزة للتسليم للزبائن
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {carsForDelivery.map((car) => (
                <Card key={car.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* معلومات السيارة والزبون */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 mb-2">
                            {car.licensePlate}
                          </h3>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {car.currentStatus}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <User className="h-4 w-4 ml-2 text-gray-500" />
                            <span className="font-medium">الزبون:</span>
                            <span className="mr-2">{car.customerName || "غير محدد"}</span>
                          </div>
                          
                          {car.customerPhone && (
                            <div className="flex items-center text-sm">
                              <span className="font-medium">الهاتف:</span>
                              <span className="mr-2">{car.customerPhone}</span>
                            </div>
                          )}

                          <div className="flex items-center text-sm">
                            <Car className="h-4 w-4 ml-2 text-gray-500" />
                            <span className="font-medium">السيارة:</span>
                            <span className="mr-2">{car.carBrand} {car.carModel}</span>
                          </div>

                          {car.engineCode && (
                            <div className="flex items-center text-sm">
                              <span className="font-medium">رمز المحرك:</span>
                              <span className="mr-2 font-mono">{car.engineCode}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* معلومات الخدمة والوقت */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">تفاصيل الخدمة</h4>
                        
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 ml-2 text-gray-500" />
                            <span className="font-medium">دخول الورشة:</span>
                            <span className="mr-2 text-xs">
                              {car.entryTime ? new Date(car.entryTime).toLocaleString('ar-EG', {
                                timeZone: 'Asia/Damascus',
                                day: 'numeric',
                                month: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : "غير محدد"}
                            </span>
                          </div>

                          <div className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                            <span className="font-medium">انتهاء العمل:</span>
                            <span className="mr-2 text-xs">
                              {car.returnedToReceptionAt ? new Date(car.returnedToReceptionAt).toLocaleString('ar-EG', {
                                timeZone: 'Asia/Damascus',
                                day: 'numeric',
                                month: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : "غير محدد"}
                            </span>
                          </div>

                          <div className="flex items-center text-sm">
                            <span className="font-medium">تم بواسطة:</span>
                            <span className="mr-2">{car.returnedBy || "غير محدد"}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start text-sm">
                            <FileText className="h-4 w-4 ml-2 mt-0.5 text-gray-500" />
                            <span className="font-medium">وصف الخدمة:</span>
                          </div>
                          <p className="text-sm text-gray-600 mr-6">
                            {car.serviceDescription}
                          </p>
                        </div>
                      </div>

                      {/* القطع والتكلفة */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">القطع والتكلفة</h4>
                        
                        {car.partsUsed && car.partsUsed.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <Package className="h-4 w-4 ml-2 text-gray-500" />
                              <span className="font-medium">القطع المستخدمة:</span>
                            </div>
                            <div className="mr-6">
                              {car.partsUsed.map((part: string, index: number) => (
                                <Badge key={index} variant="secondary" className="ml-1 mb-1">
                                  {part}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          {car.estimatedCost > 0 && (
                            <div className="flex items-center text-sm">
                              <span className="font-medium">التكلفة المقدرة:</span>
                              <span className="mr-2">{car.estimatedCost.toLocaleString()} ل.س</span>
                            </div>
                          )}
                          
                          {car.actualCost > 0 && (
                            <div className="flex items-center text-sm">
                              <span className="font-medium">التكلفة الفعلية:</span>
                              <span className="mr-2 font-bold text-green-600">
                                {car.actualCost.toLocaleString()} ل.س
                              </span>
                            </div>
                          )}
                        </div>

                        {/* زر التسليم */}
                        <Button
                          size="lg"
                          onClick={() => {
                            deliverToCustomerMutation.mutate(car.id);
                          }}
                          disabled={deliverToCustomerMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white w-full font-bold"
                        >
                          <CheckCircle className="ml-2 h-5 w-5" />
                          {deliverToCustomerMutation.isPending ? "جاري التسليم..." : "تسليم للزبون"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

        </CardContent>
      </Card>

      {/* قسم السيارات المسلمة */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <CheckCircle className="ml-2 h-6 w-6 text-green-600" />
            السيارات المسلمة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deliveredCars.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                لا توجد سيارات مسلمة
              </h3>
              <p className="text-gray-500">
                لم يتم تسليم أي سيارات للزبائن بعد
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {deliveredCars.map((car) => {
                // حساب الأوقات والمدد - من دخول السيارة حتى جاهزة للتسليم
                const entryTime = car.entryTime ? new Date(car.entryTime) : null;
                const workshopEntryTime = car.enteredWorkshopAt ? new Date(car.enteredWorkshopAt) : null;
                const returnTime = car.returnedToReceptionAt ? new Date(car.returnedToReceptionAt) : null;
                const deliveryTime = car.deliveredAt ? new Date(car.deliveredAt) : null;
                
                // حساب المدد بالساعات والأيام (مؤقت تصاعدي من دخول السيارة)
                const calculateDuration = (start: Date | null, end: Date | null) => {
                  if (!start || !end) return "0 ساعة";
                  const diffMs = end.getTime() - start.getTime();
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffDays = Math.floor(diffHours / 24);
                  const remainingHours = diffHours % 24;
                  
                  if (diffDays > 0) {
                    return `${diffDays} يوم و ${remainingHours} ساعة`;
                  } else {
                    return `${diffHours} ساعة`;
                  }
                };
                
                // تسجيل البيانات للتصحيح
                console.log(`🕐 Car ${car.licensePlate} times:`, {
                  entryTime: car.entryTime,
                  workshopEntryTime: car.enteredWorkshopAt,
                  returnTime: car.returnedToReceptionAt,
                  deliveryTime: car.deliveredAt
                });
                
                // المدد الزمنية المطلوبة - مؤقت تصاعدي من الدخول
                const receptionDuration = calculateDuration(entryTime, workshopEntryTime);
                const workshopDuration = calculateDuration(workshopEntryTime, returnTime);
                const totalDuration = calculateDuration(entryTime, deliveryTime); // المدة الإجمالية من الدخول حتى التسليم
                
                return (
                  <Card key={car.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* معلومات السيارة والزبون */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-bold text-xl text-gray-900 mb-2">
                              {car.licensePlate}
                            </h3>
                            <Badge className="bg-green-100 text-green-800">
                              تم التسليم ✓
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <User className="h-4 w-4 ml-2 text-gray-500" />
                              <span className="font-medium">الزبون:</span>
                              <span className="mr-2">{car.customerName || "غير محدد"}</span>
                            </div>
                            
                            {car.customerPhone && (
                              <div className="flex items-center text-sm">
                                <span className="font-medium">الهاتف:</span>
                                <span className="mr-2">{car.customerPhone}</span>
                              </div>
                            )}

                            <div className="flex items-center text-sm">
                              <Car className="h-4 w-4 ml-2 text-gray-500" />
                              <span className="font-medium">السيارة:</span>
                              <span className="mr-2">{car.carBrand} {car.carModel}</span>
                            </div>

                            {car.engineCode && (
                              <div className="flex items-center text-sm">
                                <span className="font-medium">رمز المحرك:</span>
                                <span className="mr-2">{car.engineCode}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* التوقيتات والمدد */}
                        <div className="space-y-4">
                          <h4 className="font-bold text-lg text-gray-800">تفاصيل الخدمة</h4>
                          
                          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">دخول الورشة:</span>
                              <span className="text-sm">{entryTime?.toLocaleString('ar-SA') || "غير محدد"}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">إدخال للورشة:</span>
                              <span className="text-sm">{workshopEntryTime?.toLocaleString('ar-SA') || "غير محدد"}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">إرجاع للاستقبال:</span>
                              <span className="text-sm">{returnTime?.toLocaleString('ar-SA') || "غير محدد"}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">تسليم للزبون:</span>
                              <span className="text-sm">{deliveryTime?.toLocaleString('ar-SA') || "غير محدد"}</span>
                            </div>
                          </div>

                          <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                            <h5 className="font-bold text-sm text-blue-800">المدد الزمنية</h5>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">مدة الاستقبال:</span>
                              <span className="text-sm font-bold text-blue-600">{receptionDuration}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">مدة الورشة:</span>
                              <span className="text-sm font-bold text-orange-600">{workshopDuration}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">المدة الإجمالية:</span>
                              <span className="text-sm font-bold text-green-600">{totalDuration}</span>
                            </div>
                          </div>

                          {/* القطع والخدمات */}
                          {car.partsUsed && car.partsUsed.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <Package className="h-4 w-4 ml-2 text-gray-500" />
                                <span className="font-medium">القطع المستخدمة:</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {car.partsUsed.map((part: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {part}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* التكاليف */}
                          <div className="space-y-2 bg-green-50 p-3 rounded-lg">
                            {car.estimatedCost > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">التكلفة المقدرة:</span>
                                <span className="font-bold">{car.estimatedCost.toLocaleString()} ل.س</span>
                              </div>
                            )}
                            
                            {car.actualCost > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">التكلفة الفعلية:</span>
                                <span className="font-bold text-green-600">{car.actualCost.toLocaleString()} ل.س</span>
                              </div>
                            )}
                          </div>

                          {/* معلومات التسليم */}
                          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                            <div>تم التسليم بواسطة: {car.deliveredBy || "غير محدد"}</div>
                            {car.returnedBy && (
                              <div>تم الإرجاع بواسطة: {car.returnedBy}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* إحصائيات */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">إحصائيات التسليم</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">جاهزة للتسليم:</span>
                <span className="font-bold text-blue-600 mr-2">{carsForDelivery.length}</span>
              </div>
              <div>
                <span className="text-gray-600">تم التسليم:</span>
                <span className="font-bold text-green-600 mr-2">{deliveredCars.length}</span>
              </div>
              <div>
                <span className="text-gray-600">إجمالي السيارات:</span>
                <span className="font-bold text-gray-900 mr-2">{carStatuses.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}