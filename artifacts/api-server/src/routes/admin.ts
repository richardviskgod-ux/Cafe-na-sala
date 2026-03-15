import { Router, type IRouter } from "express";
import { db, clientsTable, productsTable, salesTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/admin/reset", async (_req, res) => {
  await db.delete(salesTable);
  await db.delete(clientsTable);
  await db.delete(productsTable);
  res.json({ success: true });
});

export default router;
