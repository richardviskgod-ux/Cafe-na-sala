import { useState } from "react";
import { Plus, User, Trash2, Pencil, ArrowUpCircle, ArrowDownCircle, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "./DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, maskCPF, maskPhone } from "@/lib/utils";
import {
  useListClients,
  useCreateClient,
  useDeleteClient,
  useRegisterPurchase,
  useRegisterPayment,
  getListClientsQueryKey,
} from "@workspace/api-client-react";

export default function Clients() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    phone: "",
    birthday: "",
    initialPurchase: "",
  });

  // Transaction Modal State
  const [transactionType, setTransactionType] = useState<"purchase" | "payment" | null>(null);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [amount, setAmount] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients, isLoading } = useListClients();

  const createClient = useCreateClient({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
        setIsAddOpen(false);
        setFormData({ name: "", cpf: "", phone: "", birthday: "", initialPurchase: "" });
        // 200 = existing client updated, 201 = new client
        const msg =
          (data as { id: number }).id
            ? "Cliente salvo com sucesso!"
            : "Cliente cadastrado!";
        toast({ title: msg });
      },
    },
  });

  const deleteClient = useDeleteClient({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
        toast({ title: "Cliente removido!" });
      },
    },
  });

  const registerPurchase = useRegisterPurchase({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
        closeTransactionModal();
        toast({ title: "Compra registrada!" });
      },
    },
  });

  const registerPayment = useRegisterPayment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListClientsQueryKey() });
        closeTransactionModal();
        toast({ title: "Pagamento registrado!" });
      },
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createClient.mutate({
      data: {
        name: formData.name,
        cpf: formData.cpf,
        phone: formData.phone,
        birthday: formData.birthday || null,
        initialPurchase: formData.initialPurchase ? parseFloat(formData.initialPurchase) : null,
      },
    });
  };

  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !amount) return;

    const val = parseFloat(amount);
    if (transactionType === "purchase") {
      registerPurchase.mutate({ id: selectedClient, data: { amount: val } });
    } else {
      registerPayment.mutate({ id: selectedClient, data: { amount: val } });
    }
  };

  const closeTransactionModal = () => {
    setTransactionType(null);
    setSelectedClient(null);
    setAmount("");
  };

  const filteredClients = clients?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) || c.cpf.includes(search)
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Clientes</h1>
          <p className="text-muted-foreground">Fidelidade e controle de contas</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Adicionar / Atualizar</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse h-64 bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredClients?.map((client) => (
            <Card
              key={client.id}
              className="group hover:border-primary/30 transition-all duration-300"
            >
              <CardHeader className="pb-4 border-b border-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-1">{client.name}</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">{maskCPF(client.cpf)}</p>
                    {client.phone && (
                      <p className="text-xs text-muted-foreground mt-0.5">{maskPhone(client.phone)}</p>
                    )}
                  </div>
                  <div className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-sm font-bold border border-primary/20">
                    Cód: {client.code}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Total Comprado</p>
                    <p className="font-bold text-white">{formatCurrency(client.totalPurchases)}</p>
                  </div>
                  <div
                    className={
                      client.balance > 0
                        ? "bg-destructive/10 rounded-xl p-3 border border-destructive/20"
                        : "bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20"
                    }
                  >
                    <p className="text-xs text-muted-foreground mb-1">Saldo Devedor</p>
                    <p
                      className={`font-bold ${
                        client.balance > 0 ? "text-destructive" : "text-emerald-400"
                      }`}
                    >
                      {formatCurrency(client.balance)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 hover:bg-destructive/20 hover:text-destructive hover:border-destructive/50"
                    onClick={() => {
                      setSelectedClient(client.id);
                      setTransactionType("purchase");
                    }}
                  >
                    <ArrowDownCircle className="w-4 h-4 mr-2" />
                    Fiar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/50"
                    onClick={() => {
                      setSelectedClient(client.id);
                      setTransactionType("payment");
                    }}
                  >
                    <ArrowUpCircle className="w-4 h-4 mr-2" />
                    Pagar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title="Editar cliente"
                    onClick={() => {
                      setFormData({
                        name: client.name,
                        cpf: client.cpf,
                        phone: client.phone ?? "",
                        birthday: client.birthday ?? "",
                        initialPurchase: "",
                      });
                      setIsAddOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Excluir cliente"
                    onClick={() => {
                      if (confirm(`Excluir cliente ${client.name}? O histórico será perdido.`)) {
                        deleteClient.mutate({ id: client.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredClients?.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Nenhum cliente encontrado.
            </div>
          )}
        </div>
      )}

      {/* Add / Update Client Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent onClose={() => setIsAddOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              <User className="w-5 h-5 inline mr-2 text-primary" />
              Adicionar / Atualizar Cliente
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-2">
            Se o CPF já existir, o cadastro será atualizado.
          </p>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Nome Completo</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">CPF</label>
              <Input
                required
                value={maskCPF(formData.cpf)}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value.replace(/\D/g, "") })}
                maxLength={14}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Telefone</label>
              <Input
                required
                value={maskPhone(formData.phone)}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                maxLength={15}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                Data de Aniversário <span className="text-muted-foreground">(opcional)</span>
              </label>
              <Input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                Valor da Compra <span className="text-muted-foreground">(opcional)</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="R$ 0,00"
                value={formData.initialPurchase}
                onChange={(e) => setFormData({ ...formData, initialPurchase: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Será adicionado ao saldo devedor do cliente.
              </p>
            </div>
            <Button type="submit" className="w-full mt-6" disabled={createClient.isPending}>
              {createClient.isPending ? "Salvando..." : "Salvar Cliente"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transaction Modal */}
      <Dialog
        open={transactionType !== null}
        onOpenChange={(open) => !open && closeTransactionModal()}
      >
        <DialogContent onClose={closeTransactionModal}>
          <DialogHeader>
            <DialogTitle
              className={
                transactionType === "purchase" ? "text-destructive" : "text-emerald-400"
              }
            >
              {transactionType === "purchase"
                ? "Registrar Nova Compra (Fiado)"
                : "Registrar Pagamento"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransaction} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Valor (R$)</label>
              <Input
                required
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-2xl h-14"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className={`w-full mt-6 h-14 text-lg ${
                transactionType === "purchase"
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
              disabled={registerPurchase.isPending || registerPayment.isPending}
            >
              Confirmar
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
