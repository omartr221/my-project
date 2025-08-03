import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartsRequestForm from "@/components/PartsRequestForm";
import PartsRequestsList from "@/components/PartsRequestsList";
import { useAuth } from "@/hooks/use-auth";
import { Package2, Plus, List } from "lucide-react";

export default function PartsRequestsPage() {
  const { user } = useAuth();
  
  // Check if user can create parts requests
  const canCreateParts = user?.permissions?.includes('parts:create');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Package2 className="h-8 w-8 text-blue-600" />
            طلبات القطع
          </h1>
          <p className="text-gray-600">
            إدارة طلبات القطع والمواد للسيارات
          </p>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              قائمة الطلبات
            </TabsTrigger>
            {canCreateParts && (
              <TabsTrigger value="new-request" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                طلب جديد
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="requests" className="mt-6">
            <PartsRequestsList />
          </TabsContent>

          {canCreateParts && (
            <TabsContent value="new-request" className="mt-6">
              <PartsRequestForm />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}