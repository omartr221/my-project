import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CustomerAccountData {
  id: number;
  customerName: string;
  phoneNumber: string;
  licensePlate: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  lastPaymentDate: string;
  notes: string;
  status: "active" | "paid" | "overdue";
}

const mockData: CustomerAccountData[] = [
  {
    id: 1,
    customerName: "محمد عوده",
    phoneNumber: "0999123456",
    licensePlate: "508-5020",
    totalAmount: 250000,
    paidAmount: 150000,
    remainingAmount: 100000,
    lastPaymentDate: "2025-08-15",
    notes: "دفعة جزئية - باقي 100 ألف",
    status: "active"
  },
  {
    id: 2,
    customerName: "أحمد السيد",
    phoneNumber: "0998765432",
    licensePlate: "524-6344",
    totalAmount: 180000,
    paidAmount: 180000,
    remainingAmount: 0,
    lastPaymentDate: "2025-09-01",
    notes: "مدفوع بالكامل",
    status: "paid"
  },
];

export default function CustomerAccount() {
  const [accounts, setAccounts] = useState<CustomerAccountData[]>(mockData);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<CustomerAccountData>>({});

  const filteredAccounts = accounts.filter(account =>
    account.customerName.includes(searchTerm) ||
    account.phoneNumber.includes(searchTerm) ||
    account.licensePlate.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-500";
      case "active": return "bg-blue-500";
      case "overdue": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid": return "مدفوع";
      case "active": return "نشط";
      case "overdue": return "متأخر";
      default: return "غير محدد";
    }
  };

  const handleSaveNew = () => {
    if (newAccount.customerName && newAccount.phoneNumber) {
      const account: CustomerAccountData = {
        id: Date.now(),
        customerName: newAccount.customerName || "",
        phoneNumber: newAccount.phoneNumber || "",
        licensePlate: newAccount.licensePlate || "",
        totalAmount: newAccount.totalAmount || 0,
        paidAmount: newAccount.paidAmount || 0,
        remainingAmount: (newAccount.totalAmount || 0) - (newAccount.paidAmount || 0),
        lastPaymentDate: newAccount.lastPaymentDate || new Date().toISOString().split('T')[0],
        notes: newAccount.notes || "",
        status: newAccount.remainingAmount === 0 ? "paid" : "active"
      };
      setAccounts([...accounts, account]);
      setNewAccount({});
      setIsAddingNew(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">حساب الزبون</h2>
        <Button onClick={() => setIsAddingNew(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة حساب جديد
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="البحث بالاسم أو الهاتف أو رقم اللوحة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Add New Account Form */}
      {isAddingNew && (
        <Card>
          <CardHeader>
            <CardTitle>إضافة حساب زبون جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">اسم الزبون</Label>
                <Input
                  id="customerName"
                  value={newAccount.customerName || ""}
                  onChange={(e) => setNewAccount({ ...newAccount, customerName: e.target.value })}
                  placeholder="أدخل اسم الزبون"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">رقم الهاتف</Label>
                <Input
                  id="phoneNumber"
                  value={newAccount.phoneNumber || ""}
                  onChange={(e) => setNewAccount({ ...newAccount, phoneNumber: e.target.value })}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
              <div>
                <Label htmlFor="licensePlate">رقم اللوحة</Label>
                <Input
                  id="licensePlate"
                  value={newAccount.licensePlate || ""}
                  onChange={(e) => setNewAccount({ ...newAccount, licensePlate: e.target.value })}
                  placeholder="أدخل رقم اللوحة"
                />
              </div>
              <div>
                <Label htmlFor="totalAmount">المبلغ الإجمالي</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={newAccount.totalAmount || ""}
                  onChange={(e) => setNewAccount({ ...newAccount, totalAmount: Number(e.target.value) })}
                  placeholder="المبلغ الإجمالي"
                />
              </div>
              <div>
                <Label htmlFor="paidAmount">المبلغ المدفوع</Label>
                <Input
                  id="paidAmount"
                  type="number"
                  value={newAccount.paidAmount || ""}
                  onChange={(e) => setNewAccount({ ...newAccount, paidAmount: Number(e.target.value) })}
                  placeholder="المبلغ المدفوع"
                />
              </div>
              <div>
                <Label htmlFor="lastPaymentDate">تاريخ آخر دفعة</Label>
                <Input
                  id="lastPaymentDate"
                  type="date"
                  value={newAccount.lastPaymentDate || ""}
                  onChange={(e) => setNewAccount({ ...newAccount, lastPaymentDate: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={newAccount.notes || ""}
                  onChange={(e) => setNewAccount({ ...newAccount, notes: e.target.value })}
                  placeholder="أدخل ملاحظات..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setIsAddingNew(false); setNewAccount({}); }}>
                <X className="h-4 w-4 mr-2" />
                إلغاء
              </Button>
              <Button onClick={handleSaveNew}>
                <Save className="h-4 w-4 mr-2" />
                حفظ
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts List */}
      <div className="space-y-4">
        {filteredAccounts.map((account) => (
          <Card key={account.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{account.customerName}</h3>
                    <Badge className={`${getStatusColor(account.status)} text-white`}>
                      {getStatusText(account.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label className="text-sm text-gray-500">رقم الهاتف</Label>
                      <p className="font-medium">{account.phoneNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">رقم اللوحة</Label>
                      <p className="font-medium">{account.licensePlate}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">تاريخ آخر دفعة</Label>
                      <p className="font-medium">{account.lastPaymentDate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label className="text-sm text-gray-500">المبلغ الإجمالي</Label>
                      <p className="font-medium text-blue-600">{account.totalAmount.toLocaleString()} ل.س</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">المبلغ المدفوع</Label>
                      <p className="font-medium text-green-600">{account.paidAmount.toLocaleString()} ل.س</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">المبلغ المتبقي</Label>
                      <p className={`font-medium ${account.remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                        {account.remainingAmount.toLocaleString()} ل.س
                      </p>
                    </div>
                  </div>

                  {account.notes && (
                    <div className="mt-4">
                      <Label className="text-sm text-gray-500">ملاحظات</Label>
                      <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{account.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAccounts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">لا توجد حسابات زبائن</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}