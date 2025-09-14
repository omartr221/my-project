import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wrench, Settings, Car, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const carParts = [
  { id: "engine", name: "المحرك", icon: Settings },
  { id: "brakes", name: "الفرامل", icon: AlertTriangle },
  { id: "transmission", name: "ناقل الحركة", icon: Settings },
  { id: "exhaust", name: "نظام العادم", icon: Car },
  { id: "cooling", name: "نظام التبريد", icon: Settings },
  { id: "electrical", name: "النظام الكهربائي", icon: Settings },
  { id: "suspension", name: "نظام التعليق", icon: Car },
  { id: "steering", name: "نظام التوجيه", icon: Car },
  { id: "air_conditioning", name: "تكييف الهواء", icon: Settings },
  { id: "fuel_system", name: "نظام الوقود", icon: Settings }
];

export default function MaintenanceGuide() {
  const [selectedPart, setSelectedPart] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePartSelect = async (partId: string) => {
    setSelectedPart(partId);
    setIsLoading(true);
    
    const part = carParts.find(p => p.id === partId);
    if (!part) return;

    try {
      const res = await fetch('/api/maintenance-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          part: part.name,
          query: `أريد خطوات صيانة تفصيلية لـ ${part.name} في السيارات الألمانية`
        }),
      });

      if (!res.ok) {
        throw new Error('فشل في الحصول على دليل الصيانة');
      }

      const data = await res.json();
      setResponse(data.guide);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطأ",
        description: "فشل في الحصول على دليل الصيانة. حاول مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomQuery = async () => {
    if (!customQuery.trim()) {
      toast({
        title: "تحذير",
        description: "الرجاء إدخال استفسار صيانة",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/maintenance-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: customQuery
        }),
      });

      if (!res.ok) {
        throw new Error('فشل في الحصول على دليل الصيانة');
      }

      const data = await res.json();
      setResponse(data.guide);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطأ",
        description: "فشل في الحصول على دليل الصيانة. حاول مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Wrench className="h-6 w-6 text-blue-600" />
            دليل الصيانة - السيارات الألمانية
          </CardTitle>
          <p className="text-gray-600">
            مساعد فني متخصص في صيانة السيارات الألمانية. اختر جزءًا من السيارة أو اكتب استفسارك
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* اختيار جزء السيارة */}
          <div>
            <h3 className="text-lg font-semibold mb-4">أجزاء السيارة</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {carParts.map((part) => {
                const Icon = part.icon;
                return (
                  <Button
                    key={part.id}
                    variant={selectedPart === part.id ? "default" : "outline"}
                    onClick={() => handlePartSelect(part.id)}
                    className="h-16 flex flex-col items-center gap-1 p-2"
                    disabled={isLoading}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs text-center">{part.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* استفسار مخصص */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">استفسار مخصص</h3>
            <div className="space-y-3">
              <Textarea
                placeholder="اكتب استفسارك حول صيانة السيارة هنا... مثال: كيف أغير زيت المحرك لسيارة BMW؟"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <Button
                onClick={handleCustomQuery}
                disabled={isLoading || !customQuery.trim()}
                className="w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <Clock className="ml-2 h-4 w-4 animate-spin" />
                    جاري البحث...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                    احصل على دليل الصيانة
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* النتيجة */}
          {response && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                دليل الصيانة
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="prose prose-sm max-w-none" style={{ direction: 'rtl' }}>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                    {response}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-gray-600">جاري إعداد دليل الصيانة...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}