import { useState, useRef, useCallback } from "react";
import { Camera, Upload, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CustomerData {
  customerName: string;
  carBrand: string;
  carModel: string;
  licensePlate: string;
  previousLicensePlate?: string;
  chassisNumber?: string;
  engineCode?: string;
  year?: number;
  color?: string;
}

interface LicensePlateCameraProps {
  onCustomerFound: (customer: CustomerData) => void;
}

export default function LicensePlateCamera({ onCustomerFound }: LicensePlateCameraProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // تحويل ملف إلى base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // إزالة البادئة "data:image/...;base64,"
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
    });
  };

  // تحليل صورة اللوحة
  const analyzeImage = async (imageFile: File) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      console.log('📸 بدء تحليل الصورة...');
      
      // تحويل الصورة إلى base64
      const base64Image = await fileToBase64(imageFile);
      
      // عرض الصورة للمستخدم
      setCapturedImage(URL.createObjectURL(imageFile));

      // تحليل الصورة محلياً باستخدام OCR
      const response = await fetch('/api/analyze-license-plate', {
        method: 'POST',
        body: JSON.stringify({ image: base64Image }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('🔍 نتيجة تحليل اللوحة:', result);
      // البحث عن بيانات الزبون إذا وُجد رقم لوحة
      let customerData = null;
      if (result.licensePlate) {
        try {
          const response = await fetch(`/api/search-car-info/${encodeURIComponent(result.licensePlate)}`);
          if (response.ok) {
            customerData = await response.json();
          }
        } catch (error) {
          console.log('لم يتم العثور على زبون لهذا الرقم');
        }
      }

      setAnalysisResult({
        ...result,
        customerInfo: customerData
      });

      if (result.licensePlate && customerData) {
        toast({
          title: "تم العثور على الزبون!",
          description: `${customerData.customerName} - ${customerData.carBrand} ${customerData.carModel}`,
        });
      } else {
        toast({
          title: "لم يتم العثور على رقم لوحة صحيح",
          description: `تم استخراج: ${result.licensePlate || 'لا شيء'} - جرب الإدخال اليدوي`,
          variant: "destructive",
        });
        
        // إظهار خيار الإدخال اليدوي مع الرقم المستخرج كاقتراح
        setAnalysisResult({
          ...result,
          manualInput: result.licensePlate || "",
          requiresManualInput: true,
          customerInfo: null  // Clear previous customer info
        });
      }
    } catch (error) {
      console.error('❌ خطأ في تحليل الصورة:', error);
      toast({
        title: "خطأ في تحليل الصورة",
        description: "حدث خطأ أثناء تحليل صورة اللوحة",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // البحث عن الزبون بناءً على رقم اللوحة
  const searchCustomerByPlate = async (licensePlate: string) => {
    try {
      console.log('🔍 البحث عن الزبون برقم اللوحة:', licensePlate);
      
      const response = await fetch(`/api/search-car-info/${encodeURIComponent(licensePlate)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const customerData = await response.json();
      
      console.log('✅ تم العثور على بيانات الزبون:', customerData);
      
      // تحضير تفاصيل السيارة الكاملة
      const carDetails = [
        `🚗 السيارة: ${customerData.carBrand || 'غير محدد'} ${customerData.carModel || ''}`,
        customerData.year ? `📅 سنة الصنع: ${customerData.year}` : null,
        customerData.color ? `🎨 اللون: ${customerData.color}` : null,
        customerData.engineCode ? `🔧 كود المحرك: ${customerData.engineCode}` : null,
        customerData.chassisNumber ? `🔍 رقم الشاسيه: ${customerData.chassisNumber}` : null,
        customerData.previousLicensePlate ? `🔄 رقم اللوحة السابق: ${customerData.previousLicensePlate}` : null
      ].filter(Boolean);

      toast({
        title: `✅ تم العثور على الزبون: ${customerData.customerName}`,
        description: carDetails.join('\n'),
        duration: 10000,
      });

      // إرسال البيانات للمكون الرئيسي
      onCustomerFound(customerData);
      
      // إغلاق النافذة
      setIsOpen(false);
      resetCamera();
      
    } catch (error: any) {
      console.error('❌ خطأ في البحث عن الزبون:', error);
      
      if (error.message && error.message.includes('404')) {
        toast({
          title: "لم يتم العثور على الزبون",
          description: `لا توجد بيانات للسيارة رقم: ${licensePlate}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطأ في البحث",
          description: "حدث خطأ أثناء البحث عن بيانات الزبون",
          variant: "destructive",
        });
      }
    }
  };

  // معالج اختيار الملف
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      analyzeImage(file);
    } else {
      toast({
        title: "ملف غير صالح",
        description: "يرجى اختيار صورة صالحة",
        variant: "destructive",
      });
    }
  }, []);

  // إعادة تعيين الكاميرا
  const resetCamera = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Camera className="h-4 w-4" />
          كاميرا رقم اللوحة
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            تصوير رقم اللوحة
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!capturedImage ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Camera className="h-8 w-8 text-blue-600" />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg font-medium">اختر صورة رقم اللوحة</p>
                    <p className="text-sm text-gray-500 mt-1">
                      اختر صورة واضحة لرقم اللوحة للحصول على أفضل النتائج
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    capture="environment"
                  />

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                    disabled={isAnalyzing}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    اختيار صورة
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="صورة رقم اللوحة"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={resetCamera}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {isAnalyzing ? (
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="mr-2">جارٍ تحليل الصورة...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
              
              {analysisResult ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">نتيجة التحليل</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">رقم اللوحة: </span>
                        <span className={analysisResult.licensePlate ? "text-green-600" : "text-red-600"}>
                          {analysisResult.licensePlate || "لم يتم العثور عليه"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">مستوى الثقة: </span>
                        <span>{Math.round(analysisResult.confidence * 100)}%</span>
                      </div>
                      {analysisResult.rawText && (
                        <div>
                          <span className="font-medium">النص المرئي: </span>
                          <span className="text-sm text-gray-600">{analysisResult.rawText}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetCamera}
                  className="flex-1"
                >
                  صورة أخرى
                </Button>
                {analysisResult?.licensePlate && (
                  <Button
                    onClick={() => searchCustomerByPlate(analysisResult.licensePlate)}
                    className="flex-1"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    بحث
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}