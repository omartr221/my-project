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
        if (user?.username === 'هبة') {
          // إرسال الإشعار عبر custom event مع تفاصيل كاملة
          window.dispatchEvent(new CustomEvent('newPartsRequest', { 
            detail: message.data 
          }));
          
          console.log('🔔 إشعار جديد لهبة:', message.data);
        }
        break;
        
      case 'parts_request_updated':
        // Invalidate parts requests query to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/parts-requests'] });
        break;
        
      case 'customer_created':
      case 'customer_updated':
      case 'customer_deleted':
        // Invalidate customer queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
        break;
        
      case 'customer_car_created':
      case 'customer_car_updated':
      case 'customer_car_deleted':
        // Invalidate customer cars queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/customer-cars'] });
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
