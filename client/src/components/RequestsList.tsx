import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package2, Calendar, User, Car, FileText, Check, X, Clock, ShoppingCart, AlertCircle } from 'lucide-react';
import { formatTime, formatDate } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { useEffect } from 'react';
import TestNotification from './TestNotification';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function RequestsList() {
  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['/api/parts-requests'],
    refetchInterval: 3000, // تحديث كل 3 ثوان
  });

  const { checkForNewRequests, hasPermission } = useNotifications();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // التحقق من صلاحية الموافقة والرفض والتسليم
  const canApprove = user?.permissions?.includes('parts:approve');
  const canReject = user?.permissions?.includes('parts:reject');
  const canDeliver = user?.permissions?.includes('parts:create'); // بدوي يمكنه التسليم
  
  // Debug info - User permissions
  console.log('RequestsList - User:', user?.username);
  console.log('RequestsList - Can deliver:', canDeliver);

  // وظيفة الموافقة على الطلب - تحويل إلى قيد التحضير
  const approveMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await apiRequest('PATCH', `/api/parts-requests/${requestId}/status`, {
        status: 'in_preparation',
        notes: 'تم الموافقة على الطلب وهو الآن قيد التحضير'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الموافقة على الطلب",
        description: "الطلب الآن قيد التحضير",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parts-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الموافقة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // وظيفة تغيير الحالة إلى بانتظار الاستلام
  const readyForPickupMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await apiRequest('PATCH', `/api/parts-requests/${requestId}/status`, {
        status: 'awaiting_pickup',
        notes: 'القطعة جاهزة للاستلام'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الحالة",
        description: "القطعة جاهزة للاستلام",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parts-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // وظيفة تحديث الحالة إلى "تم الطلب خارجياً"
  const orderExternallyMutation = useMutation({
    mutationFn: async ({requestId, estimatedArrival}: {requestId: number, estimatedArrival: string}) => {
      const response = await apiRequest('PATCH', `/api/parts-requests/${requestId}/status`, {
        status: 'ordered_externally',
        notes: `تم الطلب خارجياً - التوقيت المتوقع: ${estimatedArrival}`,
        estimatedArrival
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الحالة",
        description: "تم الطلب خارجياً",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parts-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // وظيفة تحديث الحالة إلى "غير متوفر"
  const markUnavailableMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await apiRequest('PATCH', `/api/parts-requests/${requestId}/status`, {
        status: 'unavailable',
        notes: 'القطعة غير متوفرة'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الحالة",
        description: "تم تحديد القطعة كغير متوفرة",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parts-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // وظيفة تحديث الحالة إلى "وصلت القطعة بانتظار التسليم"
  const partsArrivedMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await apiRequest('PATCH', `/api/parts-requests/${requestId}/status`, {
        status: 'parts_arrived',
        notes: 'وصلت القطعة وهي بانتظار التسليم'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الحالة",
        description: "وصلت القطعة وهي بانتظار التسليم",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parts-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // وظيفة التسليم النهائي - تم الاستلام
  const finalDeliveryMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await apiRequest('PATCH', `/api/parts-requests/${requestId}/status`, {
        status: 'delivered',
        notes: 'تم الاستلام بنجاح'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الاستلام بنجاح",
        description: "تم إنهاء الطلب بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parts-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التسليم",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // وظيفة رفض الطلب
  const rejectMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await apiRequest('PATCH', `/api/parts-requests/${requestId}/status`, {
        status: 'rejected',
        notes: 'تم رفض الطلب'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم رفض الطلب",
        description: "تم رفض طلب القطعة",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parts-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الرفض",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // مراقبة الطلبات الجديدة
  useEffect(() => {
    if (requests) {
      checkForNewRequests(requests);
    }
  }, [requests, checkForNewRequests]);

  // WebSocket integration لإشعار التسليم
  useEffect(() => {
    if (user?.username === 'هبة') {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
        
        ws.onmessage = (event) => {
          const { type, data } = JSON.parse(event.data);
          
          if (type === 'parts_request_delivered') {
            // إرسال حدث مخصص للإشعار بالتسليم
            window.dispatchEvent(new CustomEvent('partsRequestDelivered', { detail: data }));
          }

          if (type === 'parts_request_returned') {
            // إرسال حدث مخصص للإشعار بترجيع القطعة
            window.dispatchEvent(new CustomEvent('partsRequestReturned', { detail: data }));
          }
        };
        
        ws.onerror = (error) => {
          console.log('WebSocket error:', error);
        };
        
        return () => {
          ws.close();
        };
      } catch (error) {
        console.log('WebSocket connection failed:', error);
      }
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">خطأ في تحميل الطلبات</p>
      </div>
    );
  }

  if (!requests) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <Package2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">لا توجد طلبات جديدة</p>
        <p className="text-gray-400 text-sm mt-2">
          ستظهر هنا الطلبات الواردة من المستخدمين الآخرين
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in_preparation': return 'bg-blue-100 text-blue-800';
      case 'awaiting_pickup': return 'bg-purple-100 text-purple-800';
      case 'ordered_externally': return 'bg-orange-100 text-orange-800';
      case 'parts_arrived': return 'bg-emerald-100 text-emerald-800';
      case 'unavailable': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'delivered': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'approved': return 'موافق عليه';
      case 'in_preparation': return 'قيد التحضير';
      case 'awaiting_pickup': return 'بانتظار الاستلام';
      case 'ordered_externally': return 'تم الطلب خارجياً';
      case 'parts_arrived': return 'وصلت القطعة بانتظار التسليم';
      case 'unavailable': return 'غير متوفر';
      case 'rejected': return 'مرفوض';
      case 'delivered': return 'تم الاستلام';
      default: return 'غير محدد';
    }
  };

  return (
    <div className="space-y-4">
      <TestNotification />
      


      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          إجمالي الطلبات: {requests.length}
        </h3>
        <div className="flex space-x-reverse space-x-2">
          <Badge variant="secondary">
            {requests.filter(r => r.status === 'pending').length} في الانتظار
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {requests.filter(r => r.status === 'in_preparation').length} قيد التحضير
          </Badge>
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            {requests.filter(r => r.status === 'awaiting_pickup').length} بانتظار الاستلام
          </Badge>
          {hasPermission && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              🔔 الإشعارات مفعلة
            </Badge>
          )}
        </div>
      </div>

      {requests.map((request) => {
        // Process request for delivery button
        console.log(`Request ${request.id} - Status: ${request.status} - Can deliver: ${canDeliver}`);
        console.log(`User info:`, user);
        return (
        <Card key={request.id} className="border-r-4 border-r-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            

            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-reverse space-x-2">
                <Package2 className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">{request.requestNumber}</CardTitle>
              </div>
              <Badge className={getStatusColor(request.status)}>
                {getStatusText(request.status)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* معلومات الطلب */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-reverse space-x-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="font-medium">المهندس:</span>
                <span>{request.engineerName}</span>
              </div>
              
              <div className="flex items-center space-x-reverse space-x-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="font-medium">التاريخ:</span>
                <span>
                  {formatDate(request.requestedAt)}
                </span>
              </div>
            </div>
            
            {/* سجل التوقيتات */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-reverse space-x-2 mb-3">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">سجل المهام</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-reverse space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>تم الطلب: {formatTime(request.requestedAt)}</span>
                </div>
                
                {request.approvedAt && (
                  <div className="flex items-center space-x-reverse space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>تم الموافقة: {formatTime(request.approvedAt)}</span>
                  </div>
                )}
                
                {request.inPreparationAt && (
                  <div className="flex items-center space-x-reverse space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>قيد التحضير: {formatTime(request.inPreparationAt)}</span>
                  </div>
                )}
                
                {request.readyForPickupAt && (
                  <div className="flex items-center space-x-reverse space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>جاهز للاستلام: {formatTime(request.readyForPickupAt)}</span>
                  </div>
                )}
                
                {request.orderedExternallyAt && (
                  <div className="flex items-center space-x-reverse space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>تم الطلب خارجياً: {formatTime(request.orderedExternallyAt)}</span>
                  </div>
                )}
                
                {request.estimatedArrival && (
                  <div className="flex items-center space-x-reverse space-x-2">
                    <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                    <span>التوقيت المتوقع: {request.estimatedArrival}</span>
                  </div>
                )}
                
                {request.partsArrivedAt && (
                  <div className="flex items-center space-x-reverse space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>وصلت القطعة: {formatTime(request.partsArrivedAt)}</span>
                  </div>
                )}
                
                {request.deliveredAt && (
                  <div className="flex items-center space-x-reverse space-x-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span>تم الاستلام: {formatTime(request.deliveredAt)}</span>
                  </div>
                )}
                
                {request.unavailableAt && (
                  <div className="flex items-center space-x-reverse space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span>غير متوفر: {formatTime(request.unavailableAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* معلومات السيارة */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-reverse space-x-2 mb-2">
                <Car className="h-4 w-4 text-gray-600" />
                <span className="font-medium">معلومات السيارة:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                {request.licensePlate && (
                  <div>
                    <span className="font-medium">رقم السيارة:</span> {request.licensePlate}
                  </div>
                )}
                {request.chassisNumber && (
                  <div>
                    <span className="font-medium">رقم الشاسيه:</span> {request.chassisNumber}
                  </div>
                )}
                {request.engineCode && (
                  <div>
                    <span className="font-medium">رمز المحرك:</span> {request.engineCode}
                  </div>
                )}
              </div>
            </div>

            {/* سبب الطلب */}
            <div className="space-y-2">
              <div className="flex items-center space-x-reverse space-x-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="font-medium">سبب الطلب:</span>
                <span>{request.reasonType === 'expense' ? 'صرف' : 'إعارة'}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">اسم القطعة:</span> {request.partName}
                </div>
                <div>
                  <span className="font-medium">العدد:</span> {request.quantity}
                </div>
              </div>
            </div>

            {/* أزرار التحكم */}
            {request.status === 'pending' && (canApprove || canReject) && (
              <div className="flex space-x-reverse space-x-2 pt-4 border-t">
                {canApprove && (
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => approveMutation.mutate(request.id)}
                    disabled={approveMutation.isPending}
                  >
                    {approveMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Check className="h-4 w-4 ml-1" />
                    )}
                    موافقة
                  </Button>
                )}
                {canReject && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => rejectMutation.mutate(request.id)}
                    disabled={rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <X className="h-4 w-4 ml-1" />
                    )}
                    رفض
                  </Button>
                )}
              </div>
            )}



            {/* أزرار تحديث الحالة لقيد التحضير */}
            {request.status === 'in_preparation' && canApprove && (
              <div className="flex space-x-reverse space-x-2 pt-4 border-t flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => readyForPickupMutation.mutate(request.id)}
                  disabled={readyForPickupMutation.isPending}
                >
                  {readyForPickupMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Clock className="h-4 w-4 ml-1" />
                  )}
                  جاهز للاستلام
                </Button>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-orange-50 border-orange-500 text-orange-700 hover:bg-orange-100"
                    >
                      <ShoppingCart className="h-4 w-4 ml-1" />
                      تم الطلب خارجياً
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>تم الطلب خارجياً</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="arrival" className="text-right">
                          التوقيت المتوقع
                        </Label>
                        <Input
                          id="arrival"
                          value={estimatedArrival}
                          onChange={(e) => setEstimatedArrival(e.target.value)}
                          placeholder="مثال: يوم الأحد 2:00 مساءً"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-reverse space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        إلغاء
                      </Button>
                      <Button
                        onClick={() => {
                          if (estimatedArrival.trim()) {
                            orderExternallyMutation.mutate({
                              requestId: request.id,
                              estimatedArrival: estimatedArrival.trim()
                            });
                            setEstimatedArrival('');
                            setIsDialogOpen(false);
                          }
                        }}
                        disabled={orderExternallyMutation.isPending || !estimatedArrival.trim()}
                      >
                        تأكيد
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  variant="outline"
                  className="bg-gray-50 border-gray-500 text-gray-700 hover:bg-gray-100"
                  onClick={() => markUnavailableMutation.mutate(request.id)}
                  disabled={markUnavailableMutation.isPending}
                >
                  {markUnavailableMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  ) : (
                    <AlertCircle className="h-4 w-4 ml-1" />
                  )}
                  غير متوفر
                </Button>
              </div>
            )}

            {/* زر تحديث الحالة للطلبات المطلوبة خارجياً فقط */}
            {request.status === 'ordered_externally' && (
              <div className="flex space-x-reverse space-x-2 pt-4 border-t">
                <Button
                  size="sm"
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => partsArrivedMutation.mutate(request.id)}
                  disabled={partsArrivedMutation.isPending}
                >
                  {partsArrivedMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Package2 className="h-4 w-4 ml-1" />
                  )}
                  وصلت القطعة بانتظار التسليم
                </Button>
              </div>
            )}

            {/* زر تسليم لبدوي - للطلبات الجاهزة */}
            {(() => {
              const showButton = user?.username === 'بدوي' && (request.status === 'parts_arrived' || request.status === 'awaiting_pickup');
              console.log(`Debug - Request ${request.id}: User=${user?.username}, Status=${request.status}, ShowButton=${showButton}`);
              return showButton;
            })() && (
              <div className="flex space-x-reverse space-x-2 pt-4 border-t bg-yellow-50 p-2 rounded">
                <Button
                  size="sm"
                  variant="default"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                  onClick={() => {
                    console.log('تسليم button clicked for request:', request.id);
                    finalDeliveryMutation.mutate(request.id);
                  }}
                  disabled={finalDeliveryMutation.isPending}
                >
                  {finalDeliveryMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Check className="h-4 w-4 ml-1" />
                  )}
                  تسليم
                </Button>
              </div>
            )}




            


            {/* الملاحظات */}
            {request.notes && (
              <div className="bg-blue-50 rounded-lg p-3">
                <span className="font-medium text-blue-800">ملاحظات:</span>
                <p className="text-blue-700 mt-1">{request.notes}</p>
              </div>
            )}
            

          </CardContent>
        </Card>
        );
      })}
    </div>
  );
}