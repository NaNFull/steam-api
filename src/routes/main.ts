import express from 'express';

import MainController from '../controllers/main';

const router = express.Router();
const controller = new MainController();

router.get('/data', controller.getData);
router.post('/data', controller.postData);
router.get('/filters', controller.getFilters);

export default router;
