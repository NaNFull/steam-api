import express from 'express';

import TradeitController from '../controllers/tradeit';

const router = express.Router();
const controller = new TradeitController();

router.get('/data', controller.getData);
router.get('/my-data', controller.getMyData);
router.get('/exchange-rate', controller.getCurrencies);

export default router;
