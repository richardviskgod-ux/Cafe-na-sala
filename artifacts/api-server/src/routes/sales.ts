import { Router, type IRouter } from "express";
import { db, salesTable, productsTable, clientsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { CreateSaleBody } from "@workspace/api-zod";

const router: IRouter = Router();

function formatDate(d: Date) {
  return d.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

router.get("/sales", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const sales = await db
    .select()
    .from(salesTable)
    .where(eq(salesTable.userId, req.user.id))
    .orderBy(salesTable.id);
  res.json(sales.map((s) => ({
    id: s.id,
    clientName: s.clientName,
    productName: s.productName,
    paymentMethod: s.paymentMethod,
    quantity: s.quantity,
    installments: s.installments,
    totalValue: parseFloat(s.totalValue),
    installmentValue: parseFloat(s.installmentValue),
    date: formatDate(s.date),
  })));
});

router.post("/sales", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const body = CreateSaleBody.parse(req.body);
  const installments = Math.max(1, body.installments);
  const uid = req.user.id;

  const [product] = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.name, body.productName), eq(productsTable.userId, uid)));

  if (product) {
    if (product.stock < body.quantity) { res.status(400).json({ error: "Estoque insuficiente" }); return; }
    await db
      .update(productsTable)
      .set({ stock: product.stock - body.quantity })
      .where(and(eq(productsTable.name, body.productName), eq(productsTable.userId, uid)));
  }

  const pricePerUnit = product ? parseFloat(product.price) : 0;
  const totalValue = pricePerUnit * body.quantity;
  const installmentValue = totalValue / installments;

  if (body.clientName !== "Avulso" && body.clientName.trim() !== "") {
    const [client] = await db
      .select()
      .from(clientsTable)
      .where(and(eq(clientsTable.name, body.clientName), eq(clientsTable.userId, uid)));
    if (client) {
      const newTotal = parseFloat(client.totalPurchases) + totalValue;
      const newBalance = newTotal - parseFloat(client.totalPaid);
      await db
        .update(clientsTable)
        .set({ totalPurchases: String(newTotal), balance: String(newBalance) })
        .where(and(eq(clientsTable.id, client.id), eq(clientsTable.userId, uid)));
    }
  }

  const [sale] = await db
    .insert(salesTable)
    .values({
      userId: uid,
      clientName: body.clientName,
      productName: body.productName,
      paymentMethod: body.paymentMethod,
      quantity: body.quantity,
      installments,
      totalValue: String(totalValue),
      installmentValue: String(installmentValue),
    })
    .returning();

  res.status(201).json({
    id: sale.id,
    clientName: sale.clientName,
    productName: sale.productName,
    paymentMethod: sale.paymentMethod,
    quantity: sale.quantity,
    installments: sale.installments,
    totalValue: parseFloat(sale.totalValue),
    installmentValue: parseFloat(sale.installmentValue),
    date: formatDate(sale.date),
  });
});

export default router;
