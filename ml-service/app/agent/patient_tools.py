# The patient's tool set. Built fresh per-request via build_patient_tools()
# rather than as module-level globals, because each tool closes over one
# specific caller's token - two concurrent patients must never share a
# BackendClient, or one could end up making calls "as" the other.

from datetime import date

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

from app.agent.backend_client import BackendClient


class _NoArgs(BaseModel):
    pass


class _DoctorSlotsArgs(BaseModel):
    doctor_id: int = Field(..., description="Numeric id of the doctor, as returned by list_available_doctors_today")


def build_patient_tools(token: str) -> list[StructuredTool]:
    client = BackendClient(token)

    def get_my_appointments_today() -> str:
        today = date.today().isoformat()
        appts = client.get("/appointments/me", params={"status": "scheduled", "date_from": today, "date_to": today})
        if not appts:
            return "You have no appointments scheduled for today."
        lines = [
            f"- {a['appointment_type']} with Dr. {a['doctor']['first_name']} {a['doctor']['last_name']} "
            f"at {a['slot']['start_time']}"
            for a in appts
        ]
        return "Today's appointments:\n" + "\n".join(lines)

    def get_booking_guide() -> str:
        # The frontend watches for this exact tool having been called
        # (see routers/chat.py's show_booking_cta) to decide whether to
        # render a "Create appointment" button under the reply.
        return (
            "To book an appointment: pick a doctor, choose one of their open time slots, then "
            "confirm. I can show you today's available doctors right now if you'd like - just ask."
        )

    def list_available_doctors_today() -> str:
        today = date.today().isoformat()
        doctors = client.get("/doctors")
        available = [d for d in doctors if client.get(f"/doctors/{d['id']}/slots", params={"on_date": today})]
        if not available:
            return "No doctors have open slots today."
        lines = [f"- {d['first_name']} {d['last_name']} (id={d['id']}), {d['speciality']}" for d in available]
        return "Doctors with open slots today:\n" + "\n".join(lines)

    def get_doctor_slots_for_doctor(doctor_id: int) -> str:
        today = date.today().isoformat()
        slots = client.get(f"/doctors/{doctor_id}/slots", params={"on_date": today})
        if not slots:
            return "That doctor has no open slots today."
        lines = [f"- {s['start_time']} to {s['end_time']} (slot id={s['id']})" for s in slots]
        return "Open slots today:\n" + "\n".join(lines)

    return [
        StructuredTool.from_function(
            func=get_my_appointments_today, name="get_my_appointments_today",
            description="Get the current patient's appointments scheduled for today.", args_schema=_NoArgs,
        ),
        StructuredTool.from_function(
            func=get_booking_guide, name="get_booking_guide",
            description="Explain how to book an appointment, step by step.", args_schema=_NoArgs,
        ),
        StructuredTool.from_function(
            func=list_available_doctors_today, name="list_available_doctors_today",
            description="List doctors who have at least one open slot today. Does not include slot times.",
            args_schema=_NoArgs,
        ),
        StructuredTool.from_function(
            func=get_doctor_slots_for_doctor, name="get_doctor_slots_for_doctor",
            description="Get today's open time slots for one specific doctor, by numeric doctor id.",
            args_schema=_DoctorSlotsArgs,
        ),
    ]