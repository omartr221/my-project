// معالج أخطاء السكريبتات الخارجية
window.addEventListener('error', function(event) {
  // تجاهل أخطاء السكريبتات من replit.com
  if (event.filename && event.filename.includes('replit.com')) {
    event.preventDefault();
    console.log('تم تجاهل خطأ من سكريبت Replit الخارجي');
    return false;
  }
});

// معالج للأخطاء غير المعالجة
window.addEventListener('unhandledrejection', function(event) {
  if (event.reason && event.reason.message && event.reason.message.includes('replit')) {
    event.preventDefault();
    console.log('تم تجاهل رفض من سكريبت Replit');
    return false;
  }
});