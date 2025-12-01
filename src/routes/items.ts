import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  addItem,
  getListItems,
  deleteItem,
} from '../controllers/itemsController';

const router = Router();

router.use(authenticate); // All routes require authentication

router.post('/', addItem);
router.get('/list/:listId', getListItems);
router.delete('/:id', deleteItem);

export default router;
