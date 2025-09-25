import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Database, FileText, Table } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DatabaseStats {
  workers: number;
  tasks: number;
  customers: number;
  customerCars: number;
  partsRequests: number;
  users: number;
  receptionEntries: number;
  maintenanceGuides: number;
  lastBackup: string;
}

const tableOptions = [
  { value: 'workers', label: 'العمال', icon: '👷' },
  { value: 'tasks', label: 'المهام', icon: '📝' },
  { value: 'customers', label: 'العملاء', icon: '👤' },
  { value: 'customer-cars', label: 'سيارات العملاء', icon: '🚗' },
  { value: 'parts-requests', label: 'طلبات القطع', icon: '🔧' },
  { value: 'reception-entries', label: 'قيود الاستقبال', icon: '📋' },
  { value: 'maintenance-guides', label: 'أدلة الصيانة', icon: '📖' }
];

const formatOptions = [
  { value: 'json', label: 'JSON', description: 'ملف بيانات منظم' },
  { value: 'csv', label: 'CSV', description: 'جدول بيانات' },
  { value: 'excel', label: 'Excel', description: 'ملف إكسل' }
];

export default function BackupPage() {
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('json');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<DatabaseStats>({
    queryKey: ['/api/database/stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const createFullBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('فشل في إنشاء النسخة الاحتياطية');
      }

      // Create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `v-power-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "تم إنشاء النسخة الاحتياطية",
        description: "تم تحميل النسخة الاحتياطية الكاملة بنجاح",
      });
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: "خطأ في النسخة الاحتياطية",
        description: "فشل في إنشاء النسخة الاحتياطية",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const exportTableData = async () => {
    if (!selectedTable) {
      toast({
        title: "يرجى اختيار جدول",
        description: "يجب اختيار جدول لتصدير البيانات",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch(`/api/export/${selectedTable}?format=${selectedFormat}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في تصدير البيانات');
      }

      // Create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const selectedTableLabel = tableOptions.find(t => t.value === selectedTable)?.label || selectedTable;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const extension = selectedFormat === 'excel' ? 'xlsx' : selectedFormat;
      a.download = `${selectedTableLabel}-${timestamp}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "تم تصدير البيانات",
        description: `تم تصدير بيانات ${selectedTableLabel} بنجاح`,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "خطأ في التصدير",
        description: error.message || "فشل في تصدير البيانات",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="backup-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            النسخ الاحتياطي وتصدير البيانات
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة النسخ الاحتياطية وتصدير بيانات النظام
          </p>
        </div>
        <Database className="h-8 w-8 text-blue-600" />
      </div>

      {/* Database Statistics */}
      <Card data-testid="database-stats">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            إحصائيات قاعدة البيانات
          </CardTitle>
          <CardDescription>
            عدد السجلات في كل جدول من جداول النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="text-center py-4">جاري التحميل...</div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="stats-workers">
                  {stats.workers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">عامل</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="stats-tasks">
                  {stats.tasks}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">مهمة</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="stats-customers">
                  {stats.customers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">عميل</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="stats-cars">
                  {stats.customerCars}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">سيارة</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="stats-parts">
                  {stats.partsRequests}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">طلب قطع</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400" data-testid="stats-reception">
                  {stats.receptionEntries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">قيد استقبال</div>
              </div>
              <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400" data-testid="stats-guides">
                  {stats.maintenanceGuides}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">دليل صيانة</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  آخر تحديث: {new Date(stats.lastBackup).toLocaleString('ar-SA')}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-500">فشل في تحميل الإحصائيات</div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Full Backup */}
        <Card data-testid="full-backup-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              نسخة احتياطية كاملة
            </CardTitle>
            <CardDescription>
              إنشاء نسخة احتياطية شاملة من جميع بيانات النظام
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>تشمل النسخة الاحتياطية:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>جميع بيانات العمال والمهام</li>
                <li>بيانات العملاء والسيارات</li>
                <li>طلبات القطع وقيود الاستقبال</li>
                <li>أدلة الصيانة</li>
              </ul>
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                ملاحظة: بيانات المستخدمين مستبعدة لأسباب أمنية
              </p>
            </div>
            <Button 
              onClick={createFullBackup}
              disabled={isCreatingBackup}
              className="w-full"
              data-testid="button-create-backup"
            >
              {isCreatingBackup ? 'جاري الإنشاء...' : 'إنشاء نسخة احتياطية'}
            </Button>
          </CardContent>
        </Card>

        {/* Table Export */}
        <Card data-testid="table-export-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              تصدير بيانات جدول محدد
            </CardTitle>
            <CardDescription>
              تصدير بيانات جدول واحد بصيغة مختارة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">اختر الجدول:</label>
              <Select value={selectedTable} onValueChange={setSelectedTable} data-testid="select-table">
                <SelectTrigger>
                  <SelectValue placeholder="اختر جدول..." />
                </SelectTrigger>
                <SelectContent>
                  {tableOptions.map((table) => (
                    <SelectItem key={table.value} value={table.value}>
                      <span className="flex items-center gap-2">
                        <span>{table.icon}</span>
                        {table.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">صيغة التصدير:</label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat} data-testid="select-format">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-xs text-gray-500">{format.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={exportTableData}
              disabled={isExporting || !selectedTable}
              className="w-full"
              data-testid="button-export-table"
            >
              {isExporting ? 'جاري التصدير...' : 'تصدير البيانات'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card data-testid="instructions-card">
        <CardHeader>
          <CardTitle>تعليمات الاستخدام</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">النسخة الاحتياطية الكاملة:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>تنتج ملف JSON يحتوي على جميع البيانات</li>
              <li>يمكن استخدامها لاستعادة النظام في حالة فقدان البيانات</li>
              <li>احتفظ بنسخة احتياطية دورية (يومياً أو أسبوعياً)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">تصدير الجداول:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li><Badge variant="secondary">JSON</Badge> - للمطورين والتكامل مع أنظمة أخرى</li>
              <li><Badge variant="secondary">CSV</Badge> - لفتحها في برامج الجداول مثل Excel</li>
              <li><Badge variant="secondary">Excel</Badge> - ملف Excel جاهز للاستخدام</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 نصائح مهمة:</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
              <li>قم بإنشاء نسخة احتياطية قبل أي تعديلات كبيرة</li>
              <li>احفظ النسخ الاحتياطية في مكان آمن ومنفصل</li>
              <li>تحقق من حجم الملفات قبل التحميل</li>
              <li>بيانات المستخدمين وكلمات المرور غير مشمولة في النسخ الاحتياطية</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}