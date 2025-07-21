import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';

interface NotificationData {
  id: number;
  engineer: string;
  partName: string;
  requestNumber: string;
  carInfo?: string;
  carBrand?: string;
  carModel?: string;
  returnReason?: string;
  type?: 'new' | 'returned';
}

export default function HabaNotificationDialog() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationData, setNotificationData] = useState<NotificationData | null>(null);

  useEffect(() => {
    // التحقق من أن المستخدم هو "هبة"
    if (user?.username !== 'هبة') {
      return;
    }

    const handleNewPartsRequest = (event: CustomEvent) => {
      const data = event.detail;
      setNotificationData({
        id: data.id,
        engineer: data.engineerName,
        partName: data.partName,
        requestNumber: data.requestNumber,
        carInfo: data.carInfo,
        carBrand: data.carBrand,
        carModel: data.carModel,
        type: 'new'
      });
      setIsOpen(true);
    };

    const handlePartsRequestReturned = (event: CustomEvent) => {
      const data = event.detail;
      setNotificationData({
        id: data.id,
        engineer: data.engineerName,
        partName: data.partName,
        requestNumber: data.requestNumber,
        returnReason: data.returnReason,
        type: 'returned'
      });
      setIsOpen(true);
    };

    // الاستماع للطلبات الجديدة وترجيع القطع
    window.addEventListener('newPartsRequest', handleNewPartsRequest as EventListener);
    window.addEventListener('partsRequestReturned', handlePartsRequestReturned as EventListener);

    return () => {
      window.removeEventListener('newPartsRequest', handleNewPartsRequest as EventListener);
      window.removeEventListener('partsRequestReturned', handlePartsRequestReturned as EventListener);
    };
  }, [user]);

  const handleAccept = () => {
    setIsOpen(false);
    setNotificationData(null);
  };

  if (!isOpen || !notificationData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-blue-50 border-blue-200" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-6 w-6" />
            {notificationData.type === 'returned' ? (
              <span className="text-red-800">تم ترجيع القطعة</span>
            ) : (
              <span className="text-blue-800">طلب قطعة جديد</span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-3">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
            <h3 className="font-semibold text-gray-800 mb-2">تفاصيل الطلب:</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">رقم الطلب:</span>
                <span className="font-medium text-blue-600">{notificationData.requestNumber}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">المهندس:</span>
                <span className="font-medium">{notificationData.engineer}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">اسم القطعة:</span>
                <span className="font-medium">{notificationData.partName}</span>
              </div>
              
              {notificationData.carInfo && (
                <div className="flex justify-between">
                  <span className="text-gray-600">معلومات السيارة:</span>
                  <span className="font-medium">{notificationData.carInfo}</span>
                </div>
              )}
              
              {notificationData.carBrand && (
                <div className="flex justify-between">
                  <span className="text-gray-600">نوع السيارة:</span>
                  <span className="font-medium">{notificationData.carBrand} {notificationData.carModel}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-blue-100 p-3 rounded-lg">
            <p className="text-sm text-blue-700 text-center">
              🔔 يرجى مراجعة الطلب والموافقة عليه من قائمة الطلبات
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleAccept}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Check className="h-4 w-4 ml-2" />
            موافق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}