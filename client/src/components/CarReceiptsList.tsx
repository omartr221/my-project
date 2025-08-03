import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Car, Calendar, User, Phone, Gauge, Fuel, FileText, Edit, Trash2 } from "lucide-react";
import type { CarReceipt } from "@shared/schema";

export default function CarReceiptsList() {
  const { data: receipts = [], isLoading } = useQuery<CarReceipt[]>({
    queryKey: ["/api/car-receipts"],
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

  if (receipts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            لا توجد إيصالات استلام
          </h3>
          <p className="text-gray-500">
            لم يتم استلام أي سيارة بعد
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRepairTypeBadge = (type: string) => {
    const colors = {
      "ميكانيك": "bg-blue-100 text-blue-800",
      "كهربا": "bg-yellow-100 text-yellow-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getFuelLevelColor = (level: string) => {
    const colors = {
      "فارغ": "text-red-600",
      "ربع": "text-orange-600", 
      "نصف": "text-yellow-600",
      "ثلاثة أرباع": "text-blue-600",
      "ممتلئ": "text-green-600",
    };
    return colors[level as keyof typeof colors] || "text-gray-600";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">إيصالات استلام السيارات</h2>
        <Badge variant="outline" className="text-sm">
          {receipts.length} إيصال
        </Badge>
      </div>

      <div className="grid gap-4">
        {receipts.map((receipt) => (
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
                <div className="text-sm">
                  <span className="text-gray-500">طلبات الإصلاح:</span>
                  <div className="mt-1 p-2 bg-blue-50 rounded border-r-2 border-blue-300">
                    <p className="text-blue-800 whitespace-pre-line">{receipt.repairType}</p>
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
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">عداد الدخول:</span>
                    <span className="font-medium">{receipt.entryMileage}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">نسبة البنزين:</span>
                    <span className={`font-medium ${getFuelLevelColor(receipt.fuelLevel)}`}>
                      {receipt.fuelLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* معلومات إضافية */}
              {(receipt.chassisNumber || receipt.engineCode) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                  {receipt.chassisNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">رقم الشاسيه:</span>
                      <span className="font-mono">{receipt.chassisNumber}</span>
                    </div>
                  )}
                  {receipt.engineCode && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">رمز المحرك:</span>
                      <span className="font-mono">{receipt.engineCode}</span>
                    </div>
                  )}
                </div>
              )}

              {/* الملاحظات */}
              {receipt.entryNotes && (
                <div className="pt-2 border-t">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-500">الشكوى:</span>
                      <p className="text-sm mt-1 bg-gray-50 p-2 rounded">{receipt.entryNotes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* معلومات الاستلام */}
              <div className="flex items-center justify-between pt-2 border-t text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>استلمها: {receipt.receivedBy}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                    تعديل
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                    حذف
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}