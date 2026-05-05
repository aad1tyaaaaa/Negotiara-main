import json
import logging
from agents.dual_agent import NegotiationAgent
from strategy.concession import calculate_concession, is_deal_acceptable
from intelligence.pricing import IntrinsicValueModel
from intelligence.utility import UtilityEvaluator
from intelligence.market import MarketSignalMonitor
from intelligence.retrieval import SimpleRAGService

logger = logging.getLogger(__name__)


def prepare_negotiation_context(context: dict) -> dict:
    """
    Shared logic to initialize negotiation parameters, market benchmarks, and intrinsic value.
    """
    pricing_model = IntrinsicValueModel()
    market_monitor = MarketSignalMonitor()
    rag_service = SimpleRAGService()

    shipment = context.get("shipment", {})
    route = f"{shipment.get('origin')}-{shipment.get('destination')}"
    distance = shipment.get('distance', 1000)

    benchmarks = rag_service.retrieve_market_benchmark(route, distance)
    market_avg = benchmarks["expected_market_price"]

    intrinsic_value = pricing_model.estimate(distance)
    market_monitor.update_signals(context.get("market_signals", {}))
    adjusted_intrinsic = market_monitor.apply_to_price(intrinsic_value)

    return {
        "shipment": shipment,
        "market_avg": market_avg,
        "adjusted_intrinsic": adjusted_intrinsic,
        "strategy_profile": context.get("strategy_profile", "Collaborative")
    }


def execute_negotiation(context: dict, max_rounds: int = 5) -> dict:
    """
    Full Simulation Loop — runs synchronously, intended to be called
    via asyncio.to_thread from the FastAPI layer to avoid blocking.
    """
    prep = prepare_negotiation_context(context)
    utility_evaluator = UtilityEvaluator()

    shipper = NegotiationAgent(role="SHIPPER")
    carrier = NegotiationAgent(role="CARRIER")

    history = []
    rounds_data = []
    final_status = "IN_PROGRESS"
    agreed_price = None

    market_avg = prep["market_avg"]
    adjusted_intrinsic = prep["adjusted_intrinsic"]
    shipment = prep["shipment"]

    current_carrier_price = context.get("carrier_metrics", {}).get("initial_offer") or market_avg * 1.2
    current_shipper_price = context.get("shipper_metrics", {}).get("initial_offer") or market_avg * 0.8

    history.append({
        "role": "CARRIER",
        "content": f"Initial quote for freight transport: ${current_carrier_price:.2f}",
        "price": current_carrier_price
    })

    for current_round in range(1, max_rounds + 1):
        logger.info("Negotiation round %d/%d", current_round, max_rounds)

        # Shipper Turn
        shipper_budget = context.get("shipper_metrics", {}).get("budget", market_avg * 1.1)
        shipper_context = {
            "shipment": shipment,
            "market_benchmark": market_avg,
            "intrinsic_value": adjusted_intrinsic,
            "strategy_profile": prep["strategy_profile"],
            "target_price": current_shipper_price,
            "reservation_price": shipper_budget,
            "round": current_round,
            "max_rounds": max_rounds
        }

        shipper_response = shipper.generate_response(shipper_context, history)
        current_shipper_price = shipper_response.get("target_counter_price", current_shipper_price)
        history.append({
            "role": "SHIPPER",
            "content": shipper_response.get("message_to_lsp"),
            "price": current_shipper_price
        })

        if current_shipper_price >= current_carrier_price:
            final_status = "COMPLETED"
            agreed_price = current_shipper_price
            break

        # Carrier Turn
        c_metrics = context.get("carrier_metrics", {}) or {}
        carrier_min = c_metrics.get("operational_cost") or adjusted_intrinsic * 0.95

        carrier_context = {
            "shipment": shipment,
            "market_benchmark": market_avg,
            "intrinsic_value": adjusted_intrinsic,
            "target_price": current_carrier_price,
            "reservation_price": carrier_min,
            "round": current_round,
            "max_rounds": max_rounds
        }

        carrier_response = carrier.generate_response(carrier_context, history)
        current_carrier_price = carrier_response.get("target_counter_price", current_carrier_price)
        history.append({
            "role": "CARRIER",
            "content": carrier_response.get("message_to_lsp"),
            "price": current_carrier_price
        })

        if current_carrier_price <= current_shipper_price:
            final_status = "COMPLETED"
            agreed_price = current_carrier_price
            break

        rounds_data.append({
            "round": current_round,
            "shipper_offer": current_shipper_price,
            "carrier_offer": current_carrier_price,
            "utilities": utility_evaluator.evaluate(current_carrier_price, shipper_budget, carrier_min)
        })

    if final_status == "IN_PROGRESS":
        final_status = "WALK_AWAY"

    logger.info("Negotiation finished: status=%s agreed_price=%s", final_status, agreed_price)

    return {
        "status": final_status,
        "agreed_price": agreed_price,
        "market_context": {
            "intrinsic_value": adjusted_intrinsic,
            "market_benchmark": market_avg
        },
        "rounds": rounds_data,
        "history": history
    }


def execute_single_step(context: dict, history: list, role: str = "SHIPPER") -> dict:
    """
    Interactive turn generation — called via asyncio.to_thread.
    """
    prep = prepare_negotiation_context(context)
    agent = NegotiationAgent(role=role)

    market_avg = prep["market_avg"]
    adjusted_intrinsic = prep["adjusted_intrinsic"]

    metrics_key = "shipper_metrics" if role == "SHIPPER" else "carrier_metrics"
    metrics = context.get(metrics_key, {}) or {}
    budget_key = "budget" if role == "SHIPPER" else "operational_cost"
    reservation_price = metrics.get(budget_key, market_avg)

    agent_context = {
        "shipment": prep["shipment"],
        "market_benchmark": market_avg,
        "intrinsic_value": adjusted_intrinsic,
        "strategy_profile": prep["strategy_profile"],
        "target_price": metrics.get("initial_offer", market_avg),
        "reservation_price": reservation_price,
        "round": (len(history) // 2) + 1,
        "max_rounds": context.get("max_rounds", 5)
    }

    return agent.generate_response(agent_context, history)
