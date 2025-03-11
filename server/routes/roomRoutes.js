import express from 'express';
import * as roomController from '../controllers/roomController.js';

const router = express.Router();

router.post('/create', roomController.createRoom);

router.post('/join', roomController.joinRoom);

router.get('/:roomCode', roomController.getRoomDetails);

export default router;