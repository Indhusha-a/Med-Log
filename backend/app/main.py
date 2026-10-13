# The app's entry point: builds the FastAPI instance, wires in CORS so
# the React frontend (on a different port) can actually call it, creates
# the database tables on startup, and mounts every router. Run with
# `uvicorn app.main:app --reload`.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import app.models  # noqa: F401  (registers all models before create_all runs)
from app.db.base import Base
from app.db.session import engine
from app.routers import admin, appointments, auth, doctors, patients, slots

app = FastAPI(title="Med-Log API")

# Without this, the browser blocks every request from the frontend's
# dev server as cross-origin. Add the frontend's real origin here once
# it's deployed anywhere other than localhost.
app.add_middleware(
    CORSMiddleware,
    # Both localhost and 127.0.0.1 are listed because browsers treat them
    # as different origins even though they resolve to the same machine -
    # whichever one the frontend actually happens to be opened at must be
    # in this list, or every request fails as a CORS rejection that looks
    # to the browser (and to axios) exactly like the server being down.
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


@app.on_event("startup")
def on_startup():
    # Creates any table that doesn't exist yet, based on every model
    # app.models pulled in above. There's no Alembic in this project -
    # see the artifact's Design notes for why that's a deliberate
    # scope decision, not an oversight. Changing a model after tables
    # already exist means dropping and recreating the database by hand.
    Base.metadata.create_all(bind=engine)


# Each router owns one URL prefix (/auth, /patients, /doctors, /slots,
# /appointments, /admin) - see each router module for what it covers.
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(doctors.router)
app.include_router(slots.router)
app.include_router(appointments.router)
app.include_router(admin.router)


@app.get("/")
def root():
    # Just a liveness check for whoever opens the API root in a browser.
    return {"status": "Med-Log API running"}
