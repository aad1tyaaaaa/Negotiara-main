from typing import TypedDict, Annotated, Sequence
import operator
from langgraph.graph import StateGraph, END
from agents.master_negotiator import MasterNegotiator
from agents.lsp_agent import LspAgent
from intelligence.negotiation_memory import NegotiationMemory
from strategy.anchoring import calculate_anchor
from .decision_engine import evaluate_round_outcome
import re

# Define the state schema
class NegotiationState(TypedDict):
    shipment_context: str
    market_benchmark: float
    target_price: float
    reservation_price: float
    competitor_prices: list[float]
    initial_lsp_offer: float
    max_rounds: int
    current_round: int
    anchor_price: float
    
    # Negotiation history and current state tracking
    memory: NegotiationMemory
    last_ai_message: str
    last_ai_target: float
    last_strategy_used: str
    
    last_lsp_message: str
    last_lsp_price: float
    
    # End state
    final_status: str
    agreed_price: float
    rounds_log: Annotated[list, operator.add]


def initialize_negotiation(state: NegotiationState):
    """Initializes the negotiation parameters."""
    anchor = calculate_anchor(state["target_price"], state["market_benchmark"])
    
    memory = NegotiationMemory()
    if state.get("initial_lsp_offer"):
        memory.add_lsp_message(f"Our initial quote is ₹{state['initial_lsp_offer']}/km.", state["initial_lsp_offer"])
        
    return {
        "current_round": 1,
        "anchor_price": anchor,
        "memory": memory,
        "last_lsp_price": state.get("initial_lsp_offer", 0.0),
        "rounds_log": []
    }

def generate_ai_message(state: NegotiationState):
    """Agent generates the next message/strategy."""
    master = MasterNegotiator()
    
    response_data = master.generate_response(
        shipment_context=state["shipment_context"],
        market_benchmark=state["market_benchmark"],
        target_price=state["target_price"],
        reservation_price=state["reservation_price"],
        competitor_prices=state["competitor_prices"],
        current_round=state["current_round"],
        max_rounds=state["max_rounds"],
        memory=state["memory"]
    )
    
    ai_message = response_data.get("message_to_lsp", "")
    strategy = response_data.get("strategy_used", "Unknown")
    
    try:
        target_counter = float(response_data.get("target_counter_price", state["anchor_price"]))
    except:
        target_counter = state["anchor_price"]
        
    state["memory"].add_ai_message(ai_message, target_counter)
    
    return {
        "last_ai_message": ai_message,
        "last_ai_target": target_counter,
        "last_strategy_used": strategy,
        "memory": state["memory"]
    }

def get_lsp_response(state: NegotiationState):
    """Simulates or fetches the LSP counterpart's message."""
    lsp = LspAgent()
    
    lsp_message = lsp.get_counter_offer(state["last_ai_message"], state["current_round"])
    
    price_match = re.search(r'(?:₹\s*|^|)(\d+(?:\.\d+)?)(?:\s*/km|\s*$)', lsp_message)
    lsp_price = float(price_match.group(1)) if price_match else state["last_lsp_price"]
    
    state["memory"].add_lsp_message(lsp_message, lsp_price)
    
    # Log the round
    round_data = {
        "round": state["current_round"],
        "strategy": state["last_strategy_used"],
        "ai_message": state["last_ai_message"],
        "target_counter": state["last_ai_target"],
        "lsp_message": lsp_message,
        "lsp_price": lsp_price
    }
    
    return {
        "last_lsp_message": lsp_message,
        "last_lsp_price": lsp_price,
        "memory": state["memory"],
        "rounds_log": [round_data] # LangGraph uses operator.add to append
    }

def evaluate_state(state: NegotiationState):
    """Evaluates the round and decides next steps."""
    decision = evaluate_round_outcome(
        state["last_ai_target"], 
        state["last_lsp_price"], 
        state["reservation_price"], 
        state["current_round"], 
        state["max_rounds"]
    )
    
    if decision["status"] == "deal_closed":
        return {"final_status": "Success", "agreed_price": state["last_lsp_price"]}
        
    if decision["status"] == "walk_away":
        return {"final_status": "Walk Away", "agreed_price": 0.0}
        
    if state["current_round"] >= state["max_rounds"]:
        return {"final_status": "Max Rounds Reached - No Deal", "agreed_price": 0.0}
        
    return {"current_round": state["current_round"] + 1, "final_status": "continue"}

def route_negotiation(state: NegotiationState):
    """Router node to determine next state."""
    if state.get("final_status") in ["Success", "Walk Away", "Max Rounds Reached - No Deal"]:
        return "end"
    return "continue"

# Build the Graph
workflow = StateGraph(NegotiationState)

workflow.add_node("init", initialize_negotiation)
workflow.add_node("ai_agent", generate_ai_message)
workflow.add_node("lsp_agent", get_lsp_response)
workflow.add_node("evaluate", evaluate_state)

workflow.set_entry_point("init")
workflow.add_edge("init", "ai_agent")
workflow.add_edge("ai_agent", "lsp_agent")
workflow.add_edge("lsp_agent", "evaluate")

workflow.add_conditional_edges(
    "evaluate",
    route_negotiation,
    {
        "continue": "ai_agent",
        "end": END
    }
)

app_graph = workflow.compile()
