const prisma = require('../config/db');
const axios = require('axios');

// AI Engine URL
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000/api/negotiate';

const startNegotiation = async (req, res) => {
    try {
        const { shipment, shipper_metrics, carrier_metrics, market_signals, strategyProfile } = req.body;
        const shipperId = req.user.id;

        // 1. Create or Find Shipment
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

        // 2. Initialize Negotiation
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

        // 3. Trigger AI Engine Simulation
        const aiResponse = await axios.post(AI_ENGINE_URL, {
            shipment: shipment,
            shipper_metrics: shipper_metrics,
            carrier_metrics: carrier_metrics,
            market_signals: market_signals,
            strategy_profile: strategyProfile || 'Collaborative',
            max_rounds: negotiation.maxRounds
        });

        const simulationResults = aiResponse.data;

        // 4. Persist Simulation Results (Offers)
        const offerPromises = simulationResults.history.map((entry, index) => {
            return prisma.offer.create({
                data: {
                    negotiationId: negotiation.id,
                    round: Math.floor(index / 2) + 1,
                    price: entry.price,
                    senderId: entry.role === 'SHIPPER' ? shipperId : (req.body.carrierId || 'ai-carrier-id'),
                    message: entry.content,
                    strategy: entry.strategy_used || 'Autonomous'
                }
            });
        });

        await Promise.all(offerPromises);

        // 5. Update Negotiation Status
        await prisma.negotiation.update({
            where: { id: negotiation.id },
            data: {
                status: simulationResults.status === 'COMPLETED' ? 'COMPLETED' : 'WALK_AWAY',
                intrinsicValue: simulationResults.market_context?.intrinsic_value,
                marketBenchmark: simulationResults.market_context?.market_benchmark,
                currentRound: simulationResults.rounds.length
            }
        });

        res.status(201).json({
            message: 'Negotiation completed successfully',
            negotiationId: negotiation.id,
            results: simulationResults
        });

    } catch (error) {
        console.error('Negotiation Error:', error.message);
        res.status(500).json({
            message: 'Failed to execute negotiation',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

        // 3. Call AI Engine Step
        const aiStepResponse = await axios.post(`${AI_ENGINE_URL}/step`, {
            context: {
                shipment: negotiation.shipment,
                shipper_metrics: { budget: negotiation.shipperBudget, initial_offer: negotiation.basePrice },
                carrier_metrics: { operational_cost: negotiation.operationalCost },
                strategy_profile: negotiation.strategyProfile,
                max_rounds: negotiation.maxRounds
            },
            history: history,
            role: role === 'SHIPPER' ? 'CARRIER' : 'SHIPPER' // Generate for the OPPOSITE role
        });

        const aiMove = aiStepResponse.data;
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
        console.error('Negotiate Step Error:', error.message);
        res.status(500).json({ message: 'Failed to generate negotiation step', error: error.message });
    }
};

module.exports = {
    startNegotiation,
    getNegotiationHistory,
    getNegotiationById,
    negotiateStep
};
