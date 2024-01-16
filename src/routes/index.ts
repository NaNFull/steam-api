import express from 'express';

import SteamRouter from './steam';
import TradeitRouter from './tradeit';

const router = express.Router();

router.use('/inventory', SteamRouter);
router.use('/tradeit', TradeitRouter);

export default router;
