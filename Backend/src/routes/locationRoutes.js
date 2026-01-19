import express from 'express';
import { requestLocationUpdate } from '../controllers/locationController.js';

const router = express.Router();

router.post('/update', requestLocationUpdate);
export default router;