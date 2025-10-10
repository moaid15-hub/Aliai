from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Oqool API")

FRONTEND_URL = os.getenv("FRONTEND_URL", "https://oqool.net")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"ok": True}

@app.get("/")
async def root():
    return {"name": "oqool-api", "status": "running"}

# Mount your real routers/endpoints below

# Basic chat endpoint for testing
@app.post("/chat/send")
async def send_message(message: dict):
    """Basic chat endpoint for testing"""
    user_message = message.get("content", "")
    
    # Mock AI response for testing
    ai_response = f"تم استلام رسالتك: '{user_message}'. هذا رد تجريبي من الـ API المنشور على Docker."
    
    return {
        "message": {
            "id": "test-123",
            "content": ai_response,
            "role": "assistant",
            "created_at": "2025-10-10T12:00:00Z"
        }
    }