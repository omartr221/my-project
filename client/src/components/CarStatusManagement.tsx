import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Car, Calendar, User, ArrowRight, Bell, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { CarReceipt } from "@shared/schema";

export default function CarStatusManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Use global WebSocket hook for real-time updates
  useWebSocket();

  const { data: carReceipts = [], isLoading } = useQuery<CarReceipt[]>({
    queryKey: ["/api/car-receipts"],
  });

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

  const getStatusColor = (status: string) => {
    const colors = {
      "received": "bg-blue-100 text-blue-800",
      "workshop_pending": "bg-orange-100 text-orange-800", 
      "postponed": "bg-yellow-100 text-yellow-800",
      "in_workshop": "bg-green-100 text-green-800",
      "completed": "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      "received": "مستلمة",
      "workshop_pending": "بانتظار دخول الورشة",
      "postponed": "بانتظار التسليم للورشة",
      "in_workshop": "في الورشة", 
      "completed": "مكتملة",
    };
    return statusTexts[status as keyof typeof statusTexts] || "غير محدد";
  };

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

  // Filter cars based on user permissions
  const carsInReception = carReceipts.filter(receipt => {
    if (user?.username === "بدوي") {
      // بدوي can see all statuses including postponed cars
      return receipt.status === "received" || receipt.status === "workshop_pending" || receipt.status === "postponed";
    } else {
      // Other users (فارس, الاستقبال) cannot see postponed cars
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
                <Badge className={getStatusColor(receipt.status)}>
                  {getStatusText(receipt.status)}
                </Badge>
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
                    {/* Show postpone OR enter button for workshop_pending cars */}
                    {receipt.status === "workshop_pending" && (
                      <>
                        <Button 
                          onClick={() => postponeCarMutation.mutate(receipt.id)}
                          disabled={postponeCarMutation.isPending}
                          variant="outline"
                          className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                        >
                          {postponeCarMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                              جاري التأجيل...
                            </>
                          ) : (
                            "تأجيل"
                          )}
                        </Button>
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
                      </>
                    )}

                    {/* Show only enter button for postponed cars */}
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
                    تم إدخال السيارة للورشة
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