import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

const router = Router();

// Middleware to verify JWT token
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const { userId } = authService.verifyToken(token);
    (req as any).userId = userId;
    next();
  } catch (error: any) {
    return res.status(401).json({ success: false, error: error.message });
  }
};

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'email and password are required',
      });
    }

    const result = await authService.register({ email, password, name });

    return res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully',
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'email and password are required',
      });
    }

    const result = await authService.login({ email, password });

    return res.json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: error.message,
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await authService.getUser(userId);

    return res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

// Update user profile
router.patch('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await authService.updateUser(userId, req.body);

    return res.json({
      success: true,
      data: user,
      message: 'Profile updated',
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Change password
router.post('/change-password', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'oldPassword and newPassword are required',
      });
    }

    await authService.changePassword(userId, oldPassword, newPassword);

    return res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Upgrade plan
router.post('/upgrade', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { plan } = req.body;

    if (!plan || !['pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({
        success: false,
        error: 'Valid plan required (pro or enterprise)',
      });
    }

    const result = await authService.upgradePlan(userId, plan);

    return res.json({
      success: true,
      data: result,
      message: `Upgraded to ${plan} plan`,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
export { authenticate };
