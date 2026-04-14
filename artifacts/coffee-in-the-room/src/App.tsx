import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@workspace/replit-auth-web";

import Login from "./pages/Login";
import ClientPortal from "./pages/ClientPortal";
import Products from "./pages/Products";
import Clients from "./pages/Clients";
import Sales from "./pages/Sales";
import Admin from "./pages/Admin";
import ServiceOrders from "./pages/ServiceOrders";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient();

function AuthenticatedRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/portal" component={ClientPortal} />
        <Route>{() => <Redirect to="/login" />}</Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/login">{() => <Redirect to="/products" />}</Route>
      <Route path="/portal" component={ClientPortal} />
      <Route path="/products" component={Products} />
      <Route path="/clients" component={Clients} />
      <Route path="/sales" component={Sales} />
      <Route path="/admin" component={Admin} />
      <Route path="/orders" component={ServiceOrders} />
      <Route path="/">{() => <Redirect to="/products" />}</Route>
      <Route path="/dashboard">{() => <Redirect to="/products" />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthenticatedRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
