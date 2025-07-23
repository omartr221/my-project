import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Package, AlertTriangle, Wrench, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

interface PartsRequest {
  id: number;
  requestNumber: string;
  engineerName: string;
  partName: string;
  quantity: number;
  status: string;
  requestedAt: string;
  carBrand: string;
  carModel: string;
}

interface Task {
  id: number;
  description: string;
  repairOperation: string;
  taskType: string;
  engineerName: string;
  status: string;
  createdAt: string;
  carBrand: string;
  carModel: string;
}

interface CustomerCar {
  carBrand: string;
  carModel: string;
  color?: string;
  licensePlate?: string;
  chassisNumber?: string;
  engineCode?: string;
  customerName?: string;
}

export default function PrepareDelivery() {
  const [licensePlate, setLicensePlate] = useState('');
  const [searchResults, setSearchResults] = useState<{
    car: CustomerCar | null;
    partsRequests: PartsRequest[];
    tasks: Task[];
  }>({ car: null, partsRequests: [], tasks: [] });
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!licensePlate.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم السيارة",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      // البحث عن بيانات السيارة
      const carResponse = await apiRequest('GET', `/api/car-search?q=${licensePlate}`);
      const carData = await carResponse.json();

      // إذا وجدنا بيانات السيارة، نستخدم رقم السيارة الكامل من البيانات
      const searchLicensePlate = carData?.licensePlate || licensePlate;

      // البحث عن طلبات القطع
      const partsResponse = await apiRequest('GET', `/api/parts-requests/by-car/${encodeURIComponent(searchLicensePlate)}`);
      const partsData = await partsResponse.json();

      // البحث عن المهام والشكاوي
      const tasksResponse = await apiRequest('GET', `/api/tasks/by-car/${encodeURIComponent(searchLicensePlate)}`);
      const tasksData = await tasksResponse.json();

      setSearchResults({
        car: carData,
        partsRequests: partsData,
        tasks: tasksData
      });

      if (!carData && partsData.length === 0 && tasksData.length === 0) {
        toast({
          title: "لا توجد نتائج",
          description: "لم يتم العثور على بيانات لهذه السيارة",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في البحث",
        description: "فشل في البحث عن بيانات السيارة",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'in_preparation': return 'bg-purple-100 text-purple-800';
      case 'awaiting_pickup': return 'bg-orange-100 text-orange-800';
      case 'parts_arrived': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-pink-100 text-pink-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'approved': return 'موافق عليه';
      case 'in_preparation': return 'قيد التحضير';
      case 'awaiting_pickup': return 'بانتظار الاستلام';
      case 'parts_arrived': return 'وصلت القطعة';
      case 'delivered': return 'تم التسليم';
      case 'rejected': return 'مرفوض';
      case 'returned': return 'مرتجع';
      case 'active': return 'نشط';
      case 'paused': return 'متوقف';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغى';
      default: return status;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Package className="h-5 w-5" />
            تجهيز للتسليم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="أدخل رقم السيارة (مثال: 516-6291)"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="h-4 w-4 ml-2" />
              {isSearching ? 'جاري البحث...' : 'بحث'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults.car && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Car className="h-5 w-5" />
              معلومات السيارة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">رقم السيارة</p>
                <p className="text-lg font-bold text-gray-900">{searchResults.car.licensePlate || licensePlate}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">الماركة</p>
                <p className="text-lg font-bold text-gray-900">{searchResults.car.carBrand}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">الموديل</p>
                <p className="text-lg font-bold text-gray-900">{searchResults.car.carModel}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">اسم الزبون</p>
                <p className="text-lg font-bold text-gray-900">{searchResults.car.customerName || 'غير متوفر'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {searchResults.partsRequests.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Package className="h-5 w-5" />
              طلبات القطع ({searchResults.partsRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchResults.partsRequests.map((request) => (
                <div key={request.id} className="bg-white p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-900">{request.requestNumber}</span>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusText(request.status)}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(request.requestedAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">القطعة: </span>
                      <span className="text-gray-900">{request.partName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">الكمية: </span>
                      <span className="text-gray-900">{request.quantity}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">المهندس: </span>
                      <span className="text-gray-900">{request.engineerName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {searchResults.tasks.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Wrench className="h-5 w-5" />
              المهام وعمليات الإصلاح ({searchResults.tasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchResults.tasks.map((task) => (
                <div key={task.id} className="bg-white p-4 rounded-lg border border-orange-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-orange-900">مهمة #{task.id}</span>
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusText(task.status)}
                      </Badge>
                      <Badge variant="outline" className="text-purple-700 border-purple-300">
                        {task.taskType}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(task.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">الوصف: </span>
                      <span className="text-gray-900">{task.description}</span>
                    </div>
                    {task.repairOperation && (
                      <div>
                        <span className="font-medium text-gray-600">عملية الإصلاح: </span>
                        <span className="text-gray-900">{task.repairOperation}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-600">المهندس: </span>
                      <span className="text-gray-900">{task.engineerName}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {licensePlate && !isSearching && !searchResults.car && searchResults.partsRequests.length === 0 && searchResults.tasks.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">لا توجد بيانات متاحة لرقم السيارة المدخل</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}