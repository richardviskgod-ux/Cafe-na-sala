import { useState } from "react";
import { ShoppingBag, CreditCard, Banknote, QrCode, Hash } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "./DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import {
  useListSales,
  useCreateSale,
  useListProducts,
  useListClients,
  getListSalesQueryKey,
  getListProductsQueryKey,
} from "@workspace/api-client-react";

export default function Sales() {
  const [formData, setFormData] = useState({
    clientName: "",
    productName: "",
    paymentMethod: "Dinheiro",
    quantity: 1,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sales, isLoading: loadingSales } = useListSales();
  const { data: products } = useListProducts();
  const { data: clients } = useListClients();

  const createSale = useCreateSale({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        setFormData({ clientName: "", productName: "", paymentMethod: "Dinheiro", quantity: 1 });
        toast({ title: "Venda registrada com sucesso!" });
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
        toast({ title: msg ?? "Erro ao registrar venda.", variant: "destructive" });
      },
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createSale.mutate({ data: formData });
  };

  const selectedProduct = products?.find((p) => p.name === formData.productName);

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "Pix":
        return <QrCode className="w-4 h-4 text-emerald-400" />;
      case "Cartão":
        return <CreditCard className="w-4 h-4 text-blue-400" />;
      default:
        return <Banknote className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-white mb-2">PDV & Vendas</h1>
        <p className="text-muted-foreground">Ponto de venda e histórico</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Nova Venda Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8 border-primary/30 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
            <div className="bg-gradient-to-r from-primary to-accent p-6 rounded-t-2xl">
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Registrar Venda
              </h2>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleCreate} className="space-y-5">
                {/* Cliente */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Cliente</label>
                  <select
                    required
                    className="flex h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-foreground shadow-inner backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary appearance-none"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  >
                    <option value="" disabled className="bg-[#2b0a3d]">
                      Selecione um cliente
                    </option>
                    <option value="Avulso" className="bg-[#2b0a3d] font-bold">
                      Cliente Avulso
                    </option>
                    {clients?.map((c) => (
                      <option key={c.id} value={c.name} className="bg-[#2b0a3d]">
                        {c.name} — {c.cpf}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Produto */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Produto</label>
                  <select
                    required
                    className="flex h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-foreground shadow-inner backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary appearance-none"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  >
                    <option value="" disabled className="bg-[#2b0a3d]">
                      Selecione um produto
                    </option>
                    {products
                      ?.filter((p) => p.stock > 0)
                      .map((p) => (
                        <option key={p.id} value={p.name} className="bg-[#2b0a3d]">
                          {p.name} (R$ {p.price.toFixed(2)}) — estoque: {p.stock}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Quantidade */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Quantidade
                    {selectedProduct && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        máx: {selectedProduct.stock}
                      </span>
                    )}
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={selectedProduct?.stock ?? 999}
                    required
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })
                    }
                    className="text-center text-xl font-bold h-12"
                  />
                  {/* Subtotal preview */}
                  {selectedProduct && (
                    <p className="text-right text-sm text-primary font-semibold">
                      Subtotal: R$ {(selectedProduct.price * formData.quantity).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Forma de pagamento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Forma de Pagamento</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Dinheiro", "Pix", "Cartão"].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: method })}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                          formData.paymentMethod === method
                            ? "bg-primary/20 border-primary text-white"
                            : "bg-black/20 border-white/10 text-muted-foreground hover:bg-white/5"
                        }`}
                      >
                        <span className="mb-1">{getPaymentIcon(method)}</span>
                        <span className="text-xs font-medium">{method}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-lg mt-4"
                  disabled={createSale.isPending}
                >
                  {createSale.isPending ? "Processando..." : "Finalizar Venda"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Histórico */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-display font-bold text-white mb-4 px-2">
            Histórico Recente
          </h3>

          {loadingSales ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse h-20 bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {sales
                ?.slice()
                .reverse()
                .map((sale) => (
                  <Card
                    key={sale.id}
                    className="bg-black/20 border-white/5 hover:bg-black/40 transition-colors"
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg text-white">
                          {sale.productName}
                          {sale.quantity > 1 && (
                            <span className="ml-2 text-sm text-primary font-normal">
                              ×{sale.quantity}
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-muted-foreground">{sale.clientName}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-white text-base">
                          {formatCurrency(sale.totalValue)}
                        </span>
                        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md text-xs">
                          {getPaymentIcon(sale.paymentMethod)}
                          <span>{sale.paymentMethod}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{sale.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {sales?.length === 0 && (
                <div className="py-12 text-center text-muted-foreground border border-dashed border-white/10 rounded-2xl">
                  Nenhuma venda registrada ainda.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
