import { useState } from "react";

type Order = {
  client: string;
  device: string;
  problem: string;
  price: number;
  status: string;
};

export default function ServiceOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<Order>({
    client: "",
    device: "",
    problem: "",
    price: 0,
    status: "Em análise",
  });

  function addOrder() {
    setOrders([...orders, form]);
    setForm({
      client: "",
      device: "",
      problem: "",
      price: 0,
      status: "Em análise",
    });
  }

  function updateStatus(index: number, status: string) {
    const newOrders = [...orders];
    newOrders[index].status = status;
    setOrders(newOrders);
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Ordens de Serviço</h1>

      <div className="grid gap-2 mb-4">
        <input placeholder="Cliente" value={form.client}
          onChange={(e) => setForm({ ...form, client: e.target.value })} />

        <input placeholder="Aparelho" value={form.device}
          onChange={(e) => setForm({ ...form, device: e.target.value })} />

        <input placeholder="Problema" value={form.problem}
          onChange={(e) => setForm({ ...form, problem: e.target.value })} />

        <input type="number" placeholder="Valor"
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />

        <button onClick={addOrder} className="bg-green-500 text-white p-2">
          Criar OS
        </button>
      </div>

      {orders.map((o, i) => (
        <div key={i} className="border p-2 mb-2">
          <p><b>{o.client}</b> - {o.device}</p>
          <p>{o.problem}</p>
          <p>R$ {o.price}</p>
          <p>Status: {o.status}</p>

          <select onChange={(e) => updateStatus(i, e.target.value)}>
            <option>Em análise</option>
            <option>Em manutenção</option>
            <option>Pronto</option>
          </select>
        </div>
      ))}
    </div>
  );
}
