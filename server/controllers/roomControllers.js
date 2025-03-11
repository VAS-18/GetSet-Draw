import { Room } from "../models/Room.js";
import roomManager from '../utils/roomManager.js';

export const createRoom = async (req, res) => {
  try {
    const { playerId } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ success: false, message: 'Player ID is required' });
    }
    
    const result = await roomManager.createRoom(playerId);
    
    const room = new Room({
      code: result.roomCode,
      creator: playerId,
      players: [{ id: playerId, ready: false }]
    });
    
    await room.save();
    
    res.status(201).json({ success: true, roomCode: result.roomCode });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomCode, playerId } = req.body;
    
    if (!roomCode || !playerId) {
      return res.status(400).json({ success: false, message: 'Room code and player ID are required' });
    }
    
    const result = await roomManager.joinRoom(playerId, roomCode);
    
    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }
    
    const room = await Room.findOne({ code: roomCode });
    
    if (room) {
      const playerExists = room.players.some(player => player.id === playerId);
      
      if (!playerExists) {
        room.players.push({ id: playerId, ready: false });
        await room.save();
      }
    }
    
    res.status(200).json({ success: true, room: result.room });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRoomDetails = async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    if (!roomCode) {
      return res.status(400).json({ success: false, message: 'Room code is required' });
    }
    
    const result = roomManager.getRoomDetails(roomCode);
    
    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }
    
    res.status(200).json({ success: true, room: result.room });
  } catch (error) {
    console.error('Error getting room details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};