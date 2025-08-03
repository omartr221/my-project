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

  const { data: partsRequests = [], isLoading } = useQuery<PartsRequest[]>({
    queryKey: ["/api/parts-requests"],
  });

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
        notes: 'تم الاستلام بنجاح'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم التسليم بنجاح",
        description: "تم تسليم القطعة بنجاح",
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

  const filteredRequests = partsRequests.filter((request) => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesSearch = searchTerm === "" || 
      request.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.engineerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.carInfo.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
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

      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            طلبات القطع
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* الفلاتر */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="فلتر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="approved">موافق عليه</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                  <SelectItem value="delivered">تم التسليم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="h-4 w-4" />
              <Input
                placeholder="بحث في اسم القطعة، المهندس، أو السيارة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                  <TableHead>الحالة</TableHead>
                  <TableHead>الملاحظات</TableHead>
                  <TableHead>سجل المهام</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      لا توجد طلبات قطع
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.requestNumber || `#${request.id}`}
                      </TableCell>
                      <TableCell>{request.engineerName}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{request.carInfo}</div>
                          {request.carBrand && (
                            <div className="text-xs text-muted-foreground">
                              {request.carBrand} {request.carModel}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{request.partName}</TableCell>
                      <TableCell>{request.quantity}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {reasonLabels[request.reasonType as keyof typeof reasonLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                          {statusLabels[request.status as keyof typeof statusLabels]}
                        </Badge>
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
                            <span>طلب: {new Date(request.requestedAt!).toLocaleDateString('ar-SY', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}</span>
                          </div>
                          
                          {request.approvedAt && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>موافقة: {new Date(request.approvedAt).toLocaleDateString('ar-SY', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}</span>
                            </div>
                          )}
                          
                          {request.inPreparationAt && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>تحضير: {new Date(request.inPreparationAt).toLocaleDateString('ar-SY', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}</span>
                            </div>
                          )}
                          
                          {request.readyForPickupAt && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>جاهز: {new Date(request.readyForPickupAt).toLocaleDateString('ar-SY', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}</span>
                            </div>
                          )}
                          
                          {request.orderedExternallyAt && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span>خارجي: {new Date(request.orderedExternallyAt).toLocaleDateString('ar-SY', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}</span>
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
                              <span>وصول: {new Date(request.partsArrivedAt).toLocaleDateString('ar-SY', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}</span>
                            </div>
                          )}
                          
                          {request.unavailableAt && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              <span>غير متوفر: {new Date(request.unavailableAt).toLocaleDateString('ar-SY', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}</span>
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
                          {request.status === "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(request.id, "delivered")}
                              disabled={updateStatusMutation.isPending}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Package2 className="h-4 w-4 mr-1" />
                              تم التسليم
                            </Button>
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
                              {finalDeliveryMutation.isPending ? 'جاري...' : 'تسليم'}
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