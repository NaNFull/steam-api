import express from "express";
import BaseRouter from "./base";
import TradeitRouter from "./tradeit";

const router = express.Router();

router.use('/inventory', BaseRouter)
router.use('/tradeit', TradeitRouter);

export default router;
