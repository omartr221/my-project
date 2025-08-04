import React from 'react';

function SimpleApp() {
  return React.createElement('div', {
    style: { 
      padding: '20px', 
      fontFamily: 'Arial', 
      direction: 'rtl',
      background: '#f5f5f5',
      minHeight: '100vh'
    }
  }, [
    React.createElement('h1', { 
      key: 'title',
      style: { color: '#2563eb', marginBottom: '20px' }
    }, '🚀 V POWER TUNING'),
    React.createElement('p', { 
      key: 'subtitle',
      style: { fontSize: '18px', marginBottom: '15px' }
    }, 'التطبيق يعمل بنجاح!'),
    React.createElement('div', {
      key: 'content',
      style: { 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    }, 'نظام إدارة المهام والعمال جاهز للاستخدام'),
    React.createElement('div', {
      key: 'status',
      style: { 
        background: '#10b981', 
        color: 'white',
        padding: '10px', 
        borderRadius: '4px',
        marginTop: '15px'
      }
    }, '✅ السيرفر يعمل بنجاح')
  ]);
}

export default SimpleApp;