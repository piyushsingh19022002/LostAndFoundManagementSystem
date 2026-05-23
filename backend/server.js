const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config({ override: true });
const connectDB = require('./config/db');

// Connect to database
connectDB();

// Initialize and verify Email service on server startup
require('./services/emailService');

const ClaimRequest = require('./models/ClaimRequest');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware cors test
app.use(cors());
app.use(express.json());
// Test route endpoint
app.get('/', (req, res) => {
  res.json({ message: "API is running" });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lost-items', require('./routes/lostItemRoutes'));
app.use('/api/found-items', require('./routes/foundItemRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/claims', require('./routes/claimRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/analytics', require('./routes/analyticsRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));

// Socket.io JWT Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
  if (!token) {
    return next(new Error('Authentication error: Token not provided'));
  }

  const tokenParts = token.split(' ');
  const rawToken = tokenParts.length === 2 ? tokenParts[1] : tokenParts[0];

  jwt.verify(rawToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.user = decoded;
    next();
  });
});

// Socket.io Connection & Events
io.on('connection', (socket) => {
  console.log(`User connected to socket: ${socket.user.id} (${socket.id})`);

  socket.on('join_room', async ({ claimId }) => {
    try {
      if (!claimId) {
        socket.emit('error_message', 'Claim ID is required');
        return;
      }

      const claim = await ClaimRequest.findById(claimId);
      if (!claim) {
        socket.emit('error_message', 'Claim request not found');
        return;
      }

      // Security check
      const isClaimer = claim.claimer.toString() === socket.user.id;
      const isOwner = claim.owner.toString() === socket.user.id;
      if (!isClaimer && !isOwner) {
        socket.emit('error_message', 'Unauthorized to join this room');
        return;
      }

      socket.join(claimId);
      console.log(`User ${socket.user.id} successfully joined room: ${claimId}`);
      socket.emit('room_joined', { claimId });
    } catch (err) {
      console.error('Socket join_room error:', err);
      socket.emit('error_message', 'Server error joining room');
    }
  });

  socket.on('send_message', async ({ claimId, message }) => {
    try {
      if (!claimId || !message) {
        socket.emit('error_message', 'Claim ID and message content are required');
        return;
      }

      const claim = await ClaimRequest.findById(claimId);
      if (!claim) {
        socket.emit('error_message', 'Claim request not found');
        return;
      }

      // Security check
      const isClaimer = claim.claimer.toString() === socket.user.id;
      const isOwner = claim.owner.toString() === socket.user.id;
      if (!isClaimer && !isOwner) {
        socket.emit('error_message', 'Unauthorized to send messages in this room');
        return;
      }

      const receiverId = isClaimer ? claim.owner : claim.claimer;

      // Persist message to MongoDB
      const newMessage = await Message.create({
        sender: socket.user.id,
        receiver: receiverId,
        claim: claimId,
        message,
      });

      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'name email')
        .populate('receiver', 'name email');

      // Broadcast to room
      io.to(claimId).emit('receive_message', populatedMessage);
    } catch (err) {
      console.error('Socket send_message error:', err);
      socket.emit('error_message', 'Server error sending message');
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

