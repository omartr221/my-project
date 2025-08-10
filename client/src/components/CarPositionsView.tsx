import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Car, Clock, Search, User, MapPin, Fuel, Gauge, Package2 } from "lucide-react";
import type { ReceptionEntry, CarStatus } from "@shared/schema";

export default function CarPositionsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch reception entries
  const { data: receptionEntries = [], isLoading: loadingReception } = useQuery({
    queryKey: ["/api/reception-entries"],
  });

  // Fetch car statuses
  const { data: carStatuses = [], isLoading: loadingStatuses } = useQuery({
    queryKey: ["/api/car-status"],
  });

  // Fetch parts requests
  const { data: partsRequests = [] } = useQuery({
    queryKey: ["/api/parts-requests"],
  });

  // Combine data for comprehensive car positions view
  const combinedData = (receptionEntries as ReceptionEntry[]).map((entry: ReceptionEntry) => {
    const carStatus = (carStatuses as CarStatus[]).find((status: CarStatus) => 
      status.licensePlate === entry.licensePlate
    );
    
    const relatedPartsRequests = Array.isArray(partsRequests) ? 
      (partsRequests as any[]).filter((req: any) => req.licensePlate === entry.licensePlate) : [];

    return {
      ...entry,
      carStatus,
      partsRequestsCount: relatedPartsRequests.length,
      pendingPartsRequests: relatedPartsRequests.filter((req: any) => req.status === 'pending').length,
      deliveredPartsRequests: relatedPartsRequests.filter((req: any) => req.status === 'delivered').length,
    };
  });

  // Filter data based on search and status
  const filteredData = combinedData.filter((item) => {
    const matchesSearch = searchTerm === "" || 
      item.carOwnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case "في الاستقبال":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "في الورشة":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "مكتمل":
        return "bg-green-100 text-green-800 border-green-300";
      case "متأجل":
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Time since entry calculation
  const getTimeSinceEntry = (entryTime: string | Date) => {
    if (!entryTime) return "غير محدد";
    
    const now = new Date();
    const entry = new Date(entryTime);
    const diffInSeconds = Math.floor((now.getTime() - entry.getTime()) / 1000);
    
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ساعة و ${minutes} دقيقة`;
    } else {
      return `${minutes} دقيقة`;
    }
  };

  if (loadingReception || loadingStatuses) {
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
            وضع السيارات - عرض شامل
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                الكل ({combinedData.length})
              </Button>
              <Button
                variant={statusFilter === "في الاستقبال" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("في الاستقبال")}
              >
                في الاستقبال ({combinedData.filter(item => item.status === "في الاستقبال").length})
              </Button>
              <Button
                variant={statusFilter === "في الورشة" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("في الورشة")}
              >
                في الورشة ({combinedData.filter(item => item.status === "في الورشة").length})
              </Button>
              <Button
                variant={statusFilter === "مكتمل" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("مكتمل")}
              >
                مكتمل ({combinedData.filter(item => item.status === "مكتمل").length})
              </Button>
            </div>
          </div>

          {/* Cars Grid */}
          {filteredData.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {searchTerm || statusFilter !== "all" ? "لا توجد سيارات تطابق البحث" : "لا توجد سيارات مسجلة حالياً"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((item) => (
                <Card key={item.id} className="border-2 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{item.carOwnerName}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          {item.licensePlate}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(item.status)} border font-medium`}>
                        {item.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Service Type */}
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">نوع الصيانة:</span>
                      <span>{item.serviceType}</span>
                    </div>

                    {/* Odometer */}
                    <div className="flex items-center gap-2 text-sm">
                      <Gauge className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">عداد الدخول:</span>
                      <span>{item.odometerReading?.toLocaleString()} كم</span>
                    </div>

                    {/* Fuel Level */}
                    <div className="flex items-center gap-2 text-sm">
                      <Fuel className="h-4 w-4 text-green-600" />
                      <span className="font-medium">مستوى البنزين:</span>
                      <span>{item.fuelLevel}</span>
                    </div>

                    {/* Time Since Entry */}
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">منذ الدخول:</span>
                      <span>{getTimeSinceEntry(item.entryTime)}</span>
                    </div>

                    {/* Parts Requests Summary */}
                    {item.partsRequestsCount > 0 && (
                      <div className="bg-blue-50 p-2 rounded border border-blue-200">
                        <div className="flex items-center gap-2 text-sm">
                          <Package2 className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">طلبات القطع:</span>
                          <span>{item.partsRequestsCount}</span>
                        </div>
                        <div className="flex gap-2 mt-1 text-xs">
                          {item.pendingPartsRequests > 0 && (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                              {item.pendingPartsRequests} معلق
                            </span>
                          )}
                          {item.deliveredPartsRequests > 0 && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              {item.deliveredPartsRequests} مكتمل
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Complaints */}
                    {item.complaints && (
                      <div className="bg-gray-50 p-2 rounded border">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">الشكاوي:</span>
                          <p className="text-gray-600 mt-1">{item.complaints}</p>
                        </div>
                      </div>
                    )}

                    {/* Entry Date */}
                    <div className="text-xs text-gray-400 border-t pt-2">
                      تاريخ الدخول: {item.entryTime ? new Date(item.entryTime).toLocaleString('ar-SA') : 'غير محدد'}
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