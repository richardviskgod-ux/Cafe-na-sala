import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CoffeeScene } from "@/components/CoffeeScene";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useListClients } from "@workspace/api-client-react";
import { getSystemCode } from "./Admin";

export default function Login() {
  const [code, setCode] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: clients } = useListClients();

  useEffect(() => {
    if (localStorage.getItem("auth") === "true") {
      setLocation("/dashboard");
    }
  }, [setLocation]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === getSystemCode()) {
      localStorage.setItem("auth", "true");
      
      // Check birthdays
      if (clients) {
        const today = new Date();
        const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const birthdays = clients.filter(c => {
          if (!c.birthday) return false;
          // assuming birthday is YYYY-MM-DD
          return c.birthday.substring(5) === todayStr;
        });

        if (birthdays.length > 0) {
          toast({
            title: "🎉 Aniversariantes de Hoje!",
            description: birthdays.map(b => b.name).join(", "),
            duration: 10000,
          });
        }
      }
      
      setLocation("/dashboard");
    } else {
      toast({
        title: "Acesso Negado",
        description: "Código incorreto. Tente novamente.",
        variant: "destructive"
      });
      setCode("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('/images/coffee-bg.png')] bg-cover bg-center opacity-40 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/30 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-pulse delay-1000" />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-black/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <CoffeeScene />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-2">
              Bem-vindo ao<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Coffee in the Room
              </span>
            </h1>
            <p className="text-white/60">Insira seu código de acesso para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Código de Acesso"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                maxLength={4}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full h-14 text-lg rounded-xl">
              Entrar
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
