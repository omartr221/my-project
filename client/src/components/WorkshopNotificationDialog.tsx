import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Car, User, Gauge, Fuel, Bell, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { CarReceipt } from "@shared/schema";

interface WorkshopNotification {
  type: string;
  receipt: CarReceipt;
  message: string;
}

export default function WorkshopNotificationDialog() {
  const [notifications, setNotifications] = useState<WorkshopNotification[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  useEffect(() => {
    // Only show for "بدوي" user
    if (user?.username !== "بدوي") {
      return;
    }

    // Connect to WebSocket directly
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'CAR_RECEIPT_CREATED' || data.type === 'CAR_POSTPONED' || data.type === 'CAR_ENTERED_WORKSHOP') {
          // Handle car receipt creation notifications  
          if (data.data?.type === 'car-receipt-created' || data.type === 'CAR_RECEIPT_CREATED') {
            const notification: WorkshopNotification = {
              type: 'car-receipt-created',
              receipt: data.data?.receipt || data.data,
              message: data.data?.message || `تم استلام سيارة جديدة`
            };
            setNotifications(prev => [...prev, notification]);
            setShowDialog(true);
            
            // Play notification sound
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaXr6');
            audio.play().catch(() => {
              // Ignore audio errors if autoplay is blocked
            });
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    return () => {
      ws.close();
    };
  }, [user]);

  const handleEnterWorkshop = async (receiptId: number) => {
    await enterWorkshopMutation.mutateAsync(receiptId);
    
    // Remove this notification
    setNotifications(prev => prev.filter(n => n.receipt.id !== receiptId));
    
    // Close dialog if no more notifications
    if (notifications.length <= 1) {
      setShowDialog(false);
    }
  };

  const handleDismiss = (receiptId: number) => {
    setNotifications(prev => prev.filter(n => n.receipt.id !== receiptId));
    
    if (notifications.length <= 1) {
      setShowDialog(false);
    }
  };

  const handleDismissAll = () => {
    setNotifications([]);
    setShowDialog(false);
  };

  if (user?.username !== "بدوي" || notifications.length === 0) {
    return null;
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bell className="h-6 w-6 text-orange-600" />
            إشعار الورشة
          </DialogTitle>
          <DialogDescription>
            يوجد {notifications.length} سيارة جاهزة للدخول للورشة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <Card key={`${notification.receipt.id}-${index}`} className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Car className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {notification.receipt.receiptNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">
                    جاهزة للورشة
                  </Badge>
                </div>

                {/* معلومات السيارة */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{notification.receipt.licensePlate}</span>
                      <span className="text-gray-600">-</span>
                      <span>{notification.receipt.carBrand} {notification.receipt.carModel}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{notification.receipt.customerName}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">عداد الدخول:</span>
                      <span className="font-medium">{notification.receipt.entryMileage}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">نسبة البنزين:</span>
                      <span className="font-medium">{notification.receipt.fuelLevel}</span>
                    </div>
                  </div>
                </div>

                {/* طلبات الإصلاح */}
                <div className="mb-4">
                  <span className="text-sm text-gray-500">طلبات الإصلاح:</span>
                  <div className="mt-1 p-2 bg-blue-50 rounded border-r-2 border-blue-300">
                    <p className="text-blue-800 whitespace-pre-line text-sm">
                      {notification.receipt.repairType}
                    </p>
                  </div>
                </div>

                {/* الشكوى */}
                {notification.receipt.entryNotes && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">الشكوى:</span>
                    <div className="mt-1 p-2 bg-gray-50 rounded">
                      <p className="text-gray-800 text-sm">
                        {notification.receipt.entryNotes}
                      </p>
                    </div>
                  </div>
                )}

                {/* أزرار الإجراءات */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    onClick={() => handleEnterWorkshop(notification.receipt.id)}
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
                  <Button 
                    variant="outline"
                    onClick={() => handleDismiss(notification.receipt.id)}
                  >
                    تأجيل
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {notifications.length > 1 && (
          <div className="flex justify-center pt-4 border-t">
            <Button variant="outline" onClick={handleDismissAll}>
              إغلاق جميع الإشعارات
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}