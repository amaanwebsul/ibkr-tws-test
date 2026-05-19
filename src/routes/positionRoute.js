import express from 'express';
import { getPositions } from '../controllers/positions.js';

const router = express.Router();

router.get('/get', getPositions);

export default router;