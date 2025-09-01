import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, Check, X } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

interface ImportedCustomer {
  name: string;
  phone?: string;
  carBrand?: string;
  carModel?: string;
  licensePlate?: string;
  engineCode?: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

export function ExcelImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [importedData, setImportedData] = useState<ImportedCustomer[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('excel', file);
      
      const response = await fetch('/api/import-excel', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('فشل في رفع الملف');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setImportedData(data.customers || []);
      toast({
        title: 'تم تحليل الملف بنجاح ✅',
        description: `تم العثور على ${data.customers?.length || 0} زبون`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في رفع الملف ❌',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (customers: ImportedCustomer[]) => {
      const response = await apiRequest('POST', '/api/import-customers', {
        customers,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'تم استيراد البيانات بنجاح ✅',
        description: `تم إضافة ${data.successCount} زبون بنجاح`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      setImportedData([]);
      setFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في استيراد البيانات ❌',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.includes('sheet') || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setImportedData([]);
      } else {
        toast({
          title: 'نوع ملف غير صحيح ❌',
          description: 'يرجى اختيار ملف Excel (.xlsx أو .xls)',
          variant: 'destructive',
        });
      }
    }
  };

  const handleUpload = () => {
    if (!file) return;
    uploadMutation.mutate(file);
  };

  const handleImport = () => {
    if (importedData.length === 0) return;
    setIsImporting(true);
    importMutation.mutate(importedData);
    setIsImporting(false);
  };

  return (
    <div className="space-y-6">
      {/* رفع الملف */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="ml-2 h-5 w-5" />
            استيراد بيانات الزبائن من Excel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="excel-file">اختر ملف Excel</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-600">
              يجب أن يحتوي الملف على الأعمدة التالية: اسم الزبون، رقم الهاتف، نوع السيارة، موديل السيارة، رقم اللوحة، رمز المحرك
            </p>
          </div>
          
          {file && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <FileSpreadsheet className="h-4 w-4 ml-2 text-blue-600" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                size="sm"
              >
                {uploadMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <Upload className="ml-2 h-4 w-4" />
                    تحليل الملف
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* معاينة البيانات المستوردة */}
      {importedData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>معاينة البيانات المستوردة</CardTitle>
              <Button
                onClick={handleImport}
                disabled={isImporting || importMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {isImporting || importMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    جاري الاستيراد...
                  </>
                ) : (
                  <>
                    <Check className="ml-2 h-4 w-4" />
                    استيراد البيانات ({importedData.length})
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-right">الحالة</th>
                    <th className="border border-gray-300 p-2 text-right">اسم الزبون</th>
                    <th className="border border-gray-300 p-2 text-right">رقم الهاتف</th>
                    <th className="border border-gray-300 p-2 text-right">نوع السيارة</th>
                    <th className="border border-gray-300 p-2 text-right">الموديل</th>
                    <th className="border border-gray-300 p-2 text-right">رقم اللوحة</th>
                    <th className="border border-gray-300 p-2 text-right">رمز المحرك</th>
                  </tr>
                </thead>
                <tbody>
                  {importedData.map((customer, index) => (
                    <tr key={index} className={customer.status === 'error' ? 'bg-red-50' : ''}>
                      <td className="border border-gray-300 p-2">
                        {customer.status === 'pending' && (
                          <div className="flex items-center text-yellow-600">
                            <div className="h-2 w-2 rounded-full bg-yellow-500 ml-2"></div>
                            في الانتظار
                          </div>
                        )}
                        {customer.status === 'success' && (
                          <div className="flex items-center text-green-600">
                            <Check className="h-4 w-4 ml-2" />
                            نجح
                          </div>
                        )}
                        {customer.status === 'error' && (
                          <div className="flex items-center text-red-600">
                            <X className="h-4 w-4 ml-2" />
                            خطأ
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 p-2">{customer.name || '-'}</td>
                      <td className="border border-gray-300 p-2">{customer.phone || '-'}</td>
                      <td className="border border-gray-300 p-2">{customer.carBrand || '-'}</td>
                      <td className="border border-gray-300 p-2">{customer.carModel || '-'}</td>
                      <td className="border border-gray-300 p-2">{customer.licensePlate || '-'}</td>
                      <td className="border border-gray-300 p-2">{customer.engineCode || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}