import express from 'express';
import { register, login, logout, refreshToken, confirmEmail, whoAmI, getUsers } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.post('/refresh-token', refreshToken);
router.get('/whoami', authenticateToken, whoAmI);
router.get('/users', authenticateToken, getUsers);
router.get('/confirm/:token', confirmEmail);

export default router;
