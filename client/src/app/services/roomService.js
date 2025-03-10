import axios from 'axios';


const API_URL = process.env.LOCAL_SERVER;

export const createRoom = async (host) => {
    try {
        const response = await axios.post(`${API_URL}/Room-create`, { host });
        return response.data;
    } catch (error) {
        console.error('Error creating room', error);
        throw error;
    }
};

export const joinRoom = async (roomCode, player) => {
    try {
      const response = await axios.post(`${API_URL}/join`, { roomCode, player });
      return response.data;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  };

export const checkRoomStatus = async (roomCode) => {
  try {
    const response = await axios.get(`${API_URL}/room-status/${roomCode}`);
    return response.data;
  } catch (error) {
    console.error('Error checking room status:', error);
    throw error;
  }
};

export const leaveRoom = async (roomCode, player) => {
  try {
    const response = await axios.post(`${API_URL}/leave`, { roomCode, player });
    return response.data;
  } catch (error) {
    console.error('Error leaving room:', error);
    throw error;
  }
};

export const startGame = async (roomCode) => {
  try {
    const response = await axios.post(`${API_URL}/start-game`, { roomCode });
    return response.data;
  } catch (error) {
    console.error('Error starting game:', error);
    throw error;
  }
};
