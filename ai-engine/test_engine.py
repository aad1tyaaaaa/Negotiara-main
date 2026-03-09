from engine.negotiation_loop import execute_negotiation
import json

def test_negotiation():
    print("🚀 Starting Advanced Negotiation Simulation...")
    
    context = {
        "shipment": {
            "origin": "Mumbai",
            "destination": "Delhi",
            "cargo_type": "Pharmaceuticals",
            "distance": 1400,
            "weight": 1200
        },
        "shipper_metrics": {
            "budget": 1000,
            "initial_offer": 850
        },
        "carrier_metrics": {
            "min_price": 900,
            "initial_offer": 1150
        },
        "market_signals": {
            "fuel_spike": 1.05,
            "carrier_availability": 0.9  # Tight market
        }
    }

    result = execute_negotiation(context, max_rounds=3)
    
    print("\n--- Negotiation Results ---")
    print(f"Status: {result['status']}")
    print(f"Agreed Price: ${result['agreed_price']}")
    print(f"Intrinsic Value: ${result['market_context']['intrinsic_value']}")
    print(f"Market Benchmark: ${result['market_context']['market_benchmark']}")
    
    print("\n--- Round Breakdown ---")
    for r in result['rounds']:
        print(f"Round {r['round']}: Shipper ${r['shipper_offer']} | Carrier ${r['carrier_offer']}")
        print(f" Shipper Utility: {r['utilities']['shipper_utility']}")
        print(f" Carrier Utility: {r['utilities']['carrier_utility']}")
        print("-" * 30)

    print("\n✨ Simulation Complete.")

if __name__ == "__main__":
    test_negotiation()
