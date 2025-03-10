import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    length: 6
  },
  creator: {
    type: String,
    required: true
  },
  players: [{
    id: String,
    ready: Boolean
  }],
  status: {
    type: String,
    enum: ['waiting', 'playing', 'judging', 'completed'],
    default: 'waiting'
  },
  currentPhrase: {
    type: String,
    default: null
  },
  drawings: {
    type: Map,
    of: String,
    default: {}
  },
  scores: {
    type: Map,
    of: Number,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 
  }
});

export const Room = mongoose.model('Room', RoomSchema);