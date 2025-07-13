import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/use-auth';
import { AlertTriangle, Volume2, VolumeX } from 'lucide-react';

export default function TestNotification() {
  const { startRepeatingAlert, stopRepeatingAlert, isAlertActive, currentAlert } = useNotifications();
  const { user } = useAuth();

  const testRepeatingAlert = () => {
    startRepeatingAlert(
      '🔔 اختبار التنبيه المتكرر',
      'هذا اختبار للتنبيه المتكرر كل 30 ثانية\nسيتوقف عند الضغط على زر إيقاف التنبيه'
    );
  };

  if (user?.username !== 'هبة') {
    return null;
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg mb-4">
      <h3 className="font-semibold mb-2">اختبار التنبيهات المتكررة</h3>
      <p className="text-sm text-gray-600 mb-3">
        اختبر التنبيه المتكرر كل 30 ثانية مع النغمة القوية
      </p>
      
      {isAlertActive && (
        <div className="mb-3 p-2 bg-red-100 rounded-lg">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            تنبيه نشط: {currentAlert?.title}
          </p>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button 
          onClick={testRepeatingAlert} 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isAlertActive}
        >
          <Volume2 className="h-4 w-4 mr-2" />
          اختبار التنبيه المتكرر
        </Button>
        
        {isAlertActive && (
          <Button 
            onClick={stopRepeatingAlert} 
            size="sm" 
            variant="destructive"
          >
            <VolumeX className="h-4 w-4 mr-2" />
            إيقاف التنبيه
          </Button>
        )}
      </div>
    </div>
  );
}