const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    if (!process.env.JWT_SECRET) {
        console.error('FATAL: JWT_SECRET environment variable is not set.');
        return res.status(500).json({ message: 'Server configuration error.' });
    }

    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role '${req.user?.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
