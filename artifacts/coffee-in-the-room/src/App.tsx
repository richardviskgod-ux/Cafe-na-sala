import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Login from "./pages/Login";
import Products from "./pages/Products";
import Clients from "./pages/Clients";
import Sales from "./pages/Sales";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/products" component={Products} />
      <Route path="/clients" component={Clients} />
      <Route path="/sales" component={Sales} />
      <Route path="/">
        {() => {
          const isAuth = localStorage.getItem("auth") === "true";
          return isAuth ? <Redirect to="/products" /> : <Redirect to="/login" />;
        }}
      </Route>
      <Route path="/dashboard">
        <Redirect to="/products" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
