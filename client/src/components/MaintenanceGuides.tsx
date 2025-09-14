import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoaderIcon, BookOpenIcon, WrenchIcon, AlertTriangleIcon, ClockIcon, TrendingUpIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MaintenanceGuide {
  id: number;
  carBrand: string;
  carPart: string;
  title: string;
  content: string;
  tools: string;
  safetyTips: string;
  estimatedTime: number;
  difficulty: "easy" | "medium" | "hard";
  generatedAt: string;
  lastUsed: string;
  useCount: number;
}

const CAR_BRANDS = [
  { value: "audi", label: "أودي" },
  { value: "seat", label: "سيات" },
  { value: "skoda", label: "سكودا" },
  { value: "volkswagen", label: "فولكس فاجن" },
];

const CAR_PARTS = [
  { value: "engine", label: "المحرك" },
  { value: "brakes", label: "الفرامل" },
  { value: "exhaust", label: "نظام العادم" },
  { value: "transmission", label: "ناقل الحركة" },
  { value: "suspension", label: "نظام التعليق" },
  { value: "cooling", label: "نظام التبريد" },
  { value: "electrical", label: "النظام الكهربائي" },
  { value: "fuel", label: "نظام الوقود" },
  { value: "air_conditioning", label: "المكيف" },
  { value: "steering", label: "نظام التوجيه" },
];

const DIFFICULTY_COLORS = {
  easy: "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200",
  hard: "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200",
};

const DIFFICULTY_LABELS = {
  easy: "سهل",
  medium: "متوسط",
  hard: "صعب",
};

export function MaintenanceGuides() {
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedPart, setSelectedPart] = useState<string>("");
  const [selectedGuide, setSelectedGuide] = useState<MaintenanceGuide | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing guides
  const { data: guides = [], isLoading } = useQuery<MaintenanceGuide[]>({
    queryKey: ["/api/maintenance-guides"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Generate new guide mutation
  const generateGuideMutation = useMutation({
    mutationFn: async ({ carBrand, carPart }: { carBrand: string; carPart: string }) => {
      const response = await fetch("/api/maintenance-guides/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ carBrand, carPart }),
      });
      
      if (!response.ok) {
        throw new Error("فشل في توليد دليل الصيانة");
      }
      
      return await response.json();
    },
    onSuccess: (newGuide: MaintenanceGuide) => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-guides"] });
      setSelectedGuide(newGuide);
      toast({
        title: "تم إنشاء دليل الصيانة",
        description: "تم توليد دليل صيانة جديد بنجاح باستخدام الذكاء الاصطناعي",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في توليد الدليل",
        description: error?.message || "حدث خطأ أثناء توليد دليل الصيانة",
        variant: "destructive",
      });
    },
  });

  const handleGenerateGuide = () => {
    if (!selectedBrand || !selectedPart) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى اختيار نوع السيارة وقطعة السيارة",
        variant: "destructive",
      });
      return;
    }

    generateGuideMutation.mutate({
      carBrand: selectedBrand,
      carPart: selectedPart,
    });
  };

  const filteredGuides = guides.filter((guide: MaintenanceGuide) => {
    return (!selectedBrand || guide.carBrand === selectedBrand) &&
           (!selectedPart || guide.carPart === selectedPart);
  });

  const parseJsonField = (field: string): string[] => {
    try {
      return JSON.parse(field || "[]");
    } catch {
      return [];
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpenIcon className="h-8 w-8 text-blue-600" />
          دليل الصيانة الذكي
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          احصل على تعليمات صيانة مفصلة للسيارات الألمانية باستخدام الذكاء الاصطناعي
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WrenchIcon className="h-5 w-5" />
                اختيار السيارة والقطعة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">نوع السيارة</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand} data-testid="select-car-brand">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع السيارة" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAR_BRANDS.map((brand) => (
                      <SelectItem key={brand.value} value={brand.value}>
                        {brand.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">قطعة السيارة</label>
                <Select value={selectedPart} onValueChange={setSelectedPart} data-testid="select-car-part">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر قطعة السيارة" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAR_PARTS.map((part) => (
                      <SelectItem key={part.value} value={part.value}>
                        {part.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerateGuide}
                disabled={!selectedBrand || !selectedPart || generateGuideMutation.isPending}
                className="w-full"
                data-testid="button-generate-guide"
              >
                {generateGuideMutation.isPending ? (
                  <>
                    <LoaderIcon className="ml-2 h-4 w-4 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  "توليد دليل صيانة"
                )}
              </Button>

              {filteredGuides.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-3">الأدلة المحفوظة</h3>
                    <div className="space-y-2">
                      {filteredGuides.map((guide: MaintenanceGuide) => (
                        <Button
                          key={guide.id}
                          variant="outline"
                          size="sm"
                          className="w-full justify-between text-right"
                          onClick={() => setSelectedGuide(guide)}
                          data-testid={`button-guide-${guide.id}`}
                        >
                          <span className="truncate">{guide.title}</span>
                          <Badge variant="secondary" className={DIFFICULTY_COLORS[guide.difficulty]}>
                            {DIFFICULTY_LABELS[guide.difficulty]}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Guide Display */}
        <div className="lg:col-span-2">
          {selectedGuide ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2" data-testid="text-guide-title">
                      {selectedGuide.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {selectedGuide.estimatedTime} دقيقة
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUpIcon className="h-4 w-4" />
                        استُخدم {selectedGuide.useCount} مرات
                      </div>
                    </div>
                  </div>
                  <Badge className={DIFFICULTY_COLORS[selectedGuide.difficulty]} data-testid="badge-difficulty">
                    {DIFFICULTY_LABELS[selectedGuide.difficulty]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {/* Main Content */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <BookOpenIcon className="h-5 w-5" />
                        خطوات الصيانة
                      </h3>
                      <div className="prose prose-sm max-w-none" data-testid="content-maintenance-steps">
                        <pre className="whitespace-pre-wrap font-sans">{selectedGuide.content}</pre>
                      </div>
                    </div>

                    <Separator />

                    {/* Tools */}
                    {selectedGuide.tools && parseJsonField(selectedGuide.tools).length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <WrenchIcon className="h-5 w-5" />
                          الأدوات المطلوبة
                        </h3>
                        <ul className="list-disc list-inside space-y-1" data-testid="list-tools">
                          {parseJsonField(selectedGuide.tools).map((tool, index) => (
                            <li key={index} className="text-sm">{tool}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Safety Tips */}
                    {selectedGuide.safetyTips && parseJsonField(selectedGuide.safetyTips).length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
                          <AlertTriangleIcon className="h-5 w-5" />
                          نصائح السلامة
                        </h3>
                        <ul className="list-disc list-inside space-y-1" data-testid="list-safety-tips">
                          {parseJsonField(selectedGuide.safetyTips).map((tip, index) => (
                            <li key={index} className="text-sm text-red-700 dark:text-red-400">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-96 text-center">
                <BookOpenIcon className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">لم يتم اختيار دليل صيانة</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  اختر نوع السيارة وقطعة السيارة لتوليد دليل صيانة جديد، أو اختر دليلاً محفوظاً
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}