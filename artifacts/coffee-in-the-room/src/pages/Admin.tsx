import { useState } from "react";
import { Shield, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "systemCode";
const DEFAULT_CODE = "1234";

export function getSystemCode(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CODE;
}

export default function Admin() {
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changed, setChanged] = useState(false);

  const { toast } = useToast();

  const handleChangeCode = (e: React.FormEvent) => {
    e.preventDefault();

    const stored = getSystemCode();
    if (currentCode !== stored) {
      toast({ title: "Código atual incorreto.", variant: "destructive" });
      return;
    }
    if (newCode.length < 4) {
      toast({ title: "O novo código deve ter pelo menos 4 caracteres.", variant: "destructive" });
      return;
    }
    if (newCode !== confirmCode) {
      toast({ title: "Os novos códigos não coincidem.", variant: "destructive" });
      return;
    }

    localStorage.setItem(STORAGE_KEY, newCode);
    setChanged(true);
    setCurrentCode("");
    setNewCode("");
    setConfirmCode("");
    toast({ title: "Código alterado com sucesso!" });
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          Administração
        </h1>
        <p className="text-muted-foreground">Configurações e segurança do sistema</p>
      </div>

      <div className="max-w-md">
        <Card className="border-primary/30 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
          <div className="bg-gradient-to-r from-primary to-accent p-6 rounded-t-2xl">
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Mudar Código de Acesso
            </h2>
            <p className="text-sm text-white/70 mt-1">
              O código atual é usado na tela de login
            </p>
          </div>
          <CardContent className="p-6">
            {changed && (
              <div className="mb-6 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-4">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">Código alterado! Use o novo código no próximo login.</span>
              </div>
            )}

            <form onSubmit={handleChangeCode} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Código Atual</label>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    required
                    value={currentCode}
                    onChange={(e) => setCurrentCode(e.target.value)}
                    placeholder="Digite o código atual"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Novo Código</label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    required
                    minLength={4}
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Confirmar Novo Código</label>
                <Input
                  type="password"
                  required
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  placeholder="Repita o novo código"
                />
              </div>

              <Button type="submit" className="w-full h-12 mt-2">
                Salvar Novo Código
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-4 px-4">
          O código padrão é <span className="font-mono text-primary">1234</span>. Guarde o novo código em local seguro — não é possível recuperá-lo sem o código atual.
        </p>
      </div>
    </DashboardLayout>
  );
}
