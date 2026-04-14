import { useState } from "react";
import { Plus, Wrench, Trash2, ChevronDown, Smartphone, AlertCircle, Clock } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { useListClients } from "@workspace/api-client-react";
import {
  useOrders,
  useCreateOrder,
  useUpdateOrderStatus,
  useDeleteOrder,
  type OrderStatus,
} from "@/hooks/useServiceOrders";

const STATUS_OPTIONS: OrderStatus[] = ["pendente", "em andamento", "concluído", "cancelado"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pendente: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "em andamento": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  concluído: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelado: "bg-destructive/20 text-destructive border-destructive/30",
};

const EMPTY_FORM = {
  clientId: "",
  device: "",
  problem: "",
  service: "",
  price: "",
};

export default function ServiceOrders() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "todas">("todas");

  const { toast } = useToast();
  const { data: orders, isLoading } = useOrders();
  const { data: clients } = useListClients();
  const createOrder = useCreateOrder();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId) {
      toast({ title: "Selecione um cliente.", variant: "destructive" });
      return;
    }
    createOrder.mutate(
      {
        clientId: parseInt(form.clientId),
        device: form.device,
        problem: form.problem,
        service: form.service,
        price: parseFloat(form.price),
      },
      {
        onSuccess: () => {
          setForm(EMPTY_FORM);
          setIsOpen(false);
          toast({ title: "Ordem criada com sucesso!" });
        },
        onError: (err) => {
          toast({ title: (err as Error).message, variant: "destructive" });
        },
      }
    );
  };

  const filtered =
    statusFilter === "todas"
      ? orders
      : orders?.filter((o) => o.status === statusFilter);

  const getClientName = (clientId: number) =>
    clients?.find((c) => c.id === clientId)?.name ?? `Cliente #${clientId}`;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
            <Wrench className="w-8 h-8 text-primary" />
            Ordens de Serviço
          </h1>
          <p className="text-muted-foreground">Gerencie consertos e assistências</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Nova Ordem
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["todas", ...STATUS_OPTIONS] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all capitalize ${
              statusFilter === s
                ? "bg-primary/20 border-primary text-primary"
                : "bg-black/20 border-white/10 text-muted-foreground hover:bg-white/5"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-28 bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered?.map((order) => (
            <Card
              key={order.id}
              className="bg-black/20 border-white/5 hover:border-primary/20 transition-colors"
            >
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${
                          STATUS_STYLES[order.status as OrderStatus]
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        #{order.id} · {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-bold text-white text-lg">{order.device}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-sm">
                      <p className="text-muted-foreground">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        <span className="text-white/70">{order.problem}</span>
                      </p>
                      <p className="text-muted-foreground">
                        <Wrench className="w-3 h-3 inline mr-1" />
                        <span className="text-white/70">{order.service}</span>
                      </p>
                      <p className="text-muted-foreground">
                        Cliente:{" "}
                        <span className="text-white/70">{getClientName(order.clientId)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(parseFloat(order.price))}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Status selector */}
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatus.mutate({
                              id: order.id,
                              status: e.target.value as OrderStatus,
                            })
                          }
                          className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-white/10 bg-black/30 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="bg-[#2b0a3d] capitalize">
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm(`Excluir ordem #${order.id}?`)) {
                            deleteOrder.mutate(order.id, {
                              onSuccess: () => toast({ title: "Ordem removida." }),
                            });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered?.length === 0 && (
            <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl">
              <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">Nenhuma ordem encontrada.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Order Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent onClose={() => setIsOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Nova Ordem de Serviço
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Cliente</label>
              <select
                required
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary appearance-none"
              >
                <option value="" disabled className="bg-[#2b0a3d]">
                  Selecione um cliente
                </option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#2b0a3d]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Dispositivo</label>
              <Input
                required
                placeholder="Ex: iPhone 13, Samsung Galaxy..."
                value={form.device}
                onChange={(e) => setForm({ ...form, device: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Problema</label>
              <Input
                required
                placeholder="Ex: Tela quebrada, não liga..."
                value={form.problem}
                onChange={(e) => setForm({ ...form, problem: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Serviço a Realizar</label>
              <Input
                required
                placeholder="Ex: Troca de tela, limpeza..."
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Valor (R$)</label>
              <Input
                required
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full h-12 mt-2" disabled={createOrder.isPending}>
              {createOrder.isPending ? "Criando..." : "Criar Ordem"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
