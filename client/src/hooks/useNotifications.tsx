import { useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth';
import { useQuery } from '@tanstack/react-query';

export function useNotifications() {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastRequestCountRef = useRef(0);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const alertIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentAlert, setCurrentAlert] = useState<{title: string, body: string} | null>(null);
  const [newPartsRequestsCount, setNewPartsRequestsCount] = useState(0);
  const [lastViewedPartsRequests, setLastViewedPartsRequests] = useState<number>(0);

  // إنشاء الصوت التلقائي للإشعار
  useEffect(() => {
    let audioContext: AudioContext | null = null;
    
    // إنشاء نغمة قوية ولافتة للانتباه باستخدام Web Audio API
    const createNotificationSound = async () => {
      try {
        // إنشاء AudioContext إذا لم يكن موجود
        if (!audioContext) {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        // استئناف AudioContext إذا كان معلق
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        // إنشاء نغمة متكررة مع ترددات عالية
        const playTone = (frequency: number, startTime: number, duration: number) => {
          const oscillator = audioContext!.createOscillator();
          const gainNode = audioContext!.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext!.destination);
          
          oscillator.frequency.setValueAtTime(frequency, startTime);
          oscillator.type = 'square'; // نوع موجة مربعة لصوت أقوى
          
          gainNode.gain.setValueAtTime(0.8, startTime); // صوت أعلى
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
          
          oscillator.start(startTime);
          oscillator.stop(startTime + duration);
        };
        
        // تشغيل سلسلة من النغمات المتتالية
        const now = audioContext.currentTime;
        playTone(1000, now, 0.2);        // نغمة عالية
        playTone(800, now + 0.25, 0.2);   // نغمة متوسطة
        playTone(1200, now + 0.5, 0.2);  // نغمة أعلى
        playTone(900, now + 0.75, 0.2);   // نغمة متوسطة
        playTone(1400, now + 1.0, 0.3);   // نغمة نهائية قوية
      } catch (error) {
        console.warn('Unable to create notification sound:', error);
      }
    };

    // تشغيل الصوت
    const playNotificationSound = async () => {
      try {
        await createNotificationSound();
      } catch (error) {
        console.warn('Unable to play notification sound:', error);
      }
    };

    // تعيين الصوت
    audioRef.current = { play: playNotificationSound } as any;
    
    // تنظيف عند إلغاء التحميل
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  // Register Service Worker and request notifications permission
  useEffect(() => {
    const setupNotifications = async () => {
      // Only run for هبة user
      if (user?.username !== 'هبة') return;
      
      try {
        console.log('🔧 بدء إعداد نظام الإشعارات لهبة...');
        
        // Request notification permission first
        if ('Notification' in window) {
          console.log('🔔 فحص صلاحيات الإشعارات...');
          if (Notification.permission === 'granted') {
            setHasPermission(true);
            console.log('✅ الصلاحيات ممنوحة بالفعل');
          } else if (Notification.permission !== 'denied') {
            console.log('📝 طلب صلاحيات الإشعارات...');
            const permission = await Notification.requestPermission();
            setHasPermission(permission === 'granted');
            console.log('📝 نتيجة طلب الصلاحية:', permission);
            
            if (permission === 'granted') {
              // تنبيه تأكيد الإعداد
              new Notification('✅ تم تفعيل الإشعارات', {
                body: 'سيصلك الآن تنبيه عند وصول طلبات القطع حتى لو كنت خارج النظام',
                icon: '/vite.svg',
                tag: 'setup-confirmation'
              });
            }
          }
        }

        // Register Service Worker after permissions
        if ('serviceWorker' in navigator) {
          console.log('🔧 تسجيل Service Worker...');
          
          try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
              scope: '/',
              updateViaCache: 'none' // Always check for updates
            });
            
            console.log('✅ تم تسجيل Service Worker جديد:', registration.scope);
            
            // Handle updates
            registration.addEventListener('updatefound', () => {
              console.log('🔄 Service Worker update found');
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('🔄 New Service Worker installed, activating...');
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                  }
                });
              }
            });
            
            // Wait for the service worker to be ready
            await navigator.serviceWorker.ready;
            console.log('✅ Service Worker جاهز للعمل');
            
            // Test notification right away to confirm working
            if (hasPermission) {
              setTimeout(() => {
                registration.showNotification('🔔 النظام جاهز', {
                  body: 'تم تفعيل التنبيهات الخارجية بنجاح',
                  icon: '/vite.svg',
                  tag: 'setup-test',
                  requireInteraction: false,
                  silent: true
                } as any);
              }, 1000);
            }
          } catch (error) {
            console.error('❌ خطأ في تسجيل Service Worker:', error);
          }
        }
      } catch (error) {
        console.error('❌ خطأ في إعداد الإشعارات:', error);
      }
    };

    setupNotifications();
  }, [user]);

  // دالة تشغيل الصوت والاهتزاز
  const playAlertSound = async () => {
    console.log('🔊 محاولة تشغيل الصوت...');
    
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        console.log('✅ تم تشغيل الصوت بنجاح');
      } catch (error) {
        console.error('❌ خطأ في تشغيل الصوت:', error);
      }
    } else {
      console.warn('⚠️ لا يوجد مرجع للصوت');
    }
    
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100, 300, 100, 300]);
      console.log('📳 تم تشغيل الاهتزاز');
    } else {
      console.log('📳 الاهتزاز غير مدعوم');
    }
  };

  // دالة بدء التنبيه - مرة واحدة فقط
  const startRepeatingAlert = async (title: string, body: string) => {
    if (user?.username !== 'هبة') return;
    
    setCurrentAlert({ title, body });
    setIsAlertActive(true);
    
    // تشغيل التنبيه مرة واحدة فقط
    await playAlertSound();
    
    // إرسال إشعار المتصفح مرة واحدة فقط
    if (hasPermission) {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'parts-request',
        requireInteraction: true,
      });
    }
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

  // دالة إرسال الإشعار العادي مع Service Worker
  const sendNotification = async (title: string, body: string, options?: NotificationOptions) => {
    // إذا كان هناك تنبيه نشط، لا نرسل إشعار جديد
    if (isAlertActive) return;
    
    console.log('🔔 محاولة إرسال إشعار:', title);
    
    // تشغيل الصوت أولاً
    await playAlertSound();

    // إرسال إشعار المتصفح
    if (user?.username === 'هبة') {
      console.log('🔔 المستخدم هبة - إرسال إشعار...');
      
      try {
        // First, try using Service Worker for persistent notifications
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration('/');
          
          if (registration && registration.active) {
            console.log('🔔 استخدام Service Worker للإشعار');
            
            // Use registration.showNotification for better persistence
            await registration.showNotification(title, {
              body,
              icon: '/vite.svg',
              badge: '/vite.svg',
              tag: 'parts-request-' + Date.now(), // Unique tag to avoid replacing
              requireInteraction: true,
              silent: false,
              data: options?.data || {},
              actions: [
                {
                  action: 'open',
                  title: 'فتح النظام'
                },
                {
                  action: 'dismiss',
                  title: 'إغلاق'
                }
              ]
            } as any);
            
            console.log('✅ تم إرسال الإشعار عبر Service Worker');
            return;
          }
        }
        
        // Fallback to regular notification
        if (hasPermission) {
          console.log('🔔 استخدام الإشعار العادي كبديل');
          new Notification(title, {
            body,
            icon: '/vite.svg',
            badge: '/vite.svg',
            tag: 'parts-request-' + Date.now(),
            requireInteraction: true,
            silent: false,
            ...options
          } as any);
          console.log('✅ تم إرسال الإشعار العادي');
        } else {
          console.warn('⚠️ لا توجد صلاحيات للإشعارات');
        }
      } catch (error) {
        console.error('❌ خطأ في إرسال الإشعار:', error);
        
        // Final fallback
        if (hasPermission) {
          new Notification(title, {
            body,
            icon: '/vite.svg',
            tag: 'parts-request-fallback',
            ...options
          });
        }
      }
    } else {
      console.log('🔔 المستخدم ليس هبة - لا إشعار');
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
      console.log('🔔 تم استلام حدث newPartsRequest:', event.detail);
      console.log('🔔 المستخدم الحالي:', user?.username);
      
      if (user?.username === 'هبة') {
        const request = event.detail;
        console.log('🔔 ✅ إرسال إشعار صوتي لهبة');
        
        // تشغيل التنبيه مرة واحدة فقط عند استلام طلب جديد
        startRepeatingAlert(
          '📦 طلب قطعة جديد',
          `طلب جديد من ${request.engineer || request.engineerName}: ${request.partName}`
        );
        setNewRequestsCount(prev => prev + 1);
      } else {
        console.log('🔔 ❌ المستخدم ليس هبة، لا إشعار');
      }
    };
    
    const handlePartsRequestDelivered = (event: CustomEvent) => {
      if (user?.username === 'هبة') {
        const request = event.detail;
        // تشغيل التنبيه مرة واحدة فقط عند تسليم الطلب
        startRepeatingAlert(
          '✅ تم استلام القطعة',
          `تم استلام: ${request.partName} - ${request.requestNumber}`
        );
        setNewRequestsCount(prev => prev + 1);
      }
    };

    window.addEventListener('newPartsRequest', handleNewPartsRequest as EventListener);
    window.addEventListener('partsRequestDelivered', handlePartsRequestDelivered as EventListener);
    
    return () => {
      window.removeEventListener('newPartsRequest', handleNewPartsRequest as EventListener);
      window.removeEventListener('partsRequestDelivered', handlePartsRequestDelivered as EventListener);
    };
  }, [user, startRepeatingAlert]);

  // تنظيف التنبيهات عند تغيير المستخدم
  useEffect(() => {
    return () => {
      stopRepeatingAlert();
    };
  }, [user]);

  // استرجاع طلبات القطع
  const { data: partsRequests = [] } = useQuery({
    queryKey: ["/api/parts-requests"],
    enabled: user?.username === 'هبة', // فقط لهبة
    refetchInterval: 5000, // تحديث كل 5 ثوان
  });

  // مراقبة طلبات القطع الجديدة
  useEffect(() => {
    if (user?.username === 'هبة' && Array.isArray(partsRequests) && partsRequests.length > 0) {
      // حساب الطلبات الجديدة منذ آخر مشاهدة
      const newRequests = partsRequests.filter((request: any) => 
        new Date(request.requestedAt).getTime() > lastViewedPartsRequests
      );
      
      setNewPartsRequestsCount(newRequests.length);
    }
  }, [partsRequests, lastViewedPartsRequests, user]);

  // دالة تحديد وقت آخر مشاهدة للطلبات
  const markPartsRequestsAsViewed = () => {
    if (user?.username === 'هبة') {
      setLastViewedPartsRequests(Date.now());
      setNewPartsRequestsCount(0);
    }
  };

  return {
    sendNotification,
    checkForNewRequests,
    hasPermission,
    newRequestsCount,
    newPartsRequestsCount,
    markPartsRequestsAsViewed,
    startRepeatingAlert,
    stopRepeatingAlert,
    isAlertActive,
    currentAlert
  };
}