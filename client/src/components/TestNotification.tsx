import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/use-auth';
import { AlertTriangle, Volume2, VolumeX } from 'lucide-react';

export default function TestNotification() {
  const { user } = useAuth();

  const testNotification = () => {
    console.log('🧪 بدء اختبار التنبيه...');
    // محاكاة طلب قطعة جديد
    window.dispatchEvent(new CustomEvent('newPartsRequest', {
      detail: {
        id: 999,
        engineer: 'مهندس الاختبار',
        engineerName: 'مهندس الاختبار',
        partName: 'قطعة اختبار',
        requestNumber: 'طلب-اختبار',
        carInfo: 'اختبار النظام',
        carBrand: 'AUDI',
        carModel: 'A4'
      }
    }));
  };

  if (user?.username !== 'هبة') {
    return null;
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg mb-4">
      <h3 className="font-semibold mb-2">اختبار التنبيهات</h3>
      <p className="text-sm text-gray-600 mb-3">
        اختبر التنبيه لمرة واحدة عند استلام طلب جديد
      </p>
      
      <div className="flex gap-2">
        <Button 
          onClick={testNotification} 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Volume2 className="h-4 w-4 mr-2" />
          اختبار التنبيه
        </Button>
      </div>
    </div>
  );
}