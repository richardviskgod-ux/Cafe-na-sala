import { Router, type IRouter } from "express";
import { db, clientsTable, productsTable, salesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/admin/reset", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  await db.delete(salesTable).where(eq(salesTable.userId, req.user.id));
  await db.delete(clientsTable).where(eq(clientsTable.userId, req.user.id));
  await db.delete(productsTable).where(eq(productsTable.userId, req.user.id));
  res.json({ success: true });
});

export default router;
