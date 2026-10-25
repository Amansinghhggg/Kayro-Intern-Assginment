import express from 'express';
import {
  getWaitlist,
  addToWaitlist,
  updateWaitlistStatus,
} from '../controllers/waitlistController.js';

const router = express.Router();

router.get('/', getWaitlist);
router.post('/', addToWaitlist);
router.patch('/:id/status', updateWaitlistStatus);

export default router;
