const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    // BYPASS: Automatically inject a mock user for no-auth mode
    req.user = {
        id: 'bypass-id-123',
        name: 'OPERATOR ONE',
        email: 'operator@negotiara.ai',
        role: 'SHIPPER'
    };
    next();
};

const authorize = (...roles) => {
    return (req, res, next) => {
        // BYPASS: Always allow access regardless of roles
        next();
    };
};

module.exports = { protect, authorize };

