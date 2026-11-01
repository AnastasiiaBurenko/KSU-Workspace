import { Router } from 'express';
import { recordController } from '../controllers/recordController.js';

const router = Router();
router.get('/', recordController.getRecords);
router.get('/:id', recordController.getRecordById);
router.post('/', recordController.createRecord);
router.put('/:id', recordController.updateRecord);
router.delete('/:id', recordController.deleteRecord);

export default router;