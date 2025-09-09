import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Settings, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function NotificationDebugger() {
  const { user } = useAuth();
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<string>('غير محدد');
  const [notificationPermission, setNotificationPermission] = useState<string>('غير محدد');
  const [browserSupport, setBrowserSupport] = useState({
    serviceWorker: false,
    pushManager: false,
    notification: false
  });

  useEffect(() => {
    // فحص دعم المتصفح
    setBrowserSupport({
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      notification: 'Notification' in window
    });

    // فحص صلاحيات الإشعارات
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // فحص حالة Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length > 0) {
          const registration = registrations[0];
          if (registration.active) {
            setServiceWorkerStatus('نشط');
          } else if (registration.installing) {
            setServiceWorkerStatus('قيد التثبيت');
          } else if (registration.waiting) {
            setServiceWorkerStatus('في الانتظار');
          } else {
            setServiceWorkerStatus('غير نشط');
          }
        } else {
          setServiceWorkerStatus('غير مسجل');
        }
      });
    }
  }, []);

  const testNotification = async () => {
    if (!('Notification' in window)) {
      alert('هذا المتصفح لا يدعم الإشعارات');
      return;
    }

    // طلب الصلاحية إذا لم تكن موجودة
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }

    if (Notification.permission === 'granted') {
      // إرسال إشعار تجريبي
      const notification = new Notification('اختبار النظام', {
        body: 'إذا ظهر هذا الإشعار، فالنظام يعمل!',
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'test-notification',
        requireInteraction: true
      });

      // إغلاق الإشعار بعد 5 ثوان
      setTimeout(() => {
        notification.close();
      }, 5000);
    } else {
      alert('يجب السماح بالإشعارات لتعمل الميزة');
    }
  };

  const testServiceWorkerNotification = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: {
          title: 'اختبار Service Worker',
          body: 'إذا ظهر هذا الإشعار، فـ Service Worker يعمل!',
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: 'sw-test-notification',
          requireInteraction: true
        }
      });
    } else {
      alert('Service Worker غير متاح');
    }
  };

  const registerServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('Service Worker مسجل:', registration.scope);
        
        // انتظار حتى يصبح جاهز
        await navigator.serviceWorker.ready;
        setServiceWorkerStatus('نشط');
        alert('تم تسجيل Service Worker بنجاح!');
      }
    } catch (error) {
      console.error('خطأ في تسجيل Service Worker:', error);
      alert('فشل في تسجيل Service Worker');
    }
  };

  const simulatePartsRequest = () => {
    // محاكاة طلب قطعة جديد
    const event = new CustomEvent('newPartsRequest', {
      detail: {
        id: Math.floor(Math.random() * 1000),
        engineer: 'مهندس تجريبي',
        engineerName: 'مهندس تجريبي',
        partName: 'قطعة تجريبية للاختبار',
        requestNumber: 'TEST-' + Date.now()
      }
    });

    console.log('🔔 إرسال حدث newPartsRequest تجريبي');
    window.dispatchEvent(event);
  };

  // عرض الواجهة فقط للمستخدم "هبة"
  if (user?.username !== 'هبة') {
    return null;
  }

  const getStatusIcon = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    switch (status) {
      case 'granted':
      case 'نشط':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'denied':
      case 'غير مسجل':
      case 'غير نشط':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    }
    
    switch (status) {
      case 'granted':
      case 'نشط':
        return 'bg-green-100 text-green-800';
      case 'denied':
      case 'غير مسجل':
      case 'غير نشط':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          فحص نظام الإشعارات - {user.username}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* حالة دعم المتصفح */}
        <div>
          <h3 className="text-lg font-semibold mb-3">دعم المتصفح</h3>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between">
              <span>Service Worker</span>
              <Badge className={getStatusColor(browserSupport.serviceWorker)}>
                {getStatusIcon(browserSupport.serviceWorker)}
                <span className="mr-1">{browserSupport.serviceWorker ? 'مدعوم' : 'غير مدعوم'}</span>
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Push Manager</span>
              <Badge className={getStatusColor(browserSupport.pushManager)}>
                {getStatusIcon(browserSupport.pushManager)}
                <span className="mr-1">{browserSupport.pushManager ? 'مدعوم' : 'غير مدعوم'}</span>
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>الإشعارات</span>
              <Badge className={getStatusColor(browserSupport.notification)}>
                {getStatusIcon(browserSupport.notification)}
                <span className="mr-1">{browserSupport.notification ? 'مدعوم' : 'غير مدعوم'}</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* حالة النظام */}
        <div>
          <h3 className="text-lg font-semibold mb-3">حالة النظام</h3>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between">
              <span>Service Worker</span>
              <Badge className={getStatusColor(serviceWorkerStatus)}>
                {getStatusIcon(serviceWorkerStatus)}
                <span className="mr-1">{serviceWorkerStatus}</span>
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>صلاحيات الإشعارات</span>
              <Badge className={getStatusColor(notificationPermission)}>
                {getStatusIcon(notificationPermission)}
                <span className="mr-1">
                  {notificationPermission === 'granted' ? 'ممنوحة' : 
                   notificationPermission === 'denied' ? 'مرفوضة' : 
                   notificationPermission === 'default' ? 'غير محددة' : notificationPermission}
                </span>
              </Badge>
            </div>
          </div>
        </div>

        {/* أزرار الاختبار */}
        <div>
          <h3 className="text-lg font-semibold mb-3">أدوات الاختبار</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={testNotification} variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              اختبار إشعار عادي
            </Button>
            <Button onClick={testServiceWorkerNotification} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              اختبار Service Worker
            </Button>
            <Button onClick={registerServiceWorker} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              تسجيل Service Worker
            </Button>
            <Button onClick={simulatePartsRequest} variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              محاكاة طلب قطعة
            </Button>
          </div>
        </div>

        {/* نصائح الإصلاح */}
        {(serviceWorkerStatus === 'غير مسجل' || notificationPermission === 'denied') && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-yellow-800">نصائح للإصلاح:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              {serviceWorkerStatus === 'غير مسجل' && (
                <li>• اضغط "تسجيل Service Worker" لتفعيل الإشعارات الخارجية</li>
              )}
              {notificationPermission === 'denied' && (
                <li>• اذهب إلى إعدادات المتصفح وامنح الصلاحية للإشعارات</li>
              )}
              {notificationPermission === 'default' && (
                <li>• اضغط "اختبار إشعار عادي" لطلب الصلاحية</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}