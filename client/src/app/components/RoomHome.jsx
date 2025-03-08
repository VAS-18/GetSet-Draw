"use client"
import React, { useState } from 'react';
import { createRoom, joinRoom } from '../services/roomService';

const RoomHome = () => {
  const [mode, setMode] = useState(null); // null, 'create', or 'join'
  const [host, setHost] = useState('');
  const [player, setPlayer] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [message, setMessage] = useState('');
  const [roomData, setRoomData] = useState(null);

  // Handler for room creation
  const handleCreateRoom = async () => {
    try {
      const data = await createRoom(host);
      setMessage(data.message);
      setRoomData(data);
      // Save roomCode to show it to the user
      setRoomCode(data.roomCode);
    } catch (error) {
      setMessage('Error creating room.');
    }
  };

  // Handler for joining a room
  const handleJoinRoom = async () => {
    try {
      const data = await joinRoom(roomCode, player);
      setMessage(data.message);
      setRoomData(data.room);
    } catch (error) {
      setMessage('Error joining room.');
    }
  };

  return (
    <div className="text-center mt-8">
      <h1 className="text-3xl font-bold mb-6">Room Management</h1>
      {!mode && (
        <div className="space-x-4">
          <button 
            onClick={() => setMode('create')} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Create Room
          </button>
          <button 
            onClick={() => setMode('join')} 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Join Room
          </button>
        </div>
      )}

      {mode === 'create' && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Create Room</h2>
          <input
            type="text"
            placeholder="Enter host name"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 mb-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="space-x-4">
            <button 
              onClick={handleCreateRoom}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Create Room
            </button>
            <button 
              onClick={() => setMode(null)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {mode === 'join' && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Join Room</h2>
          <input
            type="text"
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 mb-4 w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="Enter player name"
            value={player}
            onChange={(e) => setPlayer(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 mb-4 w-64 ml-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="space-x-4">
            <button 
              onClick={handleJoinRoom}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Join Room
            </button>
            <button 
              onClick={() => setMode(null)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {message && <p className="mt-4 text-lg text-red-500">{message}</p>}

      {roomData && (
        <div className="mt-6 bg-gray-100 p-4 rounded shadow-md w-3/4 mx-auto">
          <h3 className="text-xl font-semibold mb-2">Room Data:</h3>
          <pre className="text-left text-sm">
            {JSON.stringify(roomData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default RoomHome;
