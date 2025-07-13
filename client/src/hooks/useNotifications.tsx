import { useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth';

export function useNotifications() {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastRequestCountRef = useRef(0);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const alertIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentAlert, setCurrentAlert] = useState<{title: string, body: string} | null>(null);

  // إنشاء الصوت التلقائي للإشعار
  useEffect(() => {
    // إنشاء نغمة قوية ولافتة للانتباه باستخدام Web Audio API
    const createNotificationSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // إنشاء نغمة متكررة مع ترددات عالية
      const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'square'; // نوع موجة مربعة لصوت أقوى
        
        gainNode.gain.setValueAtTime(0.6, startTime); // صوت أعلى
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      // تشغيل سلسلة من النغمات المتتالية
      const now = audioContext.currentTime;
      playTone(1000, now, 0.15);        // نغمة عالية
      playTone(800, now + 0.2, 0.15);   // نغمة متوسطة
      playTone(1200, now + 0.4, 0.15);  // نغمة أعلى
      playTone(900, now + 0.6, 0.15);   // نغمة متوسطة
      playTone(1400, now + 0.8, 0.2);   // نغمة نهائية قوية
    };

    // تشغيل الصوت
    const playNotificationSound = () => {
      try {
        createNotificationSound();
      } catch (error) {
        console.warn('Unable to play notification sound:', error);
      }
    };

    // تعيين الصوت
    audioRef.current = { play: playNotificationSound } as any;
  }, []);

  // طلب إذن الإشعارات
  useEffect(() => {
    if ('Notification' in window && user?.username === 'هبة') {
      if (Notification.permission === 'granted') {
        setHasPermission(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setHasPermission(permission === 'granted');
        });
      }
    }
  }, [user]);

  // دالة تشغيل الصوت والاهتزاز
  const playAlertSound = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  };

  // دالة بدء التنبيه المتكرر
  const startRepeatingAlert = (title: string, body: string) => {
    if (user?.username !== 'هبة') return;
    
    setCurrentAlert({ title, body });
    setIsAlertActive(true);
    
    // تشغيل التنبيه فوراً
    playAlertSound();
    
    // إرسال إشعار المتصفح
    if (hasPermission) {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'parts-request',
        requireInteraction: true,
      });
    }
    
    // بدء التكرار كل 30 ثانية
    alertIntervalRef.current = setInterval(() => {
      playAlertSound();
      if (hasPermission) {
        new Notification(title, {
          body: body + ' (تذكير)',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'parts-request-reminder',
          requireInteraction: true,
        });
      }
    }, 30000); // 30 ثانية
  };

  // دالة إيقاف التنبيه المتكرر
  const stopRepeatingAlert = () => {
    if (alertIntervalRef.current) {
      clearInterval(alertIntervalRef.current);
      alertIntervalRef.current = null;
    }
    setIsAlertActive(false);
    setCurrentAlert(null);
  };

  // دالة إرسال الإشعار العادي
  const sendNotification = (title: string, body: string, options?: NotificationOptions) => {
    // إذا كان هناك تنبيه نشط، لا نرسل إشعار جديد
    if (isAlertActive) return;
    
    // تشغيل الصوت أولاً
    playAlertSound();

    // إرسال إشعار المتصفح
    if (hasPermission && user?.username === 'هبة') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'parts-request',
        requireInteraction: true,
        ...options
      });
    }
  };

  // مراقبة الطلبات الجديدة
  const checkForNewRequests = (currentRequests: any[]) => {
    if (user?.username === 'هبة' && currentRequests && currentRequests.length > 0) {
      const currentCount = currentRequests.length;
      const lastCount = lastRequestCountRef.current;
      
      if (currentCount > lastCount && lastCount > 0) {
        const newRequests = currentRequests.slice(0, currentCount - lastCount);
        
        newRequests.forEach(request => {
          sendNotification(
            '📦 طلب قطعة جديد',
            `طلب جديد من ${request.engineer}: ${request.partName}`,
            {
              data: { requestId: request.id, type: 'parts-request' }
            }
          );
        });
      }
      
      lastRequestCountRef.current = currentCount;
    }
  };

  // مراقبة الأحداث المخصصة للطلبات الجديدة
  useEffect(() => {
    const handleNewPartsRequest = (event: CustomEvent) => {
      if (user?.username === 'هبة') {
        const request = event.detail;
        startRepeatingAlert(
          '📦 طلب قطعة جديد',
          `طلب جديد من ${request.engineer}: ${request.partName}`
        );
        setNewRequestsCount(prev => prev + 1);
      }
    };

    window.addEventListener('newPartsRequest', handleNewPartsRequest as EventListener);
    
    return () => {
      window.removeEventListener('newPartsRequest', handleNewPartsRequest as EventListener);
    };
  }, [user, startRepeatingAlert]);

  // تنظيف التنبيهات عند تغيير المستخدم
  useEffect(() => {
    return () => {
      stopRepeatingAlert();
    };
  }, [user]);

  return {
    sendNotification,
    checkForNewRequests,
    hasPermission,
    newRequestsCount,
    startRepeatingAlert,
    stopRepeatingAlert,
    isAlertActive,
    currentAlert
  };
}