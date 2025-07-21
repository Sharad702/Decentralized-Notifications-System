// alert.routes.ts
import { Router } from 'express';
import * as alertController from '../controllers/alert.controller';

const router = Router();

router.get('/', alertController.getAllAlerts);
router.get('/:id', alertController.getAlert);
router.post('/', alertController.createAlert);
router.put('/:id', alertController.updateAlert);
router.delete('/:id', alertController.deleteAlert);

export default router; 