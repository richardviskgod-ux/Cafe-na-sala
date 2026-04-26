import { useState } from "react";
import { ShoppingBag, CreditCard, Banknote, QrCode, Hash, Trash2 } from "lucide-react";
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
  useDeleteSale,
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
    installments: 1,
  });

  const [filtroData, setFiltroData] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sales, isLoading: loadingSales } = useListSales();
  const { data: products } = useListProducts();
  const { data: clients } = useListClients();

  const selectedProduct = products?.find((p) => p.name === formData.productName);

  const createSale = useCreateSale({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });

        // 💰 financeiro automático
        const movimentos = JSON.parse(localStorage.getItem("financeiro") || "[]");
        movimentos.push({
          tipo: "entrada",
          valor: selectedProduct ? selectedProduct.price * formData.quantity : 0,
          descricao: "Venda",
          data: new Date().toISOString()
        });
        localStorage.setItem("financeiro", JSON.stringify(movimentos));

        setFormData({
          clientName: "",
          productName: "",
          paymentMethod: "Dinheiro",
          quantity: 1,
          installments: 1
        });

        toast({ title: "Venda registrada com sucesso!" });
      },
      onError: () => {
        toast({ title: "Erro ao registrar venda.", variant: "destructive" });
      },
    },
  });

  const deleteSale = useDeleteSale({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
        toast({ title: "Venda removida!" });
      },
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createSale.mutate({ data: formData });
  };

  const getPaymentIcon = (method) => {
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
        <h1 className="text-4xl font-bold text-white mb-2">PDV & Vendas</h1>
        <p className="text-muted-foreground">Ponto de venda e histórico</p>

        {/* 📊 RESUMO */}
        <div className="mt-4 flex gap-4 flex-wrap">
          <div className="bg-black/30 p-4 rounded-xl border border-white/10">
            <p className="text-sm text-muted-foreground">Total vendido</p>
            <p className="text-xl font-bold text-green-400">
              {formatCurrency(sales?.reduce((acc, s) => acc + s.totalValue, 0) || 0)}
            </p>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/10">
            <p className="text-sm text-muted-foreground">Qtd de vendas</p>
            <p className="text-xl font-bold text-blue-400">
              {sales?.length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* FORM */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleCreate} className="space-y-4">

                <Input placeholder="Cliente" value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} />

                <Input placeholder="Produto" value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })} />

                <Input type="number" value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} />

                <Button type="submit">Finalizar Venda</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* HISTÓRICO */}
        <div className="lg:col-span-2">

          <h3 className="text-xl font-bold text-white mb-4">Histórico</h3>

          {/* 📅 filtro */}
          <input
            type="date"
            className="mb-4 p-2 rounded bg-black/30 border border-white/10 text-white"
            onChange={(e) => setFiltroData(e.target.value)}
          />

          {loadingSales ? "Carregando..." : (
            sales
              ?.filter((sale) =>
                filtroData ? sale.date.startsWith(filtroData) : true
              )
              .map((sale) => (
                <Card key={sale.id} className="mb-3">
                  <CardContent className="flex justify-between items-center p-4">

                    <div>
                      <p className="text-white">{sale.productName}</p>
                      <p className="text-sm text-muted-foreground">{sale.clientName}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-white">{formatCurrency(sale.totalValue)}</p>
                      <p className="text-xs">{sale.date}</p>
                    </div>

                    {/* 🧾 botão pdf */}
                    <Button onClick={() => window.print()}>
                      PDF
                    </Button>

                    <Button onClick={() => deleteSale.mutate({ id: sale.id })}>
                      <Trash2 />
                    </Button>

                  </CardContent>
                </Card>
              ))
          )}

        </div>
      </div>
    </DashboardLayout>
  );
         }
