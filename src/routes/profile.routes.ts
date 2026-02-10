import { Router, Request, Response } from 'express';
import { profileService } from '../services/profile.service';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const profile = await profileService.get();

    return res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch profile',
    });
  }
});

router.patch('/', async (req: Request, res: Response) => {
  try {
    const profile = await profileService.update(req.body);

    return res.json({
      success: true,
      data: profile,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update profile',
    });
  }
});

export default router;
