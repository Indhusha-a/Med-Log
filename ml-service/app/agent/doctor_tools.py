# The doctor's tool set - deliberately smaller than the patient's, and
# with zero overlap in what it can see: nothing here can return another
# doctor's data, let alone a patient's.

from datetime import date

from langchain_core.tools import StructuredTool
from pydantic import BaseModel

from app.agent.backend_client import BackendClient


class _NoArgs(BaseModel):
    pass


def build_doctor_tools(token: str) -> list[StructuredTool]:
    client = BackendClient(token)

    def get_my_appointments_today() -> str:
        today = date.today().isoformat()
        appts = client.get(
            "/appointments/doctor/mine", params={"status": "scheduled", "date_from": today, "date_to": today}
        )
        if not appts:
            return "You have no appointments scheduled for today."
        lines = [f"- {a['appointment_type']} with {a['patient']['first_name']} at {a['slot']['start_time']}" for a in appts]
        return "Today's appointments:\n" + "\n".join(lines)

    def count_booked_slots_today() -> str:
        # A "booked slot" and a "scheduled appointment" are the same
        # thing one-for-one (see models/appointment.py's unique
        # slot_id), so this reuses the same backend call as the
        # function above instead of needing a separate endpoint.
        today = date.today().isoformat()
        appts = client.get(
            "/appointments/doctor/mine", params={"status": "scheduled", "date_from": today, "date_to": today}
        )
        return f"You have {len(appts)} booked time-slot(s) today."

    return [
        StructuredTool.from_function(
            func=get_my_appointments_today, name="get_my_appointments_today",
            description="Get the current doctor's own appointments scheduled for today.", args_schema=_NoArgs,
        ),
        StructuredTool.from_function(
            func=count_booked_slots_today, name="count_booked_slots_today",
            description="Count how many of the current doctor's time-slots are booked today.", args_schema=_NoArgs,
        ),
    ]