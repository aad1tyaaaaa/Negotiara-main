import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class NegotiationAgent:
    def __init__(self, role="SHIPPER", persona="MASTER"):
        self.role = role
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key) if self.api_key else None
        
        prompt_file = "prompts/master_prompt.txt" if role == "SHIPPER" else "prompts/lsp_persona_prompts.txt"
        with open(prompt_file, "r") as f:
            self.system_prompt = f.read()
            
        with open("prompts/output_format_instructions.txt", "r") as f:
            self.format_instructions = f.read()

    def generate_response(self, context_data: dict, history: list) -> dict:
        if not self.client:
            return {"error": "Groq client not initialized"}

        # Build context string
        context_str = "\n".join([f"{k}: {v}" for k, v in context_data.items()])
        history_str = "\n".join([f"{m['role']}: {m['content']}" for m in history])

        full_system_prompt = (
            f"You are a logistics negotiation AI agent representing the {self.role}.\n"
            f"STRATEGIC CONTEXT:\n{context_str}\n\n"
            "NEGOTIATION PHILOSOPHY (Voss & Chris Logic):\n"
            "- Apply Tactical Empathy: Validate the other party's position before countering.\n"
            "- Use Calibrated Questions: Prompt with 'How' and 'What' to encourage collaboration (e.g., 'How can we make this delivery schedule work for both of us?').\n"
            "- Use Labeling: 'It seems like reliability is a high priority for you.'\n"
            "- Goal: Reach a 'How' solution that fits within your reservation price boundaries.\n\n"
            f"{self.system_prompt}\n\n"
            f"{self.format_instructions}"
        )

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": full_system_prompt},
                    {"role": "user", "content": f"CONVERSATION HISTORY:\n{history_str}\n\nGenerate your next move."}
                ],
                model="llama3-8b-8192",
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            response_content = response.choices[0].message.content
            print(f"\nDEBUG [{self.role}] RESPONSE:\n{response_content}\n")
            return json.loads(response_content)
        except Exception as e:
            print(f"DEBUG ERROR [{self.role}]: {str(e)}")
            return {"error": str(e)}
