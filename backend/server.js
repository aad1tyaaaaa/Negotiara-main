const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const negotiationRoutes = require('./src/routes/negotiationRoutes');
const { protect, authorize } = require('./src/middleware/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.set('io', io);
app.use('/api/auth', authRoutes);
app.use('/api/negotiation', negotiationRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'Backend is running',
    timestamp: new Date().toISOString(),
    database: 'Checking...'
  });
});

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server', error: err.message });
});

// WebSockets for Real-time streaming
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('join_session', (data) => {
    const { sessionId } = data;
    socket.join(sessionId);
    console.log(`User joined negotiation session: ${sessionId}`);
  });

  // Playback the history simulating real-time typing
  socket.on('start_playback', async (data) => {
    const { sessionId } = data;
    const prisma = require('./src/config/db');

    try {
      // Fetch all offers for this negotiation
      const offers = await prisma.offer.findMany({
        where: { negotiationId: sessionId },
        orderBy: [
          { round: 'asc' },
          { createdAt: 'asc' }
        ]
      });

      if (!offers || offers.length === 0) return;

      // Stream them out one-by-one with a delay
      let index = 0;
      const streamInterval = setInterval(() => {
        if (index >= offers.length) {
          clearInterval(streamInterval);
          // Optional: emit completion
          io.to(sessionId).emit('negotiation_complete', { status: 'COMPLETED' });
          return;
        }

        const offer = offers[index];
        const payload = {
          role: offer.senderId === 'ai-carrier-id' ? 'CARRIER' : 'SHIPPER', // simplified check
          price: offer.price,
          content: offer.message,
          strategy: offer.strategy,
          round: offer.round
        };

        io.to(sessionId).emit('negotiation_update', payload);
        index++;
      }, 3000); // 3-second delay between messages

    } catch (e) {
      console.error('Error playing back history:', e);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
  console.log(`Express Backend listening on port ${PORT}`);

  // Test Prisma Connection
  const prisma = require('./src/config/db');
  try {
    await prisma.$connect();
    console.log('Successfully connected to Database via Prisma');
  } catch (err) {
    console.error('CRITICAL: Prisma failed to connect to Database.');
    console.error('Msg:', err.message);
    console.log('Server will remain active for health-checks, but DB operations will fail.');
  }
});
