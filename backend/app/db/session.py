# Sets up the actual database connection. `engine` is the one connection
# pool for the whole app; `SessionLocal` is a factory that get_db() (in
# core/deps.py) calls once per request to get a fresh Session.

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# pool_pre_ping checks a pooled connection is still alive before handing
# it out, so a DB restart doesn't surface as a confusing mid-request error.
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
