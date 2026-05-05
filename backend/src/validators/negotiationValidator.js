const { body, validationResult } = require('express-validator');

/**
 * Middleware to catch and return validation errors from express-validator
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed.',
            errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
    }
    next();
};

/**
 * Rules for POST /api/negotiation/start
 */
const validateStartNegotiation = [
    body('shipment.origin')
        .isString().withMessage('shipment.origin must be a string')
        .notEmpty().withMessage('shipment.origin is required'),
    body('shipment.destination')
        .isString().withMessage('shipment.destination must be a string')
        .notEmpty().withMessage('shipment.destination is required'),
    body('shipment.distance')
        .isFloat({ min: 1 }).withMessage('shipment.distance must be a positive number'),
    body('shipment.weight')
        .isFloat({ min: 0.1 }).withMessage('shipment.weight must be a positive number'),
    body('shipment.cargo_type')
        .isString().withMessage('shipment.cargo_type must be a string')
        .notEmpty().withMessage('shipment.cargo_type is required'),
    body('shipper_metrics.budget')
        .isFloat({ min: 1 }).withMessage('shipper_metrics.budget must be a positive number'),
    body('shipper_metrics.initial_offer')
        .isFloat({ min: 1 }).withMessage('shipper_metrics.initial_offer must be a positive number'),
    handleValidationErrors,
];

/**
 * Rules for POST /api/negotiation/chat
 */
const validateNegotiateStep = [
    body('negotiationId')
        .isUUID().withMessage('negotiationId must be a valid UUID'),
    body('role')
        .isIn(['SHIPPER', 'CARRIER']).withMessage('role must be either SHIPPER or CARRIER'),
    handleValidationErrors,
];

module.exports = { validateStartNegotiation, validateNegotiateStep };
