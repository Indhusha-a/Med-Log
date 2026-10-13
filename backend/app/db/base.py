# The declarative base every SQLAlchemy model inherits from. On its own
# it does nothing - its job is just to be the one shared registry that
# Base.metadata.create_all() in main.py/seed.py walks to find every table.

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
