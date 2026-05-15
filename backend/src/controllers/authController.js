const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

exports.register = async (req, res) => {
    // BYPASS: Always return success
    res.status(201).json({
        id: "bypass-id-123",
        name: "OPERATOR ONE",
        email: "operator@negotiara.ai",
        role: "SHIPPER",
        token: "mock-token"
    });
};

exports.login = async (req, res) => {
    // BYPASS: Always return success
    res.json({
        id: "bypass-id-123",
        name: "OPERATOR ONE",
        email: "operator@negotiara.ai",
        role: "SHIPPER",
        token: "mock-token"
    });
};

