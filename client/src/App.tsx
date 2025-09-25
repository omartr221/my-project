import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import PartsRequestsPage from "@/pages/parts-requests-page";
import Reception from "@/pages/Reception";
import Workshop from "@/pages/Workshop";
import MaintenancePage from "@/pages/maintenance-page";
import BackupPage from "@/pages/BackupPage";
import AuthPage from "@/pages/auth-page";
import SimpleLogin from "@/pages/simple-login";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AlertDialog from "@/components/AlertDialog";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/parts-requests" component={PartsRequestsPage} />
      <ProtectedRoute path="/reception" component={Reception} />
      <ProtectedRoute path="/workshop" component={Workshop} />
      <ProtectedRoute path="/maintenance" component={MaintenancePage} />
      <ProtectedRoute path="/backup" component={BackupPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/simple" component={SimpleLogin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AlertDialog />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
