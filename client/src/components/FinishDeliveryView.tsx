import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Car, Clock, Search, Fuel, Gauge } from "lucide-react";
import type { ReceptionEntry } from "@shared/schema";

export default function FinishDeliveryView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [receptionTimer, setReceptionTimer] = useState<{[key: number]: {startTime: Date, elapsed: number, isRunning: boolean}}>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reception entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["/api/reception-entries"],
  });

  // Function to start reception timer
  const startReceptionTimer = (entryId: number) => {
    const now = new Date();
    setReceptionTimer(prev => ({
      ...prev,
      [entryId]: {
        startTime: now,
        elapsed: 0,
        isRunning: true
      }
    }));
  };

  // Function to pause reception timer
  const pauseReceptionTimer = (entryId: number) => {
    setReceptionTimer(prev => {
      if (!prev[entryId]) return prev;
      const now = new Date();
      const additionalElapsed = prev[entryId].isRunning 
        ? Math.floor((now.getTime() - prev[entryId].startTime.getTime()) / 1000)
        : 0;
      
      return {
        ...prev,
        [entryId]: {
          ...prev[entryId],
          elapsed: prev[entryId].elapsed + additionalElapsed,
          isRunning: false
        }
      };
    });
  };

  // Function to finish timer and deliver car (for بدوي)
  const finishTimerAndDeliver = async (entryId: number, licensePlate: string) => {
    // Stop the timer first
    pauseReceptionTimer(entryId);
    
    // Update car status to delivered
    try {
      await fetch(`/api/reception-entries/${entryId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "مكتمل",
          completedBy: "بدوي"
        }),
      });
      
      toast({
        title: "تم تسليم السيارة",
        description: `تم انهاء المؤقت وتسليم السيارة ${licensePlate} بنجاح`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/reception-entries"] });
      
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسليم السيارة",
        variant: "destructive",
      });
    }
  };

  // Function to format timer display
  const formatTimerDisplay = (entryId: number) => {
    const timer = receptionTimer[entryId];
    if (!timer) return "00:00:00";
    
    const now = new Date();
    const elapsed = timer.isRunning 
      ? Math.floor((now.getTime() - timer.startTime.getTime()) / 1000) + timer.elapsed
      : timer.elapsed;
      
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Initialize timers for existing entries
  useEffect(() => {
    if (Array.isArray(entries) && entries.length > 0) {
      (entries as ReceptionEntry[]).forEach((entry: ReceptionEntry) => {
        if (!receptionTimer[entry.id] && entry.status !== "مكتمل") {
          // Start timer for entries that don't have one yet
          const entryTime = new Date(entry.entryTime || Date.now());
          const now = new Date();
          const elapsed = Math.floor((now.getTime() - entryTime.getTime()) / 1000);
          
          setReceptionTimer(prev => ({
            ...prev,
            [entry.id]: {
              startTime: entryTime,
              elapsed: Math.max(0, elapsed),
              isRunning: true // المؤقت يعمل دائماً
            }
          }));
        }
      });
    }
  }, [entries, receptionTimer]);

  // Timer effect for updating display
  useEffect(() => {
    const interval = setInterval(() => {
      // Update timer display by forcing re-render
      setReceptionTimer(prev => ({ ...prev }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Filter entries that can be delivered (not completed)
  const deliverableEntries = (entries as ReceptionEntry[]).filter((entry: ReceptionEntry) => {
    const matchesSearch = searchTerm === "" || 
      entry.carOwnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch && entry.status !== "مكتمل";
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>جاري تحميل بيانات السيارات...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            انهاء المؤقت وتسليم السيارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث بالاسم أو رقم اللوحة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </div>

          {/* Cars ready for delivery */}
          {deliverableEntries.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {searchTerm ? "لا توجد سيارات تطابق البحث" : "لا توجد سيارات جاهزة للتسليم"}
            </div>
          ) : (
            <div className="space-y-3">
              {deliverableEntries.map((entry: ReceptionEntry) => (
                <Card key={entry.id} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{entry.carOwnerName}</h4>
                          <Badge 
                            variant={
                              entry.status === "في الاستقبال" ? "default" : 
                              entry.status === "في الورشة" ? "secondary" : "destructive"
                            }
                          >
                            {entry.status}
                          </Badge>
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
                            عداد الدخول: {entry.odometerReading?.toLocaleString()} كم
                          </div>
                          
                          {/* Timer display */}
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className={`font-mono text-sm px-2 py-1 rounded ${
                              receptionTimer[entry.id]?.isRunning 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              المؤقت: {formatTimerDisplay(entry.id)}
                              {receptionTimer[entry.id]?.isRunning && (
                                <span className="ml-1 text-green-600">●</span>
                              )}
                            </span>
                          </div>

                          {entry.complaints && (
                            <div className="text-gray-500 italic">
                              الشكاوي: {entry.complaints}
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-400">
                            وقت التسجيل: {entry.entryTime ? new Date(entry.entryTime).toLocaleString('ar-SA') : 'غير محدد'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Finish and deliver button */}
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100 font-medium"
                          onClick={() => finishTimerAndDeliver(entry.id, entry.licensePlate)}
                        >
                          انهاء المؤقت وتسليم السيارة
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
    </div>
  );
}