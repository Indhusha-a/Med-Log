# The one endpoint this whole service exists for.

from fastapi import APIRouter, Depends
from langchain_core.messages import HumanMessage

from app.agent.graph import build_graph
from app.core.deps import get_caller
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(data: ChatRequest, caller: tuple[str, int, str] = Depends(get_caller)):
    role, user_id, token = caller
    graph = build_graph(role, token)
    # thread_id is how LangGraph's checkpointer finds this specific
    # conversation's history again on the next message - one thread
    # per (role, user) pair, so a patient and a doctor sharing the same
    # numeric id never collide.
    config = {"configurable": {"thread_id": f"{role}:{user_id}"}}

    result = graph.invoke({"messages": [HumanMessage(content=data.message)]}, config=config)
    final_message = result["messages"][-1]

    show_booking_cta = any(
        getattr(m, "name", None) == "get_booking_guide" for m in result["messages"] if m.type == "tool"
    )

    return ChatResponse(reply=final_message.content, show_booking_cta=show_booking_cta)