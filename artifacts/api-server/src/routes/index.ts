import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import portalRouter from "./portal";
import productsRouter from "./products";
import clientsRouter from "./clients";
import salesRouter from "./sales";
import adminRouter from "./admin";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(portalRouter);
router.use(productsRouter);
router.use(clientsRouter);
router.use(salesRouter);
router.use(adminRouter);
router.use(ordersRouter);

export default router;
