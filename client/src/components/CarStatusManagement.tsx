import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Car, Calendar, User, ArrowRight, Bell, Check, Package, Wrench } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { CarReceipt, PartsRequest } from "@shared/schema";

export default function CarStatusManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Use global WebSocket hook for real-time updates
  useWebSocket();

  const { data: carReceipts = [], isLoading } = useQuery<CarReceipt[]>({
    queryKey: ["/api/car-receipts"],
  });

  // Get parts requests for all cars to show workshop activity
  const { data: partsRequests = [] } = useQuery<PartsRequest[]>({
    queryKey: ["/api/parts-requests"],
  });

  // Get active tasks to show current workshop activities for each car
  const { data: activeTasks = [] } = useQuery({
    queryKey: ["/api/tasks/active"],
  });

  // Show all car receipts - completed cars will show as "مستلمة" without buttons

  const sendToWorkshopMutation = useMutation({
    mutationFn: async (receiptId: number) => {
      const res = await apiRequest("POST", `/api/car-receipts/${receiptId}/send-to-workshop`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/car-receipts"] });
      toast({
        title: "تم الإرسال",
        description: "تم إرسال إشعار لبدوي بوجود سيارة جاهزة للدخول للورشة",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const postponeCarMutation = useMutation({
    mutationFn: async (receiptId: number) => {
      const res = await apiRequest("POST", `/api/car-receipts/${receiptId}/postpone`);
      return await res.json();
    },
    onSuccess: (updatedReceipt) => {
      // Force immediate cache invalidation and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/car-receipts"] });
      queryClient.refetchQueries({ queryKey: ["/api/car-receipts"] });
      
      toast({
        title: "تم التأجيل",
        description: "السيارة الآن بانتظار التسليم للورشة",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const enterWorkshopMutation = useMutation({
    mutationFn: async (receiptId: number) => {
      const res = await apiRequest("POST", `/api/car-receipts/${receiptId}/enter-workshop`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/car-receipts"] });
      toast({
        title: "تم الإدخال",
        description: "تم إدخال السيارة للورشة بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });





  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Filter cars based on user permissions - completed cars only for بدوي
  const carsInReception = carReceipts.filter(receipt => {
    if (user?.username === "بدوي") {
      // بدوي can see all statuses including postponed and completed cars
      return receipt.status === "received" || receipt.status === "workshop_pending" || receipt.status === "postponed" || receipt.status === "completed";
    } else {
      // Other users (فارس, الاستقبال) cannot see postponed or completed cars
      return receipt.status === "received" || receipt.status === "workshop_pending";
    }
  });

  if (carsInReception.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد سيارات في الاستقبال</h3>
          <p className="text-gray-500">جميع السيارات تم إرسالها للورشة أو مكتملة</p>
        </CardContent>
      </Card>
    );
  }

  // Helper functions for parts request status
  const getPartsRequestStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "approved":
      case "in_preparation":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "awaiting_pickup":
      case "parts_arrived":
        return "bg-green-100 text-green-800 border-green-300";
      case "delivered":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPartsRequestStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "بانتظار الموافقة";
      case "approved":
        return "موافق عليه";
      case "in_preparation":
        return "قيد التحضير";
      case "awaiting_pickup":
        return "بانتظار الاستلام";
      case "parts_arrived":
        return "وصلت القطعة";
      case "delivered":
        return "تم التسليم";
      case "rejected":
        return "مرفوض";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">حالة السيارات</h2>
        <Badge variant="outline" className="text-sm">
          {carsInReception.length} سيارة في الاستقبال
        </Badge>
      </div>

      <div className="grid gap-4">
        {carsInReception.map((receipt) => (
          <Card key={receipt.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Car className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {receipt.receiptNumber}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(receipt.receivedAt || Date.now()), "dd MMMM yyyy - HH:mm", { locale: ar })}
                    </div>
                  </div>
                </div>

              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* معلومات السيارة والزبون */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{receipt.licensePlate}</span>
                    <span className="text-gray-600">-</span>
                    <span>{receipt.carBrand} {receipt.carModel}</span>
                    {receipt.carColor && (
                      <Badge variant="outline" className="text-xs">
                        {receipt.carColor}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{receipt.customerName}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-500">عداد الدخول:</span>
                    <span className="font-medium ml-2">{receipt.entryMileage}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">نسبة البنزين:</span>
                    <span className="font-medium ml-2">{receipt.fuelLevel}</span>
                  </div>
                </div>
              </div>

              {/* طلبات الإصلاح */}
              <div className="text-sm">
                <span className="text-gray-500">طلبات الإصلاح:</span>
                <div className="mt-1 p-2 bg-blue-50 rounded border-r-2 border-blue-300">
                  <p className="text-blue-800 whitespace-pre-line">{receipt.repairType}</p>
                </div>
              </div>

              {/* الشكوى */}
              {receipt.entryNotes && (
                <div className="text-sm">
                  <span className="text-gray-500">الشكوى:</span>
                  <div className="mt-1 p-2 bg-gray-50 rounded">
                    <p className="text-gray-800">{receipt.entryNotes}</p>
                  </div>
                </div>
              )}

              {/* نشاط الورشة */}
              {(() => {
                const carPartsRequests = partsRequests.filter(request => 
                  request.licensePlate === receipt.licensePlate
                );
                
                const carActiveTasks = (activeTasks as any[]).filter((task: any) => 
                  task.licensePlate === receipt.licensePlate
                );
                
                const hasWorkshopActivity = carPartsRequests.length > 0 || carActiveTasks.length > 0;
                
                if (hasWorkshopActivity) {
                  return (
                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="h-4 w-4 text-green-600" />
                        <span className="text-gray-500 font-medium">نشاط الورشة:</span>
                      </div>
                      <div className="space-y-2">
                        {/* المهام الجارية */}
                        {carActiveTasks.map((task: any) => (
                          <div key={task.id} className="p-2 bg-blue-50 rounded border-r-2 border-blue-300">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Wrench className="h-3 w-3 text-blue-600" />
                                  <span className="font-medium text-blue-800">جاري العمل</span>
                                  <Badge variant="outline" className="text-xs bg-blue-100">
                                    {task.status === "active" ? "نشط" : "متوقف"}
                                  </Badge>
                                </div>
                                <div className="text-xs text-blue-600 mt-1">
                                  {task.engineerName && `المهندس: ${task.engineerName}`}
                                  {task.technicianName && ` | الفني: ${task.technicianName}`}
                                  {task.taskType && ` | نوع المهمة: ${task.taskType}`}
                                </div>
                                {task.description && (
                                  <div className="text-xs text-gray-700 mt-1 font-medium">
                                    التفاصيل: {task.description}
                                  </div>
                                )}
                                {task.repairOperation && (
                                  <div className="text-xs text-gray-700 mt-1">
                                    عملية الإصلاح: {task.repairOperation}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* طلبات القطع */}
                        {carPartsRequests.map((request) => (
                          <div key={request.id} className="p-2 bg-green-50 rounded border-r-2 border-green-300">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Package className="h-3 w-3 text-green-600" />
                                  <span className="font-medium text-green-800">{request.partName}</span>
                                  <Badge variant="outline" className="text-xs">
                                    كمية: {request.quantity}
                                  </Badge>
                                </div>
                                <div className="text-xs text-green-600 mt-1">
                                  المهندس: {request.engineerName} | {request.reasonType === "expense" ? "مصروف" : "عارية"}
                                </div>
                              </div>
                              <Badge className={getPartsRequestStatusColor(request.status)}>
                                {getPartsRequestStatusText(request.status)}
                              </Badge>
                            </div>
                            {request.notes && (
                              <div className="text-xs text-gray-600 mt-1 bg-white p-1 rounded">
                                {request.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* أزرار الإجراءات */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                {/* Show Send to Workshop button only for فارس users on received cars */}
                {receipt.status === "received" && user?.username === "فارس" && (
                  <Button 
                    onClick={() => sendToWorkshopMutation.mutate(receipt.id)}
                    disabled={sendToWorkshopMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {sendToWorkshopMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Bell className="h-4 w-4 mr-2" />
                        إرسال للورشة
                      </>
                    )}
                  </Button>
                )}

                {/* Buttons for بدوي user */}
                {user?.username === "بدوي" && (
                  <>
                    {/* Show enter button for received cars */}
                    {receipt.status === "received" && (
                      <Button 
                        onClick={() => enterWorkshopMutation.mutate(receipt.id)}
                        disabled={enterWorkshopMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {enterWorkshopMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            جاري الإدخال...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            إدخال للورشة
                          </>
                        )}
                      </Button>
                    )}

                    {/* Show enter button for postponed cars */}
                    {receipt.status === "postponed" && (
                      <Button 
                        onClick={() => enterWorkshopMutation.mutate(receipt.id)}
                        disabled={enterWorkshopMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {enterWorkshopMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            جاري الإدخال...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            إدخال
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}

                {/* Status messages */}
                {receipt.status === "workshop_pending" && user?.username !== "بدوي" && (
                  <div className="text-sm text-orange-600 font-medium">
                    <Bell className="h-4 w-4 inline mr-1" />
                    تم إرسال الإشعار - بانتظار دخول الورشة
                  </div>
                )}
                {receipt.status === "postponed" && (
                  <div className="text-sm text-yellow-600 font-medium">
                    <Bell className="h-4 w-4 inline mr-1" />
                    تم تأجيل الإدخال - بانتظار التسليم للورشة
                  </div>
                )}
                {receipt.status === "completed" && (
                  <div className="text-sm text-green-600 font-medium">
                    <Check className="h-4 w-4 inline mr-1" />
                    تم إدخال السيارة للورشة - مستلمة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}