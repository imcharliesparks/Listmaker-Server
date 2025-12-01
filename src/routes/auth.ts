import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { syncUser, getCurrentUser } from '../controllers/authController';

const router = Router();

router.post('/sync', authenticate, syncUser);
router.get('/me', authenticate, getCurrentUser);

export default router;
