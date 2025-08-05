// استيراد المكتبات الأساسية

// إنشاء محتوى HTML مباشر
const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); max-width: 400px; text-align: center;">
        <h1 style="color: #333; margin-bottom: 20px; font-size: 28px; font-weight: bold;">🚗 V POWER TUNING</h1>
        <p style="font-size: 18px; margin-bottom: 25px; color: #666;">نظام إدارة المهام والعمال</p>
        <button 
          onclick="loadFullApp()" 
          style="padding: 15px 30px; background: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; width: 100%; transition: all 0.3s ease;"
          onmouseover="this.style.background='#0056b3'"
          onmouseout="this.style.background='#007bff'"
        >
          دخول النظام
        </button>
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
          <p style="margin: 5px 0; color: #495057;"><strong>المستخدم:</strong> الاستقبال</p>
          <p style="margin: 5px 0; color: #495057;"><strong>كلمة المرور:</strong> 11</p>
        </div>
        <p style="margin-top: 15px; font-size: 14px; color: #6c757d;">
          اضغط "دخول النظام" لتحميل التطبيق الكامل
        </p>
      </div>
    </div>
  `;
}

// دالة تحميل التطبيق الكامل
(window as any).loadFullApp = function() {
  // عرض شاشة تحميل
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f8f9fa;">
        <div style="text-align: center;">
          <div style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
          <p style="color: #666; font-size: 18px;">جاري تحميل التطبيق...</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
  }
  
  // تحويل للصفحة الرئيسية بعد ثانيتين
  setTimeout(() => {
    window.location.href = '/auth';
  }, 2000);
};
