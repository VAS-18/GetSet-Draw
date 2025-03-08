import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const port = 3000


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB connection error:', error));


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
