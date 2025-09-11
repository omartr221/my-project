import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, XCircle, Clock, Package2, Search, Filter, Check, Undo2, MessageSquare } from "lucide-react";
import { type PartsRequest } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/useNotifications";
import { useEffect } from "react";
import { formatDate, formatTime, createSyrianDate } from "@/lib/utils";
import NotificationTester from './NotificationTester';
import NotificationDebugger from './NotificationDebugger';

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  in_preparation: "bg-blue-100 text-blue-800",
  awaiting_pickup: "bg-purple-100 text-purple-800",
  ordered_externally: "bg-orange-100 text-orange-800",
  parts_arrived: "bg-emerald-100 text-emerald-800",
  unavailable: "bg-gray-100 text-gray-800",
  rejected: "bg-red-100 text-red-800",
  delivered: "bg-gray-100 text-gray-800",
  returned: "bg-red-200 text-red-900",
};

const statusLabels = {
  pending: "في الانتظار",
  approved: "موافق عليه", 
  in_preparation: "قيد التحضير",
  awaiting_pickup: "بانتظار الاستلام",
  ordered_externally: "تم الطلب خارجياً",
  parts_arrived: "وصلت القطعة بانتظار التسليم",
  unavailable: "غير متوفر",
  rejected: "مرفوض",
  delivered: "تم الاستلام",
  returned: "تم الترجيع",
};

const reasonLabels = {
  expense: "صرف",
  loan: "إعارة",
};

export default function PartsRequestsList() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<{[key: number]: string}>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { markPartsRequestsAsViewed } = useNotifications();

  const { data: partsRequests = [], isLoading } = useQuery<PartsRequest[]>({
    queryKey: ["/api/parts-requests"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // تحديد الطلبات كمقروءة عند تحميل البيانات (فقط لهبة)
  useEffect(() => {
    if (user?.username === "هبة" && partsRequests.length > 0) {
      markPartsRequestsAsViewed();
    }
  }, [partsRequests, user, markPartsRequestsAsViewed]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/parts-requests/${id}/status`, {
        status,
        notes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث حالة الطلب بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/parts-requests"] });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في تحديث حالة الطلب",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // وظيفة التسليم النهائي
  const finalDeliveryMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await apiRequest('PATCH', `/api/parts-requests/${requestId}/status`, {
        status: 'delivered',
        notes: 'تم استلام القطعة'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الاستلام بنجاح",
        description: "تم استلام القطعة بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parts-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في التسليم",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // وظيفة ترجيع القطعة
  const returnPartMutation = useMutation({
    mutationFn: async ({ id, returnReason }: { id: number; returnReason: string }) => {
      const response = await apiRequest('PUT', `/api/parts-requests/${id}/return`, {
        returnReason,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم ترجيع القطعة",
        description: "تم إرسال طلب الترجيع بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parts-requests'] });
      setReturnReason("");
      setSelectedRequestId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في ترجيع القطعة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // وظيفة تحديث الملاحظات
  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, userNotes }: { id: number; userNotes: string }) => {
      const response = await apiRequest('PUT', `/api/parts-requests/${id}/notes`, {
        userNotes,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الملاحظات",
        description: "تم حفظ الملاحظات بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/parts-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تحديث الملاحظات",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredRequests = (partsRequests as PartsRequest[])
    .filter((request: PartsRequest) => {
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesSearch = searchTerm === "" || 
        request.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.engineerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.carInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    })
    .sort((a: PartsRequest, b: PartsRequest) => {
      // ترتيب حسب الأولوية: pending أولاً، ثم حسب التاريخ
      const statusPriority = {
        'pending': 1,
        'approved': 2,
        'in_preparation': 3,
        'awaiting_pickup': 4,
        'parts_arrived': 5,
        'delivered': 6,
        'rejected': 7,
        'returned': 8
      };
      
      const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 9;
      const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 9;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // نفس الأولوية: ترتيب حسب التاريخ (الأحدث أولاً)
      return new Date(b.requestedAt || '').getTime() - new Date(a.requestedAt || '').getTime();
    });

  const handleStatusUpdate = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleReturnPart = (id: number) => {
    returnPartMutation.mutate({ id, returnReason });
  };

  const handleUpdateNotes = (id: number, notes: string) => {
    updateNotesMutation.mutate({ id, userNotes: notes });
  };

  const handleNotesChange = (id: number, value: string) => {
    setEditingNotes(prev => ({ ...prev, [id]: value }));
  };

  const saveNotes = (id: number) => {
    const notes = editingNotes[id] || "";
    handleUpdateNotes(id, notes);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Package2 className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p>جاري تحميل طلبات القطع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Tester - للاختبار فقط */}
      {user?.username === "هبة" && (
        <div className="space-y-4">
          <NotificationTester />
          <NotificationDebugger />
        </div>
      )}

      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            طلبات القطع
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-800">
                  {(partsRequests as PartsRequest[]).filter((r: PartsRequest) => r.status === 'pending').length}
                </div>
                <div className="text-sm text-yellow-600">في الانتظار</div>
              </div>
            </Card>
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-800">
                  {(partsRequests as PartsRequest[]).filter((r: PartsRequest) => ['approved', 'in_preparation'].includes(r.status || '')).length}
                </div>
                <div className="text-sm text-blue-600">قيد التحضير</div>
              </div>
            </Card>
            <Card className="p-4 bg-purple-50 border-purple-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-800">
                  {(partsRequests as PartsRequest[]).filter((r: PartsRequest) => ['awaiting_pickup', 'parts_arrived'].includes(r.status || '')).length}
                </div>
                <div className="text-sm text-purple-600">جاهزة للاستلام</div>
              </div>
            </Card>
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-800">
                  {(partsRequests as PartsRequest[]).filter((r: PartsRequest) => r.status === 'delivered').length}
                </div>
                <div className="text-sm text-green-600">تم التسليم</div>
              </div>
            </Card>
          </div>

          {/* الفلاتر */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="فلتر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات ({(partsRequests as PartsRequest[]).length})</SelectItem>
                  <SelectItem value="pending">في الانتظار ({(partsRequests as PartsRequest[]).filter((r: PartsRequest) => r.status === 'pending').length})</SelectItem>
                  <SelectItem value="approved">موافق عليه ({(partsRequests as PartsRequest[]).filter((r: PartsRequest) => r.status === 'approved').length})</SelectItem>
                  <SelectItem value="in_preparation">قيد التحضير ({(partsRequests as PartsRequest[]).filter((r: PartsRequest) => r.status === 'in_preparation').length})</SelectItem>
                  <SelectItem value="awaiting_pickup">بانتظار الاستلام ({(partsRequests as PartsRequest[]).filter((r: PartsRequest) => r.status === 'awaiting_pickup').length})</SelectItem>
                  <SelectItem value="delivered">تم التسليم ({(partsRequests as PartsRequest[]).filter((r: PartsRequest) => r.status === 'delivered').length})</SelectItem>
                  <SelectItem value="rejected">مرفوض ({(partsRequests as PartsRequest[]).filter((r: PartsRequest) => r.status === 'rejected').length})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="h-4 w-4 text-gray-600" />
              <Input
                placeholder="بحث في اسم القطعة، المهندس، الزبون، أو رقم السيارة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white"
              />
            </div>
            
            <div className="text-sm text-gray-600 self-center">
              عرض {filteredRequests.length} من {(partsRequests as PartsRequest[]).length} طلب
            </div>
          </div>

          {/* جدول الطلبات */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>المهندس</TableHead>
                  <TableHead>السيارة</TableHead>
                  <TableHead>اسم القطعة</TableHead>
                  <TableHead>العدد</TableHead>
                  <TableHead>سبب الطلب</TableHead>
                  <TableHead>للورشة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الملاحظات</TableHead>
                  <TableHead>سجل المهام</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      لا توجد طلبات قطع
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request: PartsRequest) => (
                    <TableRow key={request.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {request.requestNumber || `#${request.id}`}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {formatDate(request.requestedAt || '')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{request.engineerName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{request.customerName || request.carInfo}</div>
                          <div className="text-xs text-gray-500">{request.licensePlate}</div>
                          {request.carBrand && (
                            <div className="text-xs text-muted-foreground">
                              {request.carBrand} {request.carModel}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{request.partName}</div>
                        {request.notes && (
                          <div className="text-xs text-gray-500 mt-1">{request.notes}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-sm">
                          {request.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {reasonLabels[request.reasonType as keyof typeof reasonLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {(request as any).forWorkshop || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                            {statusLabels[request.status as keyof typeof statusLabels]}
                          </Badge>
                          {request.status === 'delivered' && request.deliveredAt && (
                            <div className="text-xs text-green-600">
                              تم في: {formatDate(request.deliveredAt || '')}
                            </div>
                          )}
                          {request.status === 'pending' && (
                            <div className="text-xs text-yellow-600">
                              منذ: {Math.floor((Date.now() - new Date((request.requestedAt || '') + 'Z').getTime()) / (1000 * 60 * 60))} ساعة
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2 max-w-xs">
                          {user?.username === "بدوي" ? (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="اكتب ملاحظاتك هنا..."
                                value={editingNotes[request.id] ?? request.userNotes ?? ""}
                                onChange={(e) => handleNotesChange(request.id, e.target.value)}
                                className="min-h-[60px] text-sm"
                              />
                              {(editingNotes[request.id] !== undefined && editingNotes[request.id] !== (request.userNotes ?? "")) && (
                                <Button
                                  size="sm"
                                  onClick={() => saveNotes(request.id)}
                                  disabled={updateNotesMutation.isPending}
                                  className="w-full"
                                >
                                  {updateNotesMutation.isPending ? "حفظ..." : "حفظ الملاحظات"}
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              {request.userNotes || "لا توجد ملاحظات"}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>طلب: {formatTime(request.requestedAt!)}</span>
                          </div>
                          
                          {request.approvedAt && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>موافقة: {formatTime(request.approvedAt)}</span>
                            </div>
                          )}
                          
                          {request.inPreparationAt && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>تحضير: {formatTime(request.inPreparationAt)}</span>
                            </div>
                          )}
                          
                          {request.readyForPickupAt && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>جاهز: {formatTime(request.readyForPickupAt)}</span>
                            </div>
                          )}
                          
                          {request.orderedExternallyAt && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span>خارجي: {formatTime(request.orderedExternallyAt)}</span>
                            </div>
                          )}
                          
                          {request.estimatedArrival && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                              <span>متوقع: {request.estimatedArrival}</span>
                            </div>
                          )}
                          
                          {request.partsArrivedAt && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <span>وصول: {formatTime(request.partsArrivedAt)}</span>
                            </div>
                          )}
                          
                          {request.unavailableAt && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              <span>غير متوفر: {formatTime(request.unavailableAt)}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {request.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(request.id, "approved")}
                                disabled={updateStatusMutation.isPending}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                موافقة
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(request.id, "rejected")}
                                disabled={updateStatusMutation.isPending}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                رفض
                              </Button>
                            </>
                          )}

                          
                          {/* زر تسليم للمستخدم بدوي */}
                          {user?.username === 'بدوي' && request.status !== 'delivered' && request.status !== 'rejected' && request.status !== 'returned' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => finalDeliveryMutation.mutate(request.id)}
                              disabled={finalDeliveryMutation.isPending}
                              className="bg-teal-600 hover:bg-teal-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              {finalDeliveryMutation.isPending ? 'جاري...' : 'تم الاستلام'}
                            </Button>
                          )}

                          {/* زر ترجيع القطعة للمستخدم بدوي */}
                          {user?.username === 'بدوي' && request.status === 'delivered' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Undo2 className="h-4 w-4 mr-1" />
                                  ترجيع القطعة
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>ترجيع القطعة</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">سبب الترجيع</label>
                                    <Textarea
                                      placeholder="اكتب سبب ترجيع القطعة..."
                                      value={returnReason}
                                      onChange={(e) => setReturnReason(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleReturnPart(request.id)}
                                      disabled={returnPartMutation.isPending || !returnReason.trim()}
                                      className="flex-1"
                                    >
                                      {returnPartMutation.isPending ? "جاري الترجيع..." : "تأكيد الترجيع"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}