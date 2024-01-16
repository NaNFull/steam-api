import express from 'express';

import SteamController from '../controllers/steam';

const router = express.Router();
const controller = new SteamController();

router.post('/data', controller.postData);
router.get('/data', controller.getData);

export default router;
