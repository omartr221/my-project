import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Wrench, Car, Clock, User, Fuel, Gauge, AlertCircle, CheckCircle } from "lucide-react";
import type { ReceptionEntry } from "@shared/schema";

export default function Workshop() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<ReceptionEntry[]>([]);

  // Fetch workshop notifications (cars waiting for entry)
  const { data: workshopNotifications = [], isLoading } = useQuery({
    queryKey: ["/api/workshop-notifications"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch all reception entries
  const { data: allEntries = [] } = useQuery({
    queryKey: ["/api/reception-entries"],
    refetchInterval: 5000,
  });

  // Enter car to workshop mutation
  const enterWorkshopMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const response = await fetch(`/api/reception-entries/${entryId}/enter-workshop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to enter car to workshop");
      }
      return response.json();
    },
    onSuccess: (data, entryId) => {
      toast({
        title: "تم إدخال السيارة للورشة",
        description: "تم تحديث حالة السيارة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/workshop-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reception-entries"] });
      
      // Remove from local notifications
      setNotifications(prev => prev.filter(n => n.id !== entryId));
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إدخال السيارة",
        description: error.message || "حدث خطأ أثناء إدخال السيارة للورشة",
        variant: "destructive",
      });
    },
  });

  // WebSocket connection for real-time notifications
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === "reception_entry_created" && message.data?.entry) {
          // Show notification for new car entry
          toast({
            title: "سيارة جديدة في الاستقبال!",
            description: message.data.message,
          });
          
          // Add to local notifications
          setNotifications(prev => [message.data.entry, ...prev]);
          
          // Refresh queries
          queryClient.invalidateQueries({ queryKey: ["/api/workshop-notifications"] });
        }
        
        if (message.type === "car_entered_workshop") {
          // Remove from notifications when car enters workshop
          const entryId = message.data?.entry?.id;
          if (entryId) {
            setNotifications(prev => prev.filter(n => n.id !== entryId));
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [toast, queryClient]);

  // Update local notifications when workshop notifications change
  useEffect(() => {
    if (workshopNotifications) {
      setNotifications(workshopNotifications);
    }
  }, [workshopNotifications]);



  const handleEnterWorkshop = (entryId: number) => {
    enterWorkshopMutation.mutate(entryId);
  };

  const workshopEntries = allEntries.filter((entry: ReceptionEntry) => entry.status === "workshop");
  const completedEntries = allEntries.filter((entry: ReceptionEntry) => entry.status === "completed");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">جاري التحميل...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="ml-2 h-5 w-5" />
            قسم الورشة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* New notifications */}
          {notifications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <AlertCircle className="ml-2 h-5 w-5 text-orange-500" />
                إشعارات جديدة ({notifications.length})
              </h3>
              <div className="space-y-3">
                {notifications.map((entry) => (
                  <Card key={entry.id} className="border-orange-200 bg-orange-50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{entry.carOwnerName}</h4>
                            <Badge variant="destructive" className="text-xs">جديد</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              {entry.licensePlate}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              نوع الصيانة: {entry.serviceType}
                            </div>
                            <div className="flex items-center gap-2">
                              <Fuel className="h-4 w-4" />
                              مستوى البنزين: {entry.fuelLevel}
                            </div>
                            <div className="flex items-center gap-2">
                              <Gauge className="h-4 w-4" />
                              العداد: {entry.odometerReading?.toLocaleString()} كم
                            </div>
                            {entry.complaints && (
                              <div className="text-gray-500 italic">
                                الشكاوي: {entry.complaints}
                              </div>
                            )}
                            <div className="text-xs text-gray-400">
                              وقت التسجيل: {new Date(entry.entryTime).toLocaleString('ar-SA')}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button 
                            onClick={() => handleEnterWorkshop(entry.id)}
                            disabled={enterWorkshopMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {enterWorkshopMutation.isPending ? "جاري الإدخال..." : "إدخال للورشة"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Cars in workshop */}
          {workshopEntries.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Wrench className="ml-2 h-5 w-5 text-blue-500" />
                السيارات في الورشة ({workshopEntries.length})
              </h3>
              <div className="space-y-3">
                {workshopEntries.map((entry: ReceptionEntry) => (
                  <Card key={entry.id} className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{entry.carOwnerName}</h4>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              {entry.licensePlate}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              نوع الصيانة: {entry.serviceType}
                            </div>
                            {entry.complaints && (
                              <div className="text-gray-500 italic">
                                الشكاوي: {entry.complaints}
                              </div>
                            )}
                            <div className="text-xs text-gray-400">
                              دخل الورشة: {entry.workshopEntryTime ? new Date(entry.workshopEntryTime).toLocaleString('ar-SA') : 'غير محدد'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed cars */}
          {completedEntries.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                السيارات المكتملة ({completedEntries.length})
              </h3>
              <div className="space-y-3">
                {completedEntries.slice(0, 10).map((entry: ReceptionEntry) => (
                  <Card key={entry.id} className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{entry.carOwnerName}</h4>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              {entry.licensePlate}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              نوع الصيانة: {entry.serviceType}
                            </div>
                            <div className="text-xs text-gray-400">
                              اكتمل في: {entry.workshopEntryTime ? new Date(entry.workshopEntryTime).toLocaleString('ar-SA') : 'غير محدد'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {notifications.length === 0 && workshopEntries.length === 0 && completedEntries.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              لا توجد سيارات في الورشة حالياً
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}