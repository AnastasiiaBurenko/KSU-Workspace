import { Router } from 'express';
import { recordController } from '../controllers/recordController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.get('/', recordController.getRecords);
router.get('/:id', recordController.getRecordById);
router.post('/', requireAuth, recordController.createRecord);
router.put('/:id', requireAuth, recordController.updateRecord);
router.delete('/:id', requireAuth, recordController.deleteRecord);

export default router;