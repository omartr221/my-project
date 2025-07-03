import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, Play } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SimpleTaskForm() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    carBrand: "audi",
    carModel: "",
    licensePlate: "",
    estimatedDuration: 60,
    engineerName: "",
    supervisorName: "",
    technicians: [] as string[],
    assistants: [] as string[],
    repairOperation: "",
    taskType: "ميكانيك",
  });

  const { toast } = useToast();

  const { data: workers } = useQuery({
    queryKey: ['/api/workers'],
    queryFn: async () => {
      const response = await fetch('/api/workers');
      return response.json();
    },
  });

  const workerNames = workers?.map((w: any) => w.name) || [];

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/tasks", {
        ...data,
        workerId: 17,
        workerRole: "assistant",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء المهمة بنجاح",
        description: "تم إنشاء المهمة وبدء تتبع الوقت",
      });
      setOpen(false);
      setFormData({
        description: "",
        carBrand: "audi",
        carModel: "",
        licensePlate: "",
        estimatedDuration: 60,
        engineerName: "",
        supervisorName: "",
        technicians: [],
        assistants: [],
        repairOperation: "",
        taskType: "ميكانيك",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error: any) => {
      console.error("Error creating task:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء المهمة",
        description: "حدث خطأ أثناء إنشاء المهمة. يرجى المحاولة مرة أخرى.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.carModel || !formData.licensePlate) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
      });
      return;
    }
    createTaskMutation.mutate(formData);
  };

  const handleTechnicianChange = (name: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        technicians: [...prev.technicians, name]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        technicians: prev.technicians.filter(t => t !== name)
      }));
    }
  };

  const handleAssistantChange = (name: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        assistants: [...prev.assistants, name]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        assistants: prev.assistants.filter(a => a !== name)
      }));
    }
  };

  return (
    <>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setOpen(true)}>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold">إنشاء مهمة جديدة</CardTitle>
          <PlusCircle className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">اضغط لإضافة مهمة جديدة وتعيين الفريق</p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">إنشاء مهمة جديدة</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">وصف المهمة *</label>
                <Input
                  placeholder="أدخل وصف المهمة"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">عملية الإصلاح</label>
                <Input
                  placeholder="تفاصيل عملية الإصلاح"
                  value={formData.repairOperation}
                  onChange={(e) => setFormData(prev => ({ ...prev, repairOperation: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">نوع المهمة</label>
                <Select value={formData.taskType} onValueChange={(value) => setFormData(prev => ({ ...prev, taskType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ميكانيك">ميكانيك</SelectItem>
                    <SelectItem value="كهربا">كهربا</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">نوع السيارة</label>
                <Select value={formData.carBrand} onValueChange={(value) => setFormData(prev => ({ ...prev, carBrand: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="audi">أودي</SelectItem>
                    <SelectItem value="seat">سيات</SelectItem>
                    <SelectItem value="skoda">سكودا</SelectItem>
                    <SelectItem value="volkswagen">فولكس فاجن</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">موديل السيارة *</label>
                <Input
                  placeholder="أدخل موديل السيارة"
                  value={formData.carModel}
                  onChange={(e) => setFormData(prev => ({ ...prev, carModel: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">رقم اللوحة *</label>
                <Input
                  placeholder="أدخل رقم اللوحة"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الوقت المقدر (دقائق)</label>
                <Input
                  type="number"
                  placeholder="60"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 60 }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">المهندس</label>
                <Select value={formData.engineerName} onValueChange={(value) => setFormData(prev => ({ ...prev, engineerName: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المهندس" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">غير محدد</SelectItem>
                    {workerNames.map((name: string) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">المشرف</label>
                <Select value={formData.supervisorName} onValueChange={(value) => setFormData(prev => ({ ...prev, supervisorName: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المشرف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">غير محدد</SelectItem>
                    {workerNames.map((name: string) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">الفنيون</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-3">
                  {workerNames.map((name: string) => (
                    <div key={name} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`tech-${name}`}
                        checked={formData.technicians.includes(name)}
                        onChange={(e) => handleTechnicianChange(name, e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <label htmlFor={`tech-${name}`} className="text-sm font-medium">
                        {name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">المساعدون</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-3">
                  {workerNames.map((name: string) => (
                    <div key={name} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`asst-${name}`}
                        checked={formData.assistants.includes(name)}
                        onChange={(e) => handleAssistantChange(name, e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <label htmlFor={`asst-${name}`} className="text-sm font-medium">
                        {name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={createTaskMutation.isPending}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Play className="ml-2 h-4 w-4" />
                {createTaskMutation.isPending ? "جاري الإنشاء..." : "إنشاء وبدء المهمة"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}