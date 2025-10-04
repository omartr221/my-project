import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function BackupManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // التحقق من صلاحيات المدير
  if (!user?.permissions?.includes('admin')) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            <p>يحتاج هذا القسم إلى صلاحيات المدير</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      const response = await apiRequest('POST', '/api/backup/create');
      const result = await response.json();
      
      toast({
        title: "تم إنشاء النسخة الاحتياطية",
        description: result.message,
      });
    } catch (error) {
      toast({
        title: "خطأ في النسخ الاحتياطي",
        description: "فشل في إنشاء النسخة الاحتياطية",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    try {
      const fileContent = await file.text();
      const backupData = JSON.parse(fileContent);
      
      const response = await apiRequest('POST', '/api/backup/restore', backupData);
      const result = await response.json();
      
      toast({
        title: "تم استعادة البيانات",
        description: result.message,
      });
      
      // إعادة تحميل الصفحة لإظهار البيانات المستعادة
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      toast({
        title: "خطأ في الاستعادة",
        description: "فشل في استعادة البيانات - تحقق من صحة الملف",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50" dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Save className="h-5 w-5" />
          إدارة النسخ الاحتياطية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-2">النسخ الاحتياطي التلقائي</h3>
          <p className="text-sm text-gray-600 mb-3">
            يتم إنشاء نسخة احتياطية تلقائياً كل ساعة لحماية بياناتك
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleCreateBackup}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 ml-2" />
              {isCreating ? 'جاري الإنشاء...' : 'إنشاء نسخة احتياطية الآن'}
            </Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-gray-800 mb-2">استعادة البيانات</h3>
          <p className="text-sm text-gray-600 mb-3">
            استعادة البيانات من ملف نسخة احتياطية سابقة
          </p>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              disabled={isRestoring}
              className="hidden"
              id="backup-upload"
            />
            <Button
              asChild
              disabled={isRestoring}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <label htmlFor="backup-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 ml-2" />
                {isRestoring ? 'جاري الاستعادة...' : 'اختيار ملف للاستعادة'}
              </label>
            </Button>
          </div>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">تحذير:</p>
              <p>استعادة البيانات ستحل محل جميع البيانات الحالية. تأكد من إنشاء نسخة احتياطية قبل الاستعادة.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}