from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from api.negotiation_routes import router as negotiation_router
import uvicorn
import os

app = FastAPI(title="AI Negotiation Engine")

ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "http://localhost:4000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(negotiation_router, prefix="/api")

# Serve a static HTML file for the demo UI
@app.get("/")
async def serve_frontend():
    return FileResponse("static/index.html")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
