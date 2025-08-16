import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Car {
  id: number;
  licensePlate: string;
  currentStatus: string;
  customerName?: string;
  carModel?: string;
  entryTime?: string;
}

export default function CarDeliveryView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب حالات السيارات من API الصحيح
  const { data: carStatuses = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['/api/car-status'],
    refetchInterval: 3000,
  });
  
  console.log('🚗 Car statuses from correct API:', carStatuses);
  
  // تحويل carStatuses إلى تنسيق Car مؤقتاً
  const allCars = carStatuses.map((status: any) => ({
    id: status.id,
    licensePlate: status.licensePlate,
    currentStatus: status.currentStatus,
    customerName: status.customerName,
    carModel: status.carModel || status.carBrand,
    entryTime: status.enteredWorkshopAt || status.createdAt
  }));

  // فلترة السيارات في الورشة فقط - مع إضافة تسجيل للتحقق
  console.log('🔍 All cars data:', allCars);
  const carsInWorkshop = allCars.filter(car => {
    const isInWorkshop = car.currentStatus === "في الورشة" || 
                        car.currentStatus === "workshop" ||
                        car.currentStatus === "في_الورشة" ||
                        car.currentStatus === "ورشة";
    console.log(`🚗 Car ${car.licensePlate}: status="${car.currentStatus}", isInWorkshop=${isInWorkshop}`);
    return isInWorkshop;
  });
  
  console.log('🏭 Cars in workshop:', carsInWorkshop.length, carsInWorkshop);

  // تسليم السيارة للاستقبال
  const returnToReceptionMutation = useMutation({
    mutationFn: async (carId: number) => {
      console.log('🔄 Returning car to reception:', carId);
      const response = await apiRequest("POST", `/api/cars/${carId}/return-to-reception`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح ✅",
        description: "تم تسليم السيارة للاستقبال",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
    },
    onError: (error: Error) => {
      console.error('❌ Error returning car to reception:', error);
      toast({
        title: "خطأ ❌",
        description: "فشل في تسليم السيارة للاستقبال",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل السيارات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="ml-2 h-5 w-5" />
            تسليم السيارات للاستقبال
          </CardTitle>
          <p className="text-sm text-gray-600">
            السيارات الموجودة في الورشة والجاهزة للتسليم
          </p>
        </CardHeader>
        <CardContent>
          {carsInWorkshop.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                لا توجد سيارات في الورشة
              </h3>
              <p className="text-gray-500">
                جميع السيارات تم تسليمها أو لم يتم إدخال أي سيارة للورشة بعد
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {carsInWorkshop.map((car) => (
                <Card key={car.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* معلومات السيارة */}
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {car.licensePlate}
                        </h3>
                        {car.customerName && (
                          <p className="text-sm text-gray-600">
                            العميل: {car.customerName}
                          </p>
                        )}
                        {car.carModel && (
                          <p className="text-sm text-gray-600">
                            النوع: {car.carModel}
                          </p>
                        )}
                      </div>

                      {/* حالة السيارة */}
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Clock className="ml-1 h-3 w-3" />
                          {car.currentStatus}
                        </span>
                      </div>

                      {/* وقت الدخول */}
                      {car.entryTime && (
                        <p className="text-xs text-gray-500">
                          دخلت الورشة: {new Date(car.entryTime).toLocaleString('ar-EG', {
                            timeZone: 'Asia/Damascus',
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}

                      {/* زر التسليم */}
                      <Button
                        size="lg"
                        onClick={() => {
                          console.log('🚗 Delivering car to reception:', car.id, car.licensePlate);
                          returnToReceptionMutation.mutate(car.id);
                        }}
                        disabled={returnToReceptionMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white w-full text-base font-bold"
                      >
                        <ArrowLeft className="ml-2 h-5 w-5" />
                        {returnToReceptionMutation.isPending ? "جاري التسليم..." : "تسليم للاستقبال"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* إحصائيات */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">إحصائيات سريعة</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">السيارات في الورشة:</span>
                <span className="font-bold text-orange-600 mr-2">{carsInWorkshop.length}</span>
              </div>
              <div>
                <span className="text-gray-600">إجمالي السيارات:</span>
                <span className="font-bold text-gray-900 mr-2">{allCars.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}