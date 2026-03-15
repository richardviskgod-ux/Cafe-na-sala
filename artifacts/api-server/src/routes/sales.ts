import { Router, type IRouter } from "express";
import { db, salesTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateSaleBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/sales", async (_req, res) => {
  const sales = await db.select().from(salesTable).orderBy(salesTable.id);
  res.json(
    sales.map((s) => ({
      id: s.id,
      clientName: s.clientName,
      productName: s.productName,
      paymentMethod: s.paymentMethod,
      quantity: s.quantity,
      date: s.date.toLocaleDateString("pt-BR"),
    }))
  );
});

router.post("/sales", async (req, res) => {
  const body = CreateSaleBody.parse(req.body);

  // Decrement stock for the product if it exists, using quantity
  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.name, body.productName));

  if (product) {
    if (product.stock < body.quantity) {
      res.status(400).json({ error: "Estoque insuficiente" });
      return;
    }
    await db
      .update(productsTable)
      .set({ stock: product.stock - body.quantity })
      .where(eq(productsTable.name, body.productName));
  }

  const [sale] = await db
    .insert(salesTable)
    .values({
      clientName: body.clientName,
      productName: body.productName,
      paymentMethod: body.paymentMethod,
      quantity: body.quantity,
    })
    .returning();

  res.status(201).json({
    id: sale.id,
    clientName: sale.clientName,
    productName: sale.productName,
    paymentMethod: sale.paymentMethod,
    quantity: sale.quantity,
    date: sale.date.toLocaleDateString("pt-BR"),
  });
});

export default router;
