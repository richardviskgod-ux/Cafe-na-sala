import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Coffee, Users, ShoppingBag, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Produtos", href: "/products", icon: Coffee },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Vendas", href: "/sales", icon: ShoppingBag },
  { name: "Admin", href: "/admin", icon: Shield },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (localStorage.getItem("auth") !== "true") {
      setLocation("/login");
    }
  }, [location, setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar Desktop / Topbar Mobile */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-black/20 backdrop-blur-xl p-4 flex flex-col z-20">
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Coffee className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-xl hidden md:block">
            Coffee Room
          </span>
        </div>

        <nav className="flex md:flex-col gap-2 flex-1 overflow-x-auto md:overflow-visible no-scrollbar">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap",
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/30 shadow-inner"
                      : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "")} />
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto hidden md:flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative z-10">
        {/* Background Decorative */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
