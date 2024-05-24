// backend/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'https://main--chatapplication0.netlify.app',
  'https://chatapplication0.netlify.app/'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));

const io = socketIo(server, {
  cors: corsOptions,
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = 'mongodb+srv://ujjwalnatani10:hepcRNRQlNTuLxBW@cluster0.qbxjzhq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(cors());
app.use(express.json());
app.use('/', authRoutes);

const messageRoutes = require('./routes/messages');
app.use('/api/messages', messageRoutes);

io.on('connection', (socket) => {

  socket.on('message', async (data) => {
    try {
      const newMessage = new Message(data);
      await newMessage.save();
      io.emit('message', newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
