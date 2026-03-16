import { Router, type IRouter } from "express";
import { db, clientsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import {
  CreateClientBody,
  DeleteClientParams,
  RegisterPurchaseParams,
  RegisterPurchaseBody,
  RegisterPaymentParams,
  RegisterPaymentBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatClient(c: typeof clientsTable.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    cpf: c.cpf,
    phone: c.phone,
    birthday: c.birthday ?? null,
    code: c.code,
    totalPurchases: parseFloat(c.totalPurchases),
    totalPaid: parseFloat(c.totalPaid),
    balance: parseFloat(c.balance),
  };
}

router.get("/clients", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const clients = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.userId, req.user.id))
    .orderBy(clientsTable.id);
  res.json(clients.map(formatClient));
});

router.post("/clients", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const body = CreateClientBody.parse(req.body);

  const [existing] = await db
    .select()
    .from(clientsTable)
    .where(and(eq(clientsTable.cpf, body.cpf), eq(clientsTable.userId, req.user.id)));

  if (existing) {
    const addAmount = body.initialPurchase ?? 0;
    const newTotal = parseFloat(existing.totalPurchases) + addAmount;
    const newBalance = newTotal - parseFloat(existing.totalPaid);
    const [updated] = await db
      .update(clientsTable)
      .set({ name: body.name, phone: body.phone, birthday: body.birthday ?? null, totalPurchases: String(newTotal), balance: String(newBalance) })
      .where(and(eq(clientsTable.cpf, body.cpf), eq(clientsTable.userId, req.user.id)))
      .returning();
    res.status(200).json(formatClient(updated));
    return;
  }

  const code = Math.floor(1000 + Math.random() * 9000);
  const initialPurchase = body.initialPurchase ?? 0;
  const [client] = await db
    .insert(clientsTable)
    .values({ userId: req.user.id, name: body.name, cpf: body.cpf, phone: body.phone, birthday: body.birthday ?? null, code, totalPurchases: String(initialPurchase), totalPaid: "0", balance: String(initialPurchase) })
    .returning();
  res.status(201).json(formatClient(client));
});

router.delete("/clients/:id", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const { id } = DeleteClientParams.parse({ id: parseInt(req.params.id) });
  await db.delete(clientsTable).where(and(eq(clientsTable.id, id), eq(clientsTable.userId, req.user.id)));
  res.json({ success: true });
});

router.post("/clients/:id/purchase", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const { id } = RegisterPurchaseParams.parse({ id: parseInt(req.params.id) });
  const { amount } = RegisterPurchaseBody.parse(req.body);
  const [client] = await db.select().from(clientsTable).where(and(eq(clientsTable.id, id), eq(clientsTable.userId, req.user.id)));
  if (!client) { res.status(404).json({ error: "Client not found" }); return; }
  const newTotal = parseFloat(client.totalPurchases) + amount;
  const newBalance = newTotal - parseFloat(client.totalPaid);
  const [updated] = await db
    .update(clientsTable)
    .set({ totalPurchases: String(newTotal), balance: String(newBalance) })
    .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, req.user.id)))
    .returning();
  res.json(formatClient(updated));
});

router.post("/clients/:id/payment", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const { id } = RegisterPaymentParams.parse({ id: parseInt(req.params.id) });
  const { amount } = RegisterPaymentBody.parse(req.body);
  const [client] = await db.select().from(clientsTable).where(and(eq(clientsTable.id, id), eq(clientsTable.userId, req.user.id)));
  if (!client) { res.status(404).json({ error: "Client not found" }); return; }
  const newPaid = parseFloat(client.totalPaid) + amount;
  const newBalance = parseFloat(client.totalPurchases) - newPaid;
  const [updated] = await db
    .update(clientsTable)
    .set({ totalPaid: String(newPaid), balance: String(newBalance) })
    .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, req.user.id)))
    .returning();
  res.json(formatClient(updated));
});

export default router;
