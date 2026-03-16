import { pgTable, serial, text, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const clientsTable = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  cpf: text("cpf").notNull(),
  phone: text("phone").notNull(),
  birthday: text("birthday"),
  code: integer("code").notNull(),
  totalPurchases: numeric("total_purchases", { precision: 10, scale: 2 }).notNull().default("0"),
  totalPaid: numeric("total_paid", { precision: 10, scale: 2 }).notNull().default("0"),
  balance: numeric("balance", { precision: 10, scale: 2 }).notNull().default("0"),
});

export const insertClientSchema = createInsertSchema(clientsTable).omit({ id: true });
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clientsTable.$inferSelect;
