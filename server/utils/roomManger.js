import { words } from "./words.js";

const rooms = new Map();
const socketRooms = new Map();

//function to generate room code
export function generateRoomCode() {
    const characters = "ABCDEFGHIJKLMNIOPQRSTUVXYZ0123456789";
    const length = characters.length;
    let code = '';

    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
    // let random_number = Math.random();
    // console.log(Math.floor(random_number * length));
    // console.log(code);
    // console.log(length);
}


//function to generate rooms
export async function generateRoom(socketId) {
    if (socketRooms.has(socketId)) {
        const existingRoom = socketRooms.get(socketId);
        console.log(`Socket ${socketId} is already in the room ${existingRoom}`);
        return {
            success: true,
            roomCode: existingRoom
        }
    }

    let roomCode;

    roomCode = generateRoom();
    isUnique = false;

    //checks if the generated room is unique or not
    while (!isUnique) {
        roomCode = generateRoom();
        if (rooms.get(roomCode)) {
            isUnique = true;
        }

    }

    rooms.set({
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
export async function joinRoom(socketId, roomCode) {
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

    const roomSize = room.player.length;

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
export async function setPlayerReady(socketId, roomCode) {
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
export async function gameStart(socketId, roomCode) {
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
export function submitDrawings(socketId, roomCode, drawingData) {
    const room = rooms.get(roomCode);

    if (!room) {
        return {
            success: false,
            message: "room does not exists"
        }
    }

    room.drawings[socketId] = drawingData;

    const allSubmitted = room.players.every(p => p.drawings[p.id]);

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
export function handleDisconnect(socketId) {
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
  

