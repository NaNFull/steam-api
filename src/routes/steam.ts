import express from 'express';

import SteamController from '../controllers/steam';

const router = express.Router();
const controller = new SteamController();

router.get('/data', controller.getData);
router.post('/data', controller.postData);
router.get('/filters', controller.getFilters);

export default router;
