import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

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
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // إعداد الصوت للتنبيه
  useEffect(() => {
    // إنشاء صوت التنبيه بطريقة برمجية
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playNotificationSound = () => {
      // إنشاء صوت تنبيه باستخدام Web Audio API
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };
    
    // حفظ دالة تشغيل الصوت
    (window as any).playCarWorkshopNotification = playNotificationSound;
    
    return () => {
      (window as any).playCarWorkshopNotification = null;
    };
  }, []);

  // إعداد WebSocket للتنبيهات (فقط لحساب بدوي)
  useEffect(() => {
    if (user?.username !== 'بدوي') return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connectWebSocket = () => {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('🔊 WebSocket connected for workshop notifications');
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // التحقق من إشعارات دخول السيارة للورشة
          if (data.type === 'car_entered_workshop' && data.data?.notifyBadawi) {
            console.log('🚗 New car entered workshop:', data.data);
            
            // تشغيل الصوت
            if ((window as any).playCarWorkshopNotification) {
              (window as any).playCarWorkshopNotification();
            }
            
            // عرض التنبيه
            toast({
              title: "🚗 سيارة جديدة في الورشة",
              description: `السيارة ${data.data.carInfo?.licensePlate} للعميل ${data.data.carInfo?.customerName} دخلت الورشة`,
              duration: 5000,
            });
            
            // تحديث البيانات
            queryClient.invalidateQueries({ queryKey: ['/api/car-status'] });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('🔊 WebSocket disconnected, attempting to reconnect...');
        setTimeout(connectWebSocket, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('🔊 WebSocket error:', error);
      };
    };
    
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user, toast, queryClient]);

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
      const response = await apiRequest("PATCH", `/api/car-status/${carId}`, {
        currentStatus: "في الاستقبال",
        returnedToReceptionAt: new Date().toISOString(),
        returnedBy: "بدوي"
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح ✅",
        description: "تم تسليم السيارة للاستقبال",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/car-status'] });
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