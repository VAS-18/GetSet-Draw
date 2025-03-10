// import { Room } from "../models/Room.js";
// import { v4 as uuidv4 } from 'uuid';

const rooms = new Map();
const socketRooms = new Map();

function generateRoomCode() {
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

    roomCode = generateRoom();
    isUnique = false;

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


async function joinRoom(socketId, roomCode) {
    if(socketRooms.has(socketId)){
        console.log(`${socketId} already present in the room, exiting...`);
    }
}
