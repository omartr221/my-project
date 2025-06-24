import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Archive, Search, Download, FolderArchive } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDuration, formatTime, formatDate, getCarBrandInArabic, getTaskStatusInArabic, getTaskStatusColor } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type TaskHistory } from "@shared/schema";

const archiveFormSchema = z.object({
  archivedBy: z.string().min(1, "يجب إدخال اسم المؤرشف"),
  notes: z.string().optional(),
});

type ArchiveFormData = z.infer<typeof archiveFormSchema>;

export default function ArchiveView() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // Fetch archived tasks
  const { data: archivedTasks, isLoading: loadingArchive } = useQuery({
    queryKey: ['/api/archive'],
    refetchInterval: 30000,
  });

  // Fetch search results
  const { data: searchResults, isLoading: loadingSearch } = useQuery({
    queryKey: ['/api/archive/search', searchTerm],
    enabled: searchTerm.length > 2,
  });

  // Fetch all task history for archiving
  const { data: taskHistory } = useQuery({
    queryKey: ['/api/tasks/history'],
  });

  const form = useForm<ArchiveFormData>({
    resolver: zodResolver(archiveFormSchema),
    defaultValues: {
      archivedBy: "",
      notes: "",
    },
  });

  const archiveTaskMutation = useMutation({
    mutationFn: async (data: ArchiveFormData & { taskId: number }) => {
      const response = await apiRequest("POST", `/api/tasks/${data.taskId}/archive`, {
        archivedBy: data.archivedBy,
        notes: data.notes,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/archive'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      form.reset();
      setSelectedTaskId(null);
      toast({
        title: "تم أرشفة المهمة بنجاح",
        description: "تم نقل المهمة إلى الأرشيف",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في أرشفة المهمة",
        description: "حاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ArchiveFormData) => {
    if (selectedTaskId) {
      archiveTaskMutation.mutate({ ...data, taskId: selectedTaskId });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.length > 2) {
      queryClient.invalidateQueries({ queryKey: ['/api/archive/search', searchTerm] });
    }
  };

  const completedTasks = taskHistory?.filter(task => task.status === 'completed') || [];
  const displayTasks = searchTerm.length > 2 ? searchResults : archivedTasks;
  const isLoading = searchTerm.length > 2 ? loadingSearch : loadingArchive;

  return (
    <div className="space-y-6">
      {/* Archive Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Archive Task */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderArchive className="ml-2 h-5 w-5" />
              أرشفة مهمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  لا توجد مهام مكتملة للأرشفة
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">اختر مهمة للأرشفة:</p>
                  {completedTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{task.worker.name}</p>
                        <p className="text-sm text-gray-600">
                          {task.description} - {getCarBrandInArabic(task.carBrand)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {task.carModel} - {task.licensePlate}
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedTaskId(task.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Archive className="ml-1 h-3 w-3" />
                            أرشف
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>أرشفة المهمة</DialogTitle>
                          </DialogHeader>
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                              <FormField
                                control={form.control}
                                name="archivedBy"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>اسم المؤرشف</FormLabel>
                                    <FormControl>
                                      <Input placeholder="اسم المدير أو المسؤول" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>ملاحظات الأرشفة (اختيارية)</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="أي ملاحظات إضافية حول المهمة..."
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button 
                                type="submit" 
                                disabled={archiveTaskMutation.isPending}
                                className="w-full"
                              >
                                {archiveTaskMutation.isPending ? "جاري الأرشفة..." : "أرشف المهمة"}
                              </Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Archive */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="ml-2 h-5 w-5" />
              البحث في الأرشيف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex space-x-reverse space-x-2">
                <Input
                  type="text"
                  placeholder="ابحث في الوصف، الموديل، رقم اللوحة، أو الملاحظات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={searchTerm.length < 3}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                أدخل على الأقل 3 أحرف للبحث
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Archive Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Archive className="ml-2 h-5 w-5" />
              {searchTerm.length > 2 ? `نتائج البحث: "${searchTerm}"` : "الأرشيف"}
            </CardTitle>
            <Button className="bg-green-600 hover:bg-green-700">
              <Download className="ml-2 h-4 w-4" />
              تصدير الأرشيف
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              جاري التحميل...
            </div>
          ) : !displayTasks || displayTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm.length > 2 ? "لا توجد نتائج للبحث" : "لا توجد مهام مؤرشفة"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      العامل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المهمة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      السيارة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المدة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الأرشفة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المؤرشف بواسطة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayTasks.map((task) => (
                    <tr key={task.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 ml-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {task.worker.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{task.description}</div>
                          {task.archiveNotes && (
                            <div className="text-xs text-gray-500 mt-1">
                              ملاحظات: {task.archiveNotes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {getCarBrandInArabic(task.carBrand)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {task.carModel} - {task.licensePlate}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDuration(task.totalDuration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.archivedAt ? formatDate(new Date(task.archivedAt)) : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.archivedBy || '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getTaskStatusColor(task.status)}>
                          {getTaskStatusInArabic(task.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}