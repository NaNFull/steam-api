import express from "express";
import BaseController from "../controllers/base";

const router = express.Router();
const controller = new BaseController();

router.post("/data", controller.postData);
router.get("/data", controller.getData);

export default router;
