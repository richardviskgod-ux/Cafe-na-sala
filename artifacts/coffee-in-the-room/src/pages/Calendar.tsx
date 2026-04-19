import { useState } from "react";
import Calendar from "react-calendar";
import { DashboardLayout } from "./DashboardLayout";
import { useListSales } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const { data: sales } = useListSales();

  const filtered = sales?.filter((sale: any) => {
    const raw = sale.rawDate ?? sale.date;
    const d = new Date(raw);
    return (
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
  });

  const total = filtered?.reduce((acc: number, s: any) => acc + s.totalValue, 0) ?? 0;

  const hasSalesOnDay = (d: Date) =>
    sales?.some((sale: any) => {
      const raw = sale.rawDate ?? sale.date;
      const sd = new Date(raw);
      return (
        sd.getFullYear() === d.getFullYear() &&
        sd.getMonth() === d.getMonth() &&
        sd.getDate() === d.getDate()
      );
    });

  return (
    <DashboardLayout>
      <style>{`
        .custom-cal {
          background: transparent;
          border: none;
          width: 100%;
          font-family: inherit;
        }
        .custom-cal .react-calendar__navigation {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          gap: 4px;
        }
        .custom-cal .react-calendar__navigation button {
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.4);
          color: #fff;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          padding: 6px 10px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .custom-cal .react-calendar__navigation button:hover {
          background: rgba(139,92,246,0.35);
        }
        .custom-cal .react-calendar__navigation__label {
          flex: 1;
          font-size: 15px;
        }
        .custom-cal .react-calendar__month-view__weekdays {
          text-align: center;
          margin-bottom: 4px;
        }
        .custom-cal .react-calendar__month-view__weekdays__weekday {
          padding: 4px 0;
        }
        .custom-cal .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
          color: rgba(139,92,246,0.8);
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .custom-cal .react-calendar__tile {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(139,92,246,0.15);
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          padding: 10px 4px;
          margin: 2px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .custom-cal .react-calendar__tile:hover {
          background: rgba(139,92,246,0.25);
          border-color: rgba(139,92,246,0.6);
        }
        .custom-cal .react-calendar__tile--now {
          background: rgba(139,92,246,0.2);
          border-color: rgba(139,92,246,0.5);
        }
        .custom-cal .react-calendar__tile--active,
        .custom-cal .react-calendar__tile--active:hover {
          background: rgba(139,92,246,0.5);
          border-color: #8b5cf6;
          box-shadow: 0 0 0 2px rgba(139,92,246,0.4);
        }
        .custom-cal .react-calendar__month-view__days__day--neighboringMonth abbr {
          color: rgba(255,255,255,0.2);
        }
        .custom-cal .react-calendar__tile.has-sales::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #a78bfa;
        }
      `}</style>

      <h1 className="text-3xl font-bold mb-6 text-white">📅 Calendário de Vendas</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-5">
          <Calendar
            className="custom-cal"
            onChange={(v) => setDate(v as Date)}
            value={date}
            tileClassName={({ date: d, view }) => {
              if (view === "month" && hasSalesOnDay(d)) return "has-sales";
              return null;
            }}
          />
        </div>

        <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white mb-1">
            {date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
          </h2>
          <p className="text-purple-400 font-bold text-xl mb-4">
            Total: {formatCurrency(total)}
          </p>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filtered && filtered.length > 0 ? (
              filtered.map((sale: any) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between bg-white/5 border border-purple-500/20 rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="text-white font-medium text-sm">{sale.productName}</p>
                    <p className="text-gray-400 text-xs">{sale.clientName}</p>
                  </div>
                  <span className="text-purple-300 font-semibold text-sm">
                    {formatCurrency(sale.totalValue)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center mt-8">
                Nenhuma venda registrada nesse dia
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
