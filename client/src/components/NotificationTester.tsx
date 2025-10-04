import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Bell, TestTube } from 'lucide-react';

export default function NotificationTester() {
  const { user } = useAuth();

  const testServiceWorkerNotification = async () => {
    try {
      console.log('🧪 اختبار إشعار Service Worker...');
      
      // Check if Service Worker is available
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration('/');
        
        if (registration) {
          console.log('✅ Service Worker موجود');
          
          // Send message to Service Worker
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'SHOW_NOTIFICATION',
              payload: {
                title: '🧪 اختبار تنبيه خارجي',
                body: 'هذا اختبار للتنبيهات خارج النظام - يجب أن يظهر حتى لو أغلقت المتصفح',
                icon: '/vite.svg',
                badge: '/vite.svg',
                tag: 'test-notification',
                requireInteraction: true,
                data: { test: true }
              }
            });
            console.log('✅ تم إرسال رسالة للـ Service Worker');
          } else {
            console.warn('⚠️ Service Worker غير نشط');
            
            // Alternative: Show notification directly via registration
            await registration.showNotification('🧪 اختبار تنبيه خارجي', {
              body: 'هذا اختبار للتنبيهات خارج النظام - يجب أن يظهر حتى لو أغلقت المتصفح',
              icon: '/vite.svg',
              badge: '/vite.svg',
              tag: 'test-notification',
              requireInteraction: true,
              data: { test: true }
            });
          }
        } else {
          console.error('❌ Service Worker غير مسجل');
        }
      } else {
        console.error('❌ Service Worker غير مدعوم');
      }
    } catch (error) {
      console.error('❌ خطأ في اختبار التنبيه:', error);
    }
  };

  const testRegularNotification = () => {
    console.log('🧪 اختبار إشعار عادي...');
    
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('🧪 اختبار تنبيه عادي', {
          body: 'هذا اختبار للتنبيهات العادية - يظهر فقط عند فتح النظام',
          icon: '/vite.svg',
          tag: 'test-regular-notification'
        });
      } else {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('🧪 اختبار تنبيه عادي', {
              body: 'هذا اختبار للتنبيهات العادية - يظهر فقط عند فتح النظام',
              icon: '/vite.svg',
              tag: 'test-regular-notification'
            });
          }
        });
      }
    }
  };

  // Only show for هبة
  if (user?.username !== 'هبة') {
    return null;
  }

  return (
    <Card className="mb-6 bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Bell className="h-5 w-5" />
          اختبار نظام التنبيهات المحسن
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-blue-700">
            تم تحديث نظام التنبيهات ليعمل خارج النظام أيضاً. اختبر كلا النوعين:
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={testServiceWorkerNotification}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <TestTube className="h-4 w-4 mr-2" />
              تنبيه خارجي (Service Worker)
            </Button>
            
            <Button 
              onClick={testRegularNotification}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              size="sm"
            >
              <Bell className="h-4 w-4 mr-2" />
              تنبيه عادي
            </Button>
          </div>
          
          <div className="text-xs text-gray-600 space-y-1">
            <p>• <strong>التنبيه الخارجي:</strong> يظهر حتى لو أغلقت المتصفح أو النظام</p>
            <p>• <strong>التنبيه العادي:</strong> يظهر فقط عند فتح النظام</p>
            <p>• <strong>طلبات القطع:</strong> ستستخدم التنبيه الخارجي تلقائياً</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}