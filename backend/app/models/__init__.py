# Importing this package pulls in every model class, which is what
# registers them on Base's metadata. main.py and seed.py both do
# `import app.models` purely for this side effect, before calling
# Base.metadata.create_all() - skip this import and create_all() would
# silently create nothing, since it would see zero known tables.

from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.admin import Admin
from app.models.time_slot import TimeSlot
from app.models.appointment import Appointment

__all__ = ["User", "Patient", "Doctor", "Admin", "TimeSlot", "Appointment"]
