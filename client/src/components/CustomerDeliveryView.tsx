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

  // فلترة السيارات في الاستقبال والجاهزة للتسليم
  const carsForDelivery = carStatuses.filter(car => 
    car.currentStatus === "في الاستقبال" && car.returnedToReceptionAt
  ).map((status: any) => ({
    id: status.id,
    licensePlate: status.licensePlate,
    currentStatus: status.currentStatus,
    customerName: status.customerName,
    customerPhone: status.customerPhone,
    carModel: status.carModel || status.carBrand,
    carBrand: status.carBrand,
    engineCode: status.engineCode,
    entryTime: status.createdAt,
    returnedToReceptionAt: status.returnedToReceptionAt,
    returnedBy: status.returnedBy,
    partsUsed: status.partsUsed || [],
    serviceDescription: status.serviceDescription || "خدمة صيانة عامة",
    estimatedCost: status.estimatedCost || 0,
    actualCost: status.actualCost || 0
  }));

  // تسليم السيارة للزبون
  const deliverToCustomerMutation = useMutation({
    mutationFn: async (carId: number) => {
      const response = await apiRequest("PATCH", `/api/car-status/${carId}`, {
        currentStatus: "مكتمل",
        deliveredAt: new Date(),
        deliveredBy: "الاستقبال"
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم التسليم بنجاح ✅",
        description: "تم تسليم السيارة للزبون",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/car-status'] });
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
                              {car.partsUsed.map((part, index) => (
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

          {/* إحصائيات */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">إحصائيات التسليم</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">جاهزة للتسليم:</span>
                <span className="font-bold text-blue-600 mr-2">{carsForDelivery.length}</span>
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