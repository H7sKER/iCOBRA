import { Router, type IRouter } from "express";
import healthRouter from "./health";
import executeRouter from "./execute";
import gitRouter from "./git";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(executeRouter);
router.use(gitRouter);
router.use(aiRouter);

export default router;
