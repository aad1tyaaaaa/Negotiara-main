import os
import json
import logging
from pathlib import Path
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Resolve prompt paths relative to this file's location — works from any CWD
_PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


class NegotiationAgent:
    def __init__(self, role="SHIPPER", persona="MASTER"):
        self.role = role
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key) if self.api_key else None

        prompt_file = _PROMPTS_DIR / (
            "master_prompt.txt" if role == "SHIPPER" else "lsp_persona_prompts.txt"
        )
        format_file = _PROMPTS_DIR / "output_format_instructions.txt"

        with open(prompt_file, "r") as f:
            self.system_prompt = f.read()

        with open(format_file, "r") as f:
            self.format_instructions = f.read()

    def generate_response(self, context_data: dict, history: list) -> dict:
        if not self.client:
            logger.error("Groq client not initialized — GROQ_API_KEY is missing.")
            return {"error": "Groq client not initialized. Set GROQ_API_KEY in your .env file."}

        context_str = "\n".join([f"{k}: {v}" for k, v in context_data.items()])
        history_str = "\n".join([
            f"{m['role']}: {m.get('content', '')}" for m in history
        ])

        full_system_prompt = (
            f"You are a logistics negotiation AI agent representing the {self.role}.\n"
            f"STRATEGIC CONTEXT:\n{context_str}\n\n"
            "NEGOTIATION PHILOSOPHY (Voss & Chris Logic):\n"
            "- Apply Tactical Empathy: Validate the other party's position before countering.\n"
            "- Use Calibrated Questions: Prompt with 'How' and 'What' to encourage collaboration.\n"
            "- Use Labeling: 'It seems like reliability is a high priority for you.'\n"
            "- Goal: Reach a solution that fits within your reservation price boundaries.\n\n"
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
            logger.debug("[%s] LLM Response: %s", self.role, response_content)
            return json.loads(response_content)
        except Exception as e:
            logger.error("[%s] LLM call failed: %s", self.role, str(e))
            return {"error": str(e)}
