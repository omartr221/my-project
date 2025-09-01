import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import React from "react";

interface CustomerData {
  name: string;
  phone: string;
  carType: string;
  carModel: string;
  licensePlate: string;
  engineCode: string;
}

export function ExcelImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<CustomerData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const { toast } = useToast();

  // البحث عن ملفات Excel المرفقة
  React.useEffect(() => {
    const checkAttachedFiles = () => {
      // ملفات Excel المرفقة المعروفة
      const excelFiles = [
        "Desktop.xlsx ]ملف الزبائن  _1756728567495.xlsx",
        "Desktop.xlsx ]ملف الزبائن  _1756729003836.xlsx"
      ];
      setAttachedFiles(excelFiles);
    };
    
    checkAttachedFiles();
  }, []);

  const columnMappings = {
    // Arabic column names
    'اسم الزبون': 'name',
    'اسم العميل': 'name',
    'الاسم': 'name',
    'رقم الهاتف': 'phone',
    'رقم الجوال': 'phone',
    'الهاتف': 'phone',
    'نوع السيارة': 'carType',
    'نوع المركبة': 'carType',
    'العلامة التجارية': 'carType',
    'الموديل': 'carModel',
    'الطراز': 'carModel',
    'رقم اللوحة': 'licensePlate',
    'لوحة السيارة': 'licensePlate',
    'رقم المركبة': 'licensePlate',
    'رمز المحرك': 'engineCode',
    'كود المحرك': 'engineCode',
    'محرك': 'engineCode',
    // English column names
    'name': 'name',
    'customer name': 'name',
    'client name': 'name',
    'phone': 'phone',
    'phone number': 'phone',
    'mobile': 'phone',
    'car type': 'carType',
    'car brand': 'carType',
    'brand': 'carType',
    'model': 'carModel',
    'car model': 'carModel',
    'license plate': 'licensePlate',
    'plate number': 'licensePlate',
    'registration': 'licensePlate',
    'engine code': 'engineCode',
    'engine': 'engineCode',
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.includes('sheet') || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        processFile(selectedFile);
      } else {
        toast({
          title: "نوع ملف غير صحيح",
          description: "يرجى اختيار ملف Excel (.xlsx أو .xls)",
          variant: "destructive",
        });
      }
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        throw new Error("الملف يجب أن يحتوي على بيانات وعناوين أعمدة");
      }

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as any[][];

      // Map headers to our expected fields
      const mappedHeaders = headers.map(header => {
        const normalizedHeader = header?.toString().toLowerCase().trim();
        return columnMappings[normalizedHeader as keyof typeof columnMappings] || null;
      });

      const processedData: CustomerData[] = rows
        .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ""))
        .map((row, index) => {
          const customer: any = {};
          
          mappedHeaders.forEach((mappedField, colIndex) => {
            if (mappedField && row[colIndex]) {
              customer[mappedField] = row[colIndex].toString().trim();
            }
          });

          // Set defaults for missing fields
          return {
            name: customer.name || `زبون ${index + 1}`,
            phone: customer.phone || "",
            carType: customer.carType || "غير محدد",
            carModel: customer.carModel || "غير محدد",
            licensePlate: customer.licensePlate || "",
            engineCode: customer.engineCode || ""
          };
        });

      setData(processedData);
      toast({
        title: "تم تحليل الملف بنجاح",
        description: `تم العثور على ${processedData.length} سجل`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "خطأ في معالجة الملف",
        description: "حدث خطأ أثناء قراءة ملف Excel",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (data.length === 0) return;

    setIsImporting(true);
    try {
      const response = await fetch('/api/import-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customers: data }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "تم الاستيراد بنجاح",
          description: `تم استيراد ${result.imported} سجل، فشل ${result.failed} سجل`,
        });
        
        // Reset form
        setFile(null);
        setData([]);
        
        // Reset file input
        const fileInput = document.getElementById('excel-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "خطأ في الاستيراد",
        description: "حدث خطأ أثناء استيراد البيانات",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportAttached = async (filename: string) => {
    setIsImporting(true);
    try {
      const response = await fetch('/api/import-excel-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "تم الاستيراد بنجاح",
          description: result.message,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "خطأ في الاستيراد",
        description: "حدث خطأ أثناء استيراد البيانات",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Attached Files Section */}
      {attachedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileSpreadsheet className="ml-2 h-5 w-5 text-green-600" />
              ملفات Excel المرفقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attachedFiles.map((filename, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-sm">ملف الزبائن</div>
                      <div className="text-xs text-gray-500">{filename}</div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleImportAttached(filename)}
                    disabled={isImporting}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {isImporting ? "جاري الاستيراد..." : "استيراد الآن"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="ml-2 h-5 w-5" />
            رفع ملف Excel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="excel-file">اختر ملف Excel</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={isProcessing}
              />
              <div className="text-xs text-gray-500 mt-1">
                يجب أن يحتوي الملف على أعمدة: اسم الزبون، رقم الهاتف، نوع السيارة، الموديل، رقم اللوحة، رمز المحرك
              </div>
            </div>

            {file && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border">
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                <span className="text-sm">{file.name}</span>
                {isProcessing && (
                  <Badge variant="secondary">جاري المعالجة...</Badge>
                )}
                {!isProcessing && data.length > 0 && (
                  <Badge variant="default">
                    <Check className="h-3 w-3 ml-1" />
                    تم التحليل
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Preview Section */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>معاينة البيانات</span>
              <Badge variant="outline">{data.length} سجل</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="max-h-96 overflow-y-auto">
                <div className="grid gap-2">
                  {data.slice(0, 10).map((customer, index) => (
                    <div key={index} className="border rounded p-3 bg-gray-50">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div><strong>الاسم:</strong> {customer.name}</div>
                        <div><strong>الهاتف:</strong> {customer.phone}</div>
                        <div><strong>السيارة:</strong> {customer.carType}</div>
                        <div><strong>الموديل:</strong> {customer.carModel}</div>
                        <div><strong>اللوحة:</strong> {customer.licensePlate}</div>
                        <div><strong>المحرك:</strong> {customer.engineCode}</div>
                      </div>
                    </div>
                  ))}
                  
                  {data.length > 10 && (
                    <div className="text-center text-sm text-gray-500 p-2 border rounded bg-blue-50">
                      و {data.length - 10} سجل إضافي آخر...
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4" />
                  تأكد من صحة البيانات قبل الاستيراد
                </div>
                <Button 
                  onClick={handleImport} 
                  disabled={isImporting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isImporting ? "جاري الاستيراد..." : "استيراد البيانات"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}