import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class LspAgent:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key) if self.api_key else None
        
        with open("prompts/lsp_persona_prompts.txt", "r") as f:
            self.system_prompt = f.read()
            
    def get_counter_offer(self, ai_message: str, current_round: int) -> str:
        if not self.client:
            return "Groq API key missing. Mocking LSP: I cannot accept this rate, maybe ₹1 higher?"
            
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": self.system_prompt + f"\n\nWe are in round {current_round}. React to the shipper's message."},
                    {"role": "user", "content": ai_message}
                ],
                model="llama3-8b-8192",
                temperature=0.8
            )
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            return f"Error from LSP LLM: {str(e)}"
