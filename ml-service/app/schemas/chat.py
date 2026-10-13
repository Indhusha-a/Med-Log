from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    # True only when get_booking_guide was actually called this turn -
    # the frontend uses this to decide whether to render a "Create
    # appointment" button under the chat reply.
    show_booking_cta: bool = False