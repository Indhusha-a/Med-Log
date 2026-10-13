# Shared pytest fixtures. db_session hands every test a brand-new
# in-memory SQLite database - fast, fully isolated between tests, and
# never touches the real Postgres database the app runs against.

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.models  # noqa: F401
from app.db.base import Base


@pytest.fixture()
def db_session():
    # A fresh engine (and therefore a fresh, empty database) every time
    # this fixture runs - tests never see leftover data from another test.
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(bind=engine)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()
