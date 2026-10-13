from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import chat

app = FastAPI(title="Med-Log ML Service")

app.add_middleware(
    CORSMiddleware,
    # localhost and 127.0.0.1 are different origins to a browser even
    # though they're the same machine - both are listed so it doesn't
    # matter which one the frontend happens to be opened at.
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)


@app.get("/")
def root():
    return {"status": "Med-Log ML service running"}