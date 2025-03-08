import mongoose, { model } from "mongoose";

const RoomSchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true,
        unique: true
    },
    players: {
        type: [String],
        default: []
    },
    status: {
        type: String,
        default: 'waiting'
    }

});

export const Room = mongoose.model('Room', RoomSchema);