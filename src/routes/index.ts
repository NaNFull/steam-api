import express from "express";
import TradeitRouter from "./tradeit";
import PingController from "../controllers/ping";

const router = express.Router();

// Пинг роутера
router.get("/ping", async (_req, res) => {
  const controller = new PingController();
  const response = await controller.getMessage();
  return res.send(response);
});

router.use('/Tradeit', TradeitRouter);

export default router;
