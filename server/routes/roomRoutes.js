import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Room } from '../models/Room';
const router = express.Router();

export const RoomCreate = router.post('/Room-create', async (req, res) => {
    try {
        const { host } = req.body;
        let roomCode = uuidv4.split('-')[0];

        let existingRoom = await Room.findOne({ roomCode });

        if (existingRoom) {
            console.log("Room Already exists");
        }

        const newRoom = new Room({
            roomCode,
            players: [host],
            status: 'waiting'
        });

        await newRoom.save();

        res.status(201).json({
            roomCode,
            message: 'Room Created Successfully'
        })
    }
    catch {
        console.error('Error Creating Room', error);
        res.status(500).json({
            error: 'Server errror while creating room'
        })
    }
});

export const RoomJoin = router.post('/join', async (req, res) => {
    try {
        console.log(req.body);

        const { roomCode, player } = req.body;

        const room = await Room.findOne({ roomCode });

        if (!room) {
            console.log("Room Does not exits");

            return res.status(404).json({
                error: 'Room not found'
            });
        }

        if (room.players.length >= 2) {
            return res.status(400).json({
                error: 'Room is full'
            });
        }

        room.players.push(player);

        if (room.players.length == 2) {
            room.status = 'full';
        }

        await room.save();

        res.status(200).json({
            message: 'joined room successfully',
            room
        })

    } catch (error) {
        console.error('Error joining room:', error);
        res.status(500).json({ error: 'Server error while joining room' });
    }
});