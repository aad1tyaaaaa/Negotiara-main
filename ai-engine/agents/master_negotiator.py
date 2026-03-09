import os
import json
from groq import Groq
from dotenv import load_dotenv
from intelligence.negotiation_memory import NegotiationMemory

load_dotenv()

class MasterNegotiator:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            print("WARNING: GROQ_API_KEY not found in environment.")
        self.client = Groq(api_key=self.api_key) if self.api_key else None
        
        self._load_prompts()
        
    def _load_prompts(self):
        with open("prompts/master_prompt.txt", "r") as f:
            self.master_prompt = f.read()
        with open("prompts/output_format_instructions.txt", "r") as f:
            self.format_instructions = f.read()
            
    def generate_response(self, 
                          shipment_context: str, 
                          market_benchmark: float, 
                          target_price: float, 
                          reservation_price: float, 
                          competitor_prices: list[float], 
                          current_round: int, 
                          max_rounds: int, 
                          memory: NegotiationMemory) -> dict:
                              
        if not self.client:
            return {"error": "Groq client not initialized. Check API Key."}
            
        system_prompt = self.master_prompt.format(
            shipment_context=shipment_context,
            market_benchmark=market_benchmark,
            target_price=target_price,
            reservation_price=reservation_price,
            competitor_prices=", ".join([str(p) for p in competitor_prices]),
            previous_offers=memory.get_ai_offer_history_str(),
            previous_lsp_offers=memory.get_lsp_offer_history_str(),
            current_round=current_round,
            max_rounds=max_rounds,
            last_lsp_message=memory.get_last_lsp_message()
        )
        
        system_prompt += "\n\n" + self.format_instructions
        
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"The LSP has just sent: '{memory.get_last_lsp_message()}'. We are in round {current_round}. Apply the 5 negotiation strategies to get the best deal. Generate your JSON response."}
                ],
                model="llama3-8b-8192", 
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            output_str = response.choices[0].message.content
            return json.loads(output_str)
            
        except Exception as e:
            return {"error": str(e)}

