import { Router, type IRouter } from "express";
import { db, clientsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/portal/client/:code", async (req, res) => {
  const code = parseInt(req.params.code);
  if (isNaN(code)) {
    res.status(400).json({ error: "Código inválido" });
    return;
  }

  const [client] = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.code, code));

  if (!client) {
    res.status(404).json({ error: "Código não encontrado" });
    return;
  }

  res.json({
    id: client.id,
    name: client.name,
    cpf: client.cpf,
    birthday: client.birthday ?? null,
    code: client.code,
    totalPurchases: parseFloat(client.totalPurchases),
    totalPaid: parseFloat(client.totalPaid),
    balance: parseFloat(client.balance),
  });
});

export default router;
