const prisma = require('../config/db');
const axios = require('axios');

// AI Engine URL
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000/api/negotiate';

const startNegotiation = async (req, res) => {
    try {
        const { shipment, shipper_metrics, carrier_metrics, strategyProfile } = req.body;
        const shipperId = req.user.id;

        // 1. Create Shipment record
        const newShipment = await prisma.shipment.create({
            data: {
                origin: shipment.origin,
                destination: shipment.destination,
                distance: shipment.distance,
                cargoType: shipment.cargo_type,
                weight: shipment.weight,
                deadline: new Date(shipment.deadline || Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        // 2. Create Negotiation record — AI simulation is driven interactively via /chat
        const negotiation = await prisma.negotiation.create({
            data: {
                shipmentId: newShipment.id,
                shipperId: shipperId,
                status: 'IN_PROGRESS',
                basePrice: shipper_metrics.initial_offer,
                targetPrice: shipper_metrics.target_price || (shipper_metrics.budget * 0.9),
                shipperBudget: shipper_metrics.budget,
                strategyProfile: strategyProfile || 'Collaborative',
                operationalCost: carrier_metrics?.operational_cost || null,
                desiredMargin: carrier_metrics?.desired_margin || null,
                deadline: newShipment.deadline,
                maxRounds: req.body.max_rounds || 5
            }
        });

        res.status(201).json({
            message: 'Negotiation initialized. Begin chat to start AI negotiation.',
            negotiationId: negotiation.id,
        });

    } catch (error) {
        console.error('Negotiation Init Error:', error.message);
        res.status(500).json({
            message: 'Failed to initialize negotiation.',
            detail: error.message,
        });
    }
};

const getNegotiationHistory = async (req, res) => {
    try {
        const negotiations = await prisma.negotiation.findMany({
            where: {
                OR: [
                    { shipperId: req.user.id },
                    { carrierId: req.user.id }
                ]
            },
            include: {
                shipment: true,
                offers: {
                    orderBy: { round: 'asc' }
                }
            }
        });
        res.json(negotiations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getNegotiationById = async (req, res) => {
    try {
        const { id } = req.params;
        const negotiation = await prisma.negotiation.findUnique({
            where: { id },
            include: {
                shipment: true,
                offers: { orderBy: { round: 'asc' } }
            }
        });
        if (!negotiation) return res.status(404).json({ message: 'Not found' });
        res.json(negotiation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const negotiateStep = async (req, res) => {
    try {
        const { negotiationId, message, price, role } = req.body;

        // 1. Get negotiation context
        const negotiation = await prisma.negotiation.findUnique({
            where: { id: negotiationId },
            include: { shipment: true, offers: { orderBy: { round: 'asc' } } }
        });

        if (!negotiation) return res.status(404).json({ message: 'Negotiation not found' });

        // 2. Prepare history for AI Engine
        const history = negotiation.offers.map(o => ({
            role: o.senderId === 'ai-carrier-id' ? 'CARRIER' : 'SHIPPER',
            content: o.message,
            price: o.price
        }));

        // Add the user's latest message if it exists
        if (message) {
            history.push({ role: role, content: message, price: price });
            // Save user offer to DB
            await prisma.offer.create({
                data: {
                    negotiationId,
                    round: negotiation.currentRound,
                    price: price || 0,
                    senderId: req.user.id,
                    message: message,
                    strategy: 'User Input'
                }
            });
        }

        // 3. Call AI Engine Step (with timeout)
        // Map DB field names to AI schema (snake_case) to avoid StepRequest validation failures.
        let aiMove;
        try {
            console.log('Calling AI Engine at:', `${AI_ENGINE_URL}/step`);
            const aiStepResponse = await axios.post(`${AI_ENGINE_URL}/step`, {
                context: {
                    shipment: {
                        origin: negotiation.shipment.origin,
                        destination: negotiation.shipment.destination,
                        distance: negotiation.shipment.distance || 1,
                        cargo_type: negotiation.shipment.cargoType,
                        weight: negotiation.shipment.weight,
                        deadline: negotiation.shipment.deadline
                    },
                    shipper_metrics: {
                        budget: negotiation.shipperBudget || (negotiation.basePrice * 1.5) || 10000,
                        initial_offer: negotiation.basePrice || 1000,
                        target_price: negotiation.targetPrice || null
                    },
                    carrier_metrics: {
                        operational_cost: negotiation.operationalCost,
                        desired_margin: negotiation.desiredMargin
                    },
                    strategy_profile: negotiation.strategyProfile,
                    max_rounds: negotiation.maxRounds
                },
                history: history,
                role: role === 'SHIPPER' ? 'CARRIER' : 'SHIPPER' // Generate for the OPPOSITE role
            }, { timeout: 60000 });
            aiMove = aiStepResponse.data;
        } catch (aiError) {
            console.error('AI Engine Error:', {
                message: aiError.message,
                status: aiError.response?.status,
                data: aiError.response?.data,
                config: aiError.config?.url
            });
            throw new Error(`AI Engine failed: ${aiError.response?.data?.detail || aiError.message}`);
        }

        if (!aiMove || !aiMove.message_to_lsp) {
            const detail = aiMove?.error || aiMove?.detail || 'missing message_to_lsp field';
            throw new Error(`AI Engine returned invalid response: ${detail}`);
        }

        const aiRole = role === 'SHIPPER' ? 'CARRIER' : 'SHIPPER';

        // 4. Save AI Move to DB
        const newOffer = await prisma.offer.create({
            data: {
                negotiationId,
                round: negotiation.currentRound,
                price: aiMove.target_counter_price || 0,
                senderId: aiRole === 'CARRIER' ? 'ai-carrier-id' : 'ai-shipper-id',
                message: aiMove.message_to_lsp,
                strategy: aiMove.strategy_used || 'Autonomous'
            }
        });

        // 5. Increment currentRound
        await prisma.negotiation.update({
            where: { id: negotiationId },
            data: { currentRound: { increment: 1 } }
        });

        // 5. Broadcast real-time update via Socket.io
        const io = req.app.get('io');
        const payload = {
            role: aiRole,
            price: aiMove.target_counter_price,
            content: aiMove.message_to_lsp,
            strategy: aiMove.strategy_used,
            round: negotiation.currentRound
        };
        io.to(negotiationId).emit('negotiation_update', payload);

        res.json(payload);

    } catch (error) {
        console.error('Negotiate Step Error:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });
        const isDev = process.env.NODE_ENV === 'development';
        res.status(500).json({
            message: 'Failed to generate negotiation step.',
            detail: error.message,
            ...(isDev && { stack: error.stack, response: error.response?.data })
        });
    }
};

module.exports = {
    startNegotiation,
    getNegotiationHistory,
    getNegotiationById,
    negotiateStep
};
