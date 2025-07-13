import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package2, Calendar, User, Car, FileText, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNotifications } from '@/hooks/useNotifications';
import { useEffect } from 'react';
import TestNotification from './TestNotification';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function RequestsList() {
  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['/api/parts-requests'],
    refetchInterval: 3000, // تحديث كل 3 ثوان
  });

  const { checkForNewRequests, hasPermission } = useNotifications();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // التحقق من صلاحية الموافقة والرفض
  const canApprove = user?.permissions?.includes('parts:approve');
  const canReject = user?.permissions?.includes('parts:reject');

  // وظيفة الموافقة على الطلب
  const approveMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await apiRequest('PATCH', `/api/parts-requests/${requestId}/status`, {
        status: 'approved',
        notes: 'تم الموافقة على الطلب'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الموافقة على الطلب",
        description: "تم الموافقة على طلب القطعة بنجاح",
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

  if (!requests || requests.length === 0) {
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
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'approved': return 'موافق عليه';
      case 'rejected': return 'مرفوض';
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
          <Badge variant="outline">
            {requests.filter(r => r.status === 'approved').length} موافق عليه
          </Badge>
          {hasPermission && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              🔔 الإشعارات مفعلة
            </Badge>
          )}
        </div>
      </div>

      {requests.map((request) => (
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
                  {format(new Date(request.requestedAt), 'PPP', { locale: ar })}
                </span>
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

            {/* الملاحظات */}
            {request.notes && (
              <div className="bg-blue-50 rounded-lg p-3">
                <span className="font-medium text-blue-800">ملاحظات:</span>
                <p className="text-blue-700 mt-1">{request.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}