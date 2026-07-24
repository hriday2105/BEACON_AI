import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scanRouter from "./scan";
import mapRouter from "./map";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/scan", scanRouter);
router.use("/map", mapRouter);
router.use("/stats", statsRouter);

export default router;
