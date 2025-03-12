import { words } from "./words.js";

const rooms = new Map();
const socketRooms = new Map();

//function to generate room code
 function generateRoomCode() {
    const characters = "ABCDEFGHIJKLMNIOPQRSTUVXYZ0123456789";
    const length = characters.length;
    let code = '';

    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}


//function to generate rooms
 async function generateRoom(socketId) {
    if (socketRooms.has(socketId)) {
        const existingRoom = socketRooms.get(socketId);
        console.log(`Socket ${socketId} is already in the room ${existingRoom}`);
        return {
            success: true,
            roomCode: existingRoom
        }
    }

    let roomCode;

    roomCode = generateRoomCode();
    let isUnique = false;

    //checks if the generated room is unique or not
    while (!isUnique) {
        roomCode = generateRoomCode();
        if (!rooms.get(roomCode)) {
            isUnique = true;
        }

    }

    rooms.set(roomCode, {
        creator: socketId,
        players: [{
            id: socketId,
            ready: false
        }],
        status: 'waiting',
        currentPhrase: null,
        drawings: {},
        scores: {}

    });

    socketRooms.set(socketId, roomCode);
    console.log(`Room ${roomCode} created by ${socketId}`);
    return { success: true, roomCode };
}


//function to join rooms
 async function joinRoom(socketId, roomCode) {
    if (socketRooms.has(socketId)) {
        console.log(`${socketId} already present in the room, exiting...`);
    }

    const room = rooms.get(roomCode);

    if (!room) {
        console.log(`Room not found`);
        return {
            success: false,
            roomCode
        }
    }

    //Check for Existing players
    const ExistingPlayer = room.players.some(player => player.id === socketId);

    if (ExistingPlayer) {
        console.log(`Player ${socketId} already exits in room ${roomCode}`);
        return {
            success: false,
            roomCode
        }
    }

    //Check to see if the room is full or not 

    const roomSize = room.players.length;

    if (roomSize >= 2) {
        console.log(`Room ${roomCode} is already full`);
        return {
            success: false,
            message: "Room is full",
            roomCode
        }
    }

    //Adding new players to the room
    room.players.push({
        id: socketId,
        ready: false
    });

    socketRooms.set(socketId, roomCode);

    console.log(`Player ${socketId} joined room: ${roomCode}, current players:`, room.players.map(p => p.id));

    return { success: true, roomCode, room };

}

// function to set player status to "Ready"
 async function setPlayerReady(socketId, roomCode) {
    const room = rooms.get(roomCode);

    if (!room) {
        return {
            success: false,
            message: "Room not found"
        }
    }

    const player = room.players.find(p => p.id === socketId);

    if (player) {
        player.ready = true;
    }

    //Check to see if all the players are ready or not 
    const allReady = room.players.every(p => p.ready);

    return {
        success: true,
        allReady,
        room
    }
}

//function which starts the game
 async function gameStart(socketId, roomCode) {
    const room = rooms.get(roomCode);

    if (!room) {
        return {
            success: false,
            message: "no room found"
        }
    }

    const phrase = await words();

    room.currentPhrase = phrase;

    return {
        success: true,
        phrase: room.currentPhrase,
        timeLimit: 120
    };
}

//function to submit the drawings
 function submitDrawings(socketId, roomCode, drawingData) {
    const room = rooms.get(roomCode);

    if (!room) {
        return {
            success: false,
            message: "room does not exists"
        }
    }

    room.drawings[socketId] = drawingData;

    const allSubmitted = room.players.every(p => room.drawings[p.id]);

    if (allSubmitted) {
        room.status = "judging";

        //submit drawings to the AI, For now im giving it a random number;

        room.players.forEach(player => {
            room.scores[player.id] = Math.floor(Math.random() * 100) + 1;
        });

        room.status = "completed";

    }

    return {
        success: true,
        allSubmitted,
        results: allSubmitted ? {
            drawings: room.drawings,
            scores: room.scores,
            phrase: room.currentPhrase
        } : null
    };
}

// function to handle Disconnection form the room
 function handleDisconnect(socketId) {
    console.log('User disconnected:', socketId);
    
    if (socketRooms.has(socketId)) {
      const roomCode = socketRooms.get(socketId);
      const room = rooms.get(roomCode);
      
      if (room) {
        const playerIndex = room.players.findIndex(p => p.id === socketId);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          
          if (room.players.length === 0) {
            rooms.delete(roomCode);
            console.log(`Room ${roomCode} deleted (empty)`);
          }
          
          return { roomCode, remainingPlayers: room.players.length > 0 };
        }
      }
      
      socketRooms.delete(socketId);
    }
    
    return null;
  }

//function to handle reconnection

  function handleReconnection(oldSocketId, newSocketId) {
    console.log(`Client attempting to reconnect with previous ID: ${oldSocketId}`);

    for (const [roomCode, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === oldSocketId);
      
      if (playerIndex !== -1) {
        console.log(`Found previous socket ${oldSocketId} in room ${roomCode}, updating to new socket ID ${newSocketId}`);
        

        room.players[playerIndex].id = newSocketId;
        
        if (room.creator === oldSocketId) {
          room.creator = newSocketId;
        }
        

        if (room.drawings[oldSocketId]) {
          room.drawings[newSocketId] = room.drawings[oldSocketId];
          delete room.drawings[oldSocketId];
        }
        
        if (room.scores[oldSocketId]) {
          room.scores[newSocketId] = room.scores[oldSocketId];
          delete room.scores[oldSocketId];
        }
        
        // Update socket to room mapping
        socketRooms.set(newSocketId, roomCode);
        
        return { success: true, roomCode, room };
      }
    }
    
    return { success: false };
  }
  
  // Get room details
  function getRoomDetails(roomCode) {
    const room = rooms.get(roomCode);
    
    if (!room) {
      return { success: false, message: 'Room not found' };
    }
    
    return { success: true, room };
  }
  

  function getAllRooms() {
    const roomsData = {};
    rooms.forEach((room, code) => {
      roomsData[code] = {
        ...room,
        drawings: Object.fromEntries(Object.entries(room.drawings)),
        scores: Object.fromEntries(Object.entries(room.scores))
      };
    });
    
    const socketMappings = {};
    socketRooms.forEach((roomCode, socketId) => {
      socketMappings[socketId] = roomCode;
    });
    
    return {
      rooms: roomsData,
      socketRooms: socketMappings
    };
  }
  

const roomManager = {
    generateRoom,
    joinRoom,
    setPlayerReady,
    gameStart,
    submitDrawings,
    handleDisconnect,
    handleReconnection,
    getAllRooms,
    getRoomDetails
};
  
export default roomManager;