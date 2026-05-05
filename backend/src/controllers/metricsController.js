const prisma = require('../config/db');

/**
 * GET /api/negotiation/metrics
 * Returns real-time aggregated stats for the authenticated user's negotiations.
 */
const getUserMetrics = async (req, res) => {
    try {
        const userId = req.user.id;

        const negotiations = await prisma.negotiation.findMany({
            where: {
                OR: [
                    { shipperId: userId },
                    { carrierId: userId }
                ]
            },
            include: {
                shipment: { select: { weight: true } }
            }
        });

        const total = negotiations.length;
        const completed = negotiations.filter(n => n.status === 'COMPLETED');
        const walkAways = negotiations.filter(n => n.status === 'WALK_AWAY');
        const active = negotiations.filter(n => n.status === 'IN_PROGRESS');

        // Win rate: completed / (completed + walk_away)
        const resolved = completed.length + walkAways.length;
        const winRate = resolved > 0
            ? Math.round((completed.length / resolved) * 100)
            : 0;

        // Avg savings: mean of (marketBenchmark - agreedPrice) / marketBenchmark
        // Only for completed negotiations that have both values
        const savingsData = completed.filter(
            n => n.marketBenchmark && n.targetPrice && n.marketBenchmark > 0
        );
        const avgSavings = savingsData.length > 0
            ? (
                savingsData.reduce((sum, n) => {
                    return sum + ((n.marketBenchmark - n.targetPrice) / n.marketBenchmark);
                }, 0) / savingsData.length * 100
              ).toFixed(1)
            : '0.0';

        // Total goods weight
        const totalWeight = negotiations.reduce((sum, n) => {
            return sum + (n.shipment?.weight || 0);
        }, 0);

        res.json({
            totalNegotiations: total,
            activeCount: active.length,
            completedCount: completed.length,
            winRate,
            avgSavings: parseFloat(avgSavings),
            totalWeight: Math.round(totalWeight * 10) / 10,
        });

    } catch (error) {
        console.error('Metrics error:', error.message);
        res.status(500).json({ message: 'Failed to fetch metrics.' });
    }
};

module.exports = { getUserMetrics };
