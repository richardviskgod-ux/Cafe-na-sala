import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type OrderStatus = "pendente" | "em andamento" | "concluído" | "cancelado";

export interface Order {
  id: number;
  userId: string;
  clientId: number;
  device: string;
  problem: string;
  service: string;
  price: string;
  status: OrderStatus;
  createdAt: string;
}

export interface CreateOrderInput {
  clientId: number;
  device: string;
  problem: string;
  service: string;
  price: number;
}

const QUERY_KEY = ["/api/orders"];

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? `Erro ${res.status}`);
  }
  return res.json();
}

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch("/api/orders"),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderInput) =>
      apiFetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      apiFetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/orders/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
