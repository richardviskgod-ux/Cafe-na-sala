import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import {
  CreateProductBody,
  DeleteProductParams,
  QuickSellProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const products = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.userId, req.user.id))
    .orderBy(productsTable.id);
  res.json(products.map((p) => ({ id: p.id, name: p.name, price: parseFloat(p.price), stock: p.stock })));
});

router.post("/products", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const body = CreateProductBody.parse(req.body);
  const [product] = await db
    .insert(productsTable)
    .values({ userId: req.user.id, name: body.name, price: String(body.price), stock: body.stock })
    .returning();
  res.status(201).json({ id: product.id, name: product.name, price: parseFloat(product.price), stock: product.stock });
});

router.delete("/products/:id", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const { id } = DeleteProductParams.parse({ id: parseInt(req.params.id) });
  await db.delete(productsTable).where(and(eq(productsTable.id, id), eq(productsTable.userId, req.user.id)));
  res.json({ success: true });
});

router.post("/products/:id/sell", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const { id } = QuickSellProductParams.parse({ id: parseInt(req.params.id) });
  const [product] = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.id, id), eq(productsTable.userId, req.user.id)));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  if (product.stock <= 0) { res.status(400).json({ error: "Produto sem estoque" }); return; }
  const [updated] = await db
    .update(productsTable)
    .set({ stock: product.stock - 1 })
    .where(and(eq(productsTable.id, id), eq(productsTable.userId, req.user.id)))
    .returning();
  res.json({ id: updated.id, name: updated.name, price: parseFloat(updated.price), stock: updated.stock });
});

export default router;
