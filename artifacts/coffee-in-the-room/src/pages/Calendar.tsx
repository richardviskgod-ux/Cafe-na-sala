import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { DashboardLayout } from "./DashboardLayout";
import { useListSales } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const { data: sales } = useListSales();

  const filtered = sales?.filter((sale) => {
    const d = new Date(sale.date);
    return d.toDateString() === date.toDateString();
  });

  const total = filtered?.reduce((acc, s) => acc + s.totalValue, 0) || 0;

  return (
    <DashboardLayout>
      <div className="grid md:grid-cols-2 gap-8">
        
        <div>
          <h1 className="text-3xl font-bold mb-4 text-white">
            📅 Calendário de Vendas
          </h1>
          <Calendar onChange={(v) => setDate(v as Date)} value={date} />
        </div>

        <div>
          <h2 className="text-xl text-white mb-2">
            Vendas do dia
          </h2>

          <p className="mb-4 text-primary font-bold">
            Total: {formatCurrency(total)}
          </p>

          <div className="space-y-2">
            {filtered?.map((sale) => (
              <div key={sale.id} className="bg-white/5 p-3 rounded-lg">
                {sale.productName} - {formatCurrency(sale.totalValue)}
              </div>
            ))}

            {filtered?.length === 0 && (
              <p className="text-muted-foreground">
                Nenhuma venda nesse dia
              </p>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
