const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ── Startup validation ─────────────────────────────────────────────────────
const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missingEnv.join(', ')}`);
    console.error('Server will not start. Please set all required variables in your .env file.');
    process.exit(1);
}

const authRoutes = require('./src/routes/authRoutes');
const negotiationRoutes = require('./src/routes/negotiationRoutes');

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',') : ["http://localhost:3000", "http://127.0.0.1:3000"];

const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true,
    }
});

// Use Redis adapter only if REDIS_URL is provided
if (process.env.REDIS_URL) {
    const { createAdapter } = require('@socket.io/redis-adapter');
    const { pubClient, subClient } = require('./src/config/redis');
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Socket.io using Redis adapter');
} else {
    console.log('Socket.io running in standalone mode (no Redis)');
}

// ── CORS ──────────────────────────────────────────────────────────────────
app.use(cors({
    origin: ALLOWED_ORIGIN,
    credentials: true,
}));

app.use(express.json());

// ── Request Logging (must be before routes) ───────────────────────────────
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ── Routes ────────────────────────────────────────────────────────────────
app.set('io', io);
app.use('/api/auth', authRoutes);
app.use('/api/negotiation', negotiationRoutes);

// ── Health Check ─────────────────────────────────────────────────────────
let dbConnected = false;
app.get('/health', (req, res) => {
    const status = {
        status: dbConnected ? 'OK' : 'Degraded',
        timestamp: new Date().toISOString(),
        database: dbConnected ? 'connected' : 'disconnected',
    };
    res.status(dbConnected ? 200 : 503).json(status);
});

// ── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ message: 'Something went wrong on the server.' });
});

// ── WebSocket Authentication Middleware ───────────────────────────────────
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
        return next(new Error('Authentication error: No token provided.'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (err) {
        return next(new Error('Authentication error: Invalid token.'));
    }
});

// ── WebSocket Events ──────────────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id} (user: ${socket.user?.id})`);

    socket.on('join_session', async (data) => {
        const { sessionId } = data;
        const prisma = require('./src/config/db');

        try {
            // Verify this user is a participant in the session
            const negotiation = await prisma.negotiation.findUnique({
                where: { id: sessionId },
                select: { shipperId: true, carrierId: true },
            });

            if (!negotiation) {
                return socket.emit('error', { message: 'Negotiation session not found.' });
            }

            const isParticipant =
                socket.user.id === negotiation.shipperId ||
                socket.user.id === negotiation.carrierId;

            if (!isParticipant) {
                return socket.emit('error', { message: 'Not authorized to join this session.' });
            }

            socket.join(sessionId);
            console.log(`User ${socket.user.id} joined negotiation session: ${sessionId}`);
        } catch (e) {
            console.error('Error in join_session:', e);
            socket.emit('error', { message: 'Failed to join session.' });
        }
    });

    // Playback history with real-time streaming simulation
    socket.on('start_playback', async (data) => {
        const { sessionId } = data;
        const prisma = require('./src/config/db');

        try {
            const offers = await prisma.offer.findMany({
                where: { negotiationId: sessionId },
                orderBy: [
                    { round: 'asc' },
                    { createdAt: 'asc' }
                ]
            });

            if (!offers || offers.length === 0) return;

            let index = 0;
            const streamInterval = setInterval(() => {
                if (index >= offers.length) {
                    clearInterval(streamInterval);
                    io.to(sessionId).emit('negotiation_complete', { status: 'COMPLETED' });
                    return;
                }

                const offer = offers[index];
                const payload = {
                    role: offer.senderId === 'ai-carrier-id' ? 'CARRIER' : 'SHIPPER',
                    price: offer.price,
                    content: offer.message,
                    strategy: offer.strategy,
                    round: offer.round
                };

                io.to(sessionId).emit('negotiation_update', payload);
                index++;
            }, 3000);

        } catch (e) {
            console.error('Error playing back history:', e);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// ── Server Start ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
    console.log(`Express Backend listening on port ${PORT}`);

    const prisma = require('./src/config/db');
    try {
        await prisma.$connect();
        dbConnected = true;
        console.log('Successfully connected to Database via Prisma');
    } catch (err) {
        dbConnected = false;
        console.error('CRITICAL: Prisma failed to connect to Database.');
        console.error('Msg:', err.message);
        console.log('Server is running in DEGRADED mode — DB operations will fail.');
    }
});
