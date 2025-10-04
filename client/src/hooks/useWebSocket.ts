import { useEffect, useRef, useState, useCallback } from 'react';
import { queryClient } from '@/lib/queryClient';

interface WebSocketMessage {
  type: string;
  data: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Clear any existing reconnect timeout
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      
      // Retry connection after 5 seconds
      reconnectTimeout.current = setTimeout(() => {
        connect();
      }, 5000);
    }
  }, []);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'initial_data':
        // Update queries with initial data
        queryClient.setQueryData(['/api/workers'], message.data.workers);
        queryClient.setQueryData(['/api/tasks/active'], message.data.activeTasks);
        queryClient.setQueryData(['/api/stats'], message.data.stats);
        break;
        
      case 'worker_created':
      case 'task_created':
      case 'task_updated':
      case 'task_paused':
      case 'task_resumed':
      case 'task_finished':
      case 'task_archived':
        // Invalidate related queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/workers'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tasks/active'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tasks/history'] });
        queryClient.invalidateQueries({ queryKey: ['/api/archive'] });
        break;
        
      case 'parts_request_created':
        // Invalidate parts requests query to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/parts-requests'] });
        
        // إرسال إشعار فوري للمستخدم هبة
        const user = queryClient.getQueryData(['/api/user']) as any;
        console.log('🔔 تم استلام طلب قطعة جديد - المستخدم الحالي:', user?.username);
        console.log('🔔 بيانات الطلب:', message.data);
        
        if (user?.username === 'هبة') {
          console.log('🔔 هبة - محاولة تشغيل الصوت والإشعار...');
          
          // تشغيل صوت التنبيه مع عدة محاولات
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgdCj2Y1/L7dDEGI3rI8tyKOQkbYb7u6JlMFAzE9LiE9UwTCkqSl+1uf3wkBiF8xfHhkjIJHGO+7+qXTBQNxfK4hvROFApLkZfgb2wlByV+yPHhkjIJHGO97+qXSxQNxfO4gvRQFApKkZbfcG0lByV/yPLgkjUKG2K+7umYTBMNRqTgwHkeF36k5+SxWgUKN4LU09KNTAoVX7vt3JdKEw2LhYiQXGAjBiM/ysHUkzAJG2K97+iXSxQNxfO4hvRQFApKkZbfcG0lByV/yPLgkjUKG2K+7umYTBMNR6Pgv3gfF36k5+SxWgUKN4LU09KNTAoVX7vt3JdKEw2LhYiQXGAjBiM/ysHUkzAJG2K97+iXSxQNxfO4hvROFApLkZbfcG4mBiZ/yPLhkjUKG2G+7umYTBMNRp/fv3ceFn6k5+SyWgUJNYHU09KOTAoVXrnt3JdKEw2MhYmQXGAjBSM+ysHUkzAJG2K97+iXSxQNxfO4hvROFApLkZfgcG0lByV+yPHhkjUKG2K+7umYTBMNxPK4hvRPFApLkZbfcG0lByV+yPHhkjUKG2K+7umYTBMNxPK4hvRPFApLkZbfcG0lByV+yPHhkjUKG2K+7umYTBMNxPK4hvRPFA==');
            audio.volume = 0.5;
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
              playPromise.then(() => {
                console.log('✅ تم تشغيل الصوت بنجاح');
              }).catch(error => {
                console.log('❌ فشل في تشغيل الصوت:', error);
                // محاولة تشغيل صوت بديل
                const beep = new AudioContext();
                const oscillator = beep.createOscillator();
                const gainNode = beep.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(beep.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.3, beep.currentTime);
                
                oscillator.start(beep.currentTime);
                oscillator.stop(beep.currentTime + 0.5);
              });
            }
          } catch (audioError) {
            console.log('❌ خطأ في تشغيل الصوت:', audioError);
          }
          
          // إرسال Browser Push Notification (يعمل حتى لو التطبيق مصغر)
          if ('Notification' in window) {
            console.log('🔔 حالة إذن الإشعارات:', Notification.permission);
            
            if (Notification.permission === 'granted') {
              try {
                const notification = new Notification('🔧 طلب قطعة جديد!', {
                  body: `${message.data.partName} - ${message.data.engineerName || message.data.engineer}\nالسيارة: ${message.data.licensePlate}`,
                  icon: '/favicon.ico',
                  tag: 'parts-request',
                  requireInteraction: true,
                  silent: false
                });
                
                notification.onclick = function() {
                  window.focus();
                  this.close();
                };
                
                console.log('✅ تم إرسال الإشعار بنجاح');
              } catch (notifError) {
                console.log('❌ خطأ في إرسال الإشعار:', notifError);
              }
            } else if (Notification.permission === 'default') {
              // طلب الإذن مرة أخرى
              Notification.requestPermission().then(permission => {
                console.log('🔔 تم طلب إذن الإشعارات:', permission);
                if (permission === 'granted') {
                  const notification = new Notification('🔧 طلب قطعة جديد!', {
                    body: `${message.data.partName} - ${message.data.engineerName || message.data.engineer}\nالسيارة: ${message.data.licensePlate}`,
                    icon: '/favicon.ico',
                    requireInteraction: true,
                    silent: false
                  });
                }
              });
            } else {
              console.log('❌ الإشعارات مرفوضة من قبل المستخدم');
            }
          } else {
            console.log('❌ المتصفح لا يدعم الإشعارات');
          }
          
          // إرسال الإشعار عبر custom event مع تفاصيل كاملة
          window.dispatchEvent(new CustomEvent('newPartsRequest', { 
            detail: {
              id: message.data.id,
              engineer: message.data.engineerName || message.data.engineer,
              engineerName: message.data.engineerName || message.data.engineer,
              partName: message.data.partName,
              requestNumber: message.data.requestNumber,
              carInfo: message.data.carInfo || `${message.data.carBrand || ''} ${message.data.carModel || ''}`.trim(),
              licensePlate: message.data.licensePlate
            }
          }));
          
          console.log('🔔 ✅ تم إرسال إشعار صوتي ومرئي لهبة عن طلب قطعة جديد');
        } else {
          console.log('🔔 ❌ المستخدم الحالي ليس هبة، لا يتم إرسال إشعار');
        }
        break;
        
      case 'parts_request_updated':
        // Invalidate parts requests query to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/parts-requests'] });
        break;
        
      case 'reception_entry_created':
        // إشعار بدوي عند استقبال سيارة جديدة
        const currentUser = queryClient.getQueryData(['/api/user']) as any;
        console.log('🚗 تم استلام إشعار سيارة جديدة - المستخدم الحالي:', currentUser?.username);
        
        if (currentUser?.username === 'بدوي') {
          // تشغيل صوت التنبيه
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Could not play notification sound:', e));
          
          // إرسال Browser Push Notification للسيارات الجديدة
          if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('🚗 سيارة جديدة في الاستقبال!', {
              body: `${message.data.entry?.carOwnerName} - ${message.data.entry?.licensePlate}`,
              icon: '/favicon.ico',
              tag: 'car-reception',
              requireInteraction: true,
              silent: false
            });
            
            notification.onclick = function() {
              window.focus();
              this.close();
            };
          }
          
          // إرسال إشعار مرئي
          window.dispatchEvent(new CustomEvent('newCarReception', {
            detail: {
              licensePlate: message.data.entry?.licensePlate,
              carOwnerName: message.data.entry?.carOwnerName,
              message: message.data.message || `سيارة جديدة في الاستقبال`
            }
          }));
          
          console.log('🔔 ✅ تم إرسال إشعار صوتي ومرئي لبدوي عن سيارة جديدة');
        }
        
        // تحديث بيانات الاستقبال
        queryClient.invalidateQueries({ queryKey: ['/api/reception-entries'] });
        queryClient.invalidateQueries({ queryKey: ['/api/workshop-notifications'] });
        break;
        
      case 'CAR_RECEIPT_CREATED':
      case 'CAR_POSTPONED':
      case 'CAR_ENTERED_WORKSHOP':
        // Invalidate car receipts query to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/car-receipts'] });
        break;
        
      case 'timer_tick':
        // Update timer displays - handled by components
        break;
        
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    isConnected,
    sendMessage,
  };
}
