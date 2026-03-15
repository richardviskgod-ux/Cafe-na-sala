import { Router, type IRouter } from "express";
import { db, salesTable } from "@workspace/db";
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
      date: s.date.toLocaleDateString("pt-BR"),
    }))
  );
});

router.post("/sales", async (req, res) => {
  const body = CreateSaleBody.parse(req.body);
  const [sale] = await db
    .insert(salesTable)
    .values({
      clientName: body.clientName,
      productName: body.productName,
      paymentMethod: body.paymentMethod,
    })
    .returning();
  res.status(201).json({
    id: sale.id,
    clientName: sale.clientName,
    productName: sale.productName,
    paymentMethod: sale.paymentMethod,
    date: sale.date.toLocaleDateString("pt-BR"),
  });
});

export default router;
