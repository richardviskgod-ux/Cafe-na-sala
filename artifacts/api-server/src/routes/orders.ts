import { Router } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/orders", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { clientId, device, problem, service, price } = req.body;

  const [order] = await db.insert(ordersTable).values({
    userId: req.user.id,
    clientId,
    device,
    problem,
    service,
    price: String(price),
  }).returning();

  res.status(201).json(order);
});

router.get("/orders", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.userId, req.user.id))
    .orderBy(ordersTable.id);

  res.json(orders);
});

router.patch("/orders/:id/status", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseInt(req.params.id);
  const { status } = req.body;

  const [updated] = await db
    .update(ordersTable)
    .set({ status })
    .where(eq(ordersTable.id, id))
    .returning();

  res.json(updated);
});

router.delete("/orders/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const id = parseInt(req.params.id);
  await db.delete(ordersTable).where(eq(ordersTable.id, id));
  res.json({ success: true });
});

export default router;
