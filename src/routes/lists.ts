import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createList,
  getUserLists,
  getListById,
  updateList,
  deleteList,
} from '../controllers/listsController';

const router = Router();

router.use(authenticate); // All routes require authentication

router.post('/', createList);
router.get('/', getUserLists);
router.get('/:id', getListById);
router.put('/:id', updateList);
router.delete('/:id', deleteList);

export default router;
