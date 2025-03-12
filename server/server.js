import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import roomManager from './utils/roomManger';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const port = 3000

//socket.io setup

const io = new Server(Server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET','POST']
  }
});

//basic mongoose setup
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB connection error:', error));



 //socket on
 
 io.on('connection',(socket) => {
  console.log("User Connected", socket.id);

  //to Handle Reconnections

  const auth = socket.handshake.auth;
  //for debugging
  console.log(auth);

  if(auth && auth.socketId){
    const result = roomManager.handleReconnection(auth.socketId,socket.id);

    if(result.success){
      socket.join(result.roomCode);

      socket.to(result.roomCode).emit('player-reconnected', {
        
      } )
    }
  }
 })



app.get('/', (req, res) => {
  res.send('Hello World!')
})

//Routes
import { RoomCreate } from './routes/roomRoutes';
import { RoomJoin } from './routes/roomRoutes';

app.use('/api/create',RoomCreate);
app.use('/api/join',RoomJoin);

app.listen(port || 5000, () => {
  console.log(`Example app listening on port ${port}`)
})
