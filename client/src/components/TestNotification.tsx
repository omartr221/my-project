import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/use-auth';

export default function TestNotification() {
  const { sendNotification } = useNotifications();
  const { user } = useAuth();

  const testNotification = () => {
    sendNotification(
      '🔔 اختبار الإشعار',
      'هذا اختبار للتأكد من عمل الإشعارات والصوت',
      {
        data: { type: 'test' }
      }
    );
  };

  if (user?.username !== 'هبة') {
    return null;
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg mb-4">
      <h3 className="font-semibold mb-2">اختبار الإشعارات</h3>
      <p className="text-sm text-gray-600 mb-3">
        اضغط على الزر لاختبار الإشعارات والصوت
      </p>
      <Button onClick={testNotification} size="sm">
        اختبار الإشعار والصوت
      </Button>
    </div>
  );
}