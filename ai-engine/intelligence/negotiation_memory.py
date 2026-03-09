class NegotiationMemory:
    def __init__(self):
        self.ai_offers = []
        self.lsp_offers = []
        self.history = [] # For general conversation log
        
    def add_ai_message(self, message: str, price_offered: float = None):
        self.history.append({"role": "AI", "message": message, "price": price_offered})
        if price_offered is not None:
            self.ai_offers.append(price_offered)

    def add_lsp_message(self, message: str, price_offered: float = None):
        self.history.append({"role": "LSP", "message": message, "price": price_offered})
        if price_offered is not None:
            self.lsp_offers.append(price_offered)
            
    def get_last_lsp_message(self) -> str:
        for entry in reversed(self.history):
            if entry["role"] == "LSP":
                return entry["message"]
        return "No previous message."
        
    def get_ai_offer_history_str(self) -> str:
        return ", ".join([str(p) for p in self.ai_offers]) if self.ai_offers else "None"

    def get_lsp_offer_history_str(self) -> str:
        return ", ".join([str(p) for p in self.lsp_offers]) if self.lsp_offers else "None"
