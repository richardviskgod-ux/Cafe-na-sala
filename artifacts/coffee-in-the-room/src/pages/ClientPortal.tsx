import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CoffeeScene } from "@/components/CoffeeScene";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useGetClientByCode } from "@workspace/api-client-react";
import { User, ShoppingBag, Wallet, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ClientPortal() {
  const [inputCode, setInputCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState<number | null>(null);
  const [error, setError] = useState("");

  const { data: client, isLoading, isError } = useGetClientByCode(
    submittedCode ?? 0,
    { query: { enabled: submittedCode !== null } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = parseInt(inputCode);
    if (isNaN(code) || inputCode.trim() === "") {
      setError("Por favor, insira um código válido.");
      return;
    }
    setError("");
    setSubmittedCode(code);
  };

  const handleBack = () => {
    setSubmittedCode(null);
    setInputCode("");
    setError("");
  };

  const balance = client ? client.balance : 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
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

          <AnimatePresence mode="wait">
            {!client ? (
              <motion.div
                key="login"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-display font-bold text-white mb-2">
                    Área do Cliente
                  </h1>
                  <p className="text-white/60 text-sm">
                    Digite seu código de acesso
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Código do cliente"
                    value={inputCode}
                    onChange={(e) => { setInputCode(e.target.value); setError(""); }}
                    className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                    maxLength={4}
                    autoFocus
                  />
                  {(error || (isError && submittedCode !== null)) && (
                    <p className="text-destructive text-sm text-center">
                      {error || "Código não encontrado. Tente novamente."}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-12 text-base rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? "Buscando..." : "Entrar"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link href="/login">
                    <span className="text-xs text-muted-foreground hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1">
                      <ArrowLeft className="w-3 h-3" /> Área administrativa
                    </span>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white">
                    Olá, {client.name.split(" ")[0]}!
                  </h2>
                  <p className="text-white/50 text-sm">Código #{client.code}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-black/20 border-white/5">
                    <CardContent className="p-4 flex flex-col items-center gap-1">
                      <ShoppingBag className="w-5 h-5 text-primary mb-1" />
                      <p className="text-xs text-muted-foreground">Total Compras</p>
                      <p className="font-bold text-white text-lg">
                        {formatCurrency(client.totalPurchases)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/20 border-white/5">
                    <CardContent className="p-4 flex flex-col items-center gap-1">
                      <Wallet className="w-5 h-5 text-primary mb-1" />
                      <p className="text-xs text-muted-foreground">Total Pago</p>
                      <p className="font-bold text-white text-lg">
                        {formatCurrency(client.totalPaid)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className={`border ${balance > 0 ? "bg-destructive/10 border-destructive/30" : "bg-green-500/10 border-green-500/30"}`}>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Saldo em Aberto</p>
                    <p className={`text-3xl font-bold ${balance > 0 ? "text-destructive" : "text-green-400"}`}>
                      {formatCurrency(balance)}
                    </p>
                    {balance <= 0 && (
                      <p className="text-xs text-green-400/70 mt-1">Tudo em dia! ✓</p>
                    )}
                  </CardContent>
                </Card>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Sair
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
