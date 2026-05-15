const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let isRedisConnected = false;

const redisOptions = {
    maxRetriesPerRequest: null, // Prevents crashing on connection failure
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError: (err) => {
        return true;
    }
};

const pubClient = new Redis(redisUrl, redisOptions);
const subClient = new Redis(redisUrl, redisOptions);

pubClient.on('connect', () => {
    isRedisConnected = true;
    console.log('Redis Pub Client Connected');
});

pubClient.on('error', (err) => {
    isRedisConnected = false;
    console.error('Redis Connection Error (Backend will continue in standalone mode):', err.message);
});

module.exports = {
    pubClient,
    subClient,
    redis: pubClient,
    getIsRedisConnected: () => isRedisConnected
};
