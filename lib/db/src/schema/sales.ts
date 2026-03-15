import { pgTable, serial, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const salesTable = pgTable("sales", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  productName: text("product_name").notNull(),
  paymentMethod: text("payment_method").notNull(),
  quantity: integer("quantity").notNull().default(1),
  installments: integer("installments").notNull().default(1),
  totalValue: numeric("total_value", { precision: 10, scale: 2 }).notNull().default("0"),
  installmentValue: numeric("installment_value", { precision: 10, scale: 2 }).notNull().default("0"),
  date: timestamp("date").notNull().defaultNow(),
});

export const insertSaleSchema = createInsertSchema(salesTable).omit({ id: true, date: true });
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof salesTable.$inferSelect;
