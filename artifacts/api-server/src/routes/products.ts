import { Router, type IRouter } from "express";
import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateProductBody,
  DeleteProductParams,
  QuickSellProductParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (_req, res) => {
  const products = await db.select().from(productsTable).orderBy(productsTable.id);
  res.json(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      price: parseFloat(p.price),
      stock: p.stock,
    }))
  );
});

router.post("/products", async (req, res) => {
  const body = CreateProductBody.parse(req.body);
  const [product] = await db
    .insert(productsTable)
    .values({ name: body.name, price: String(body.price), stock: body.stock })
    .returning();
  res.status(201).json({
    id: product.id,
    name: product.name,
    price: parseFloat(product.price),
    stock: product.stock,
  });
});

router.delete("/products/:id", async (req, res) => {
  const { id } = DeleteProductParams.parse({ id: parseInt(req.params.id) });
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ success: true });
});

router.post("/products/:id/sell", async (req, res) => {
  const { id } = QuickSellProductParams.parse({ id: parseInt(req.params.id) });
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  if (product.stock <= 0) {
    res.status(400).json({ error: "Produto sem estoque" });
    return;
  }
  const [updated] = await db
    .update(productsTable)
    .set({ stock: product.stock - 1 })
    .where(eq(productsTable.id, id))
    .returning();
  res.json({
    id: updated.id,
    name: updated.name,
    price: parseFloat(updated.price),
    stock: updated.stock,
  });
});

export default router;
