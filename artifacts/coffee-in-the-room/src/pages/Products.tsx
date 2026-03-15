import { useState } from "react";
import { Plus, Package, Trash2, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "./DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { 
  useListProducts, 
  useCreateProduct, 
  useDeleteProduct, 
  useQuickSellProduct,
  getListProductsQueryKey 
} from "@workspace/api-client-react";

export default function Products() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", price: "", stock: "" });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: products, isLoading } = useListProducts();
  
  const createProduct = useCreateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        setIsAddOpen(false);
        setFormData({ name: "", price: "", stock: "" });
        toast({ title: "Produto cadastrado com sucesso!" });
      }
    }
  });

  const deleteProduct = useDeleteProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        toast({ title: "Produto removido!" });
      }
    }
  });

  const quickSell = useQuickSellProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        toast({ title: "Venda rápida registrada!" });
      }
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate({
      data: {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10)
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Produtos</h1>
          <p className="text-muted-foreground">Gerencie o estoque e cardápio</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Novo Produto
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <Card key={i} className="animate-pulse h-48 bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map(product => (
            <Card key={product.id} className="group hover:border-primary/50 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Package className="w-24 h-24 text-primary" />
              </div>
              <CardHeader>
                <CardTitle className="truncate pr-8">{product.name}</CardTitle>
                <div className="text-3xl font-display font-bold text-primary mt-2">
                  {formatCurrency(product.price)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm text-muted-foreground">Estoque disponível</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'}`}>
                    {product.stock} un
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    className="flex-1 bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10"
                    onClick={() => quickSell.mutate({ id: product.id })}
                    disabled={product.stock <= 0 || quickSell.isPending}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Venda Rápida
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => {
                      if(confirm('Tem certeza que deseja excluir?')) {
                        deleteProduct.mutate({ id: product.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {products?.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Nenhum produto cadastrado.
            </div>
          )}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent onClose={() => setIsAddOpen(false)}>
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Nome</label>
              <Input 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Cappuccino Duplo" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Preço (R$)</label>
                <Input 
                  required 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Estoque Inicial</label>
                <Input 
                  required 
                  type="number" 
                  min="0"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: e.target.value})}
                  placeholder="0" 
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full mt-6" 
              disabled={createProduct.isPending}
            >
              {createProduct.isPending ? "Salvando..." : "Salvar Produto"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
