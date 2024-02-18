import express from 'express';

import MainRouter from './main';
import TradeitRouter from './tradeit';

const router = express.Router();

router.use('/inventory', MainRouter);
router.use('/tradeit', TradeitRouter);

export default router;
