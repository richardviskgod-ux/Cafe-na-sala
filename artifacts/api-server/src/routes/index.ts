import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import clientsRouter from "./clients";
import salesRouter from "./sales";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(clientsRouter);
router.use(salesRouter);
router.use(adminRouter);

export default router;
