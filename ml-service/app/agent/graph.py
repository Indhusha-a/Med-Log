# The LangGraph wiring: guardrail -> agent (Groq, tool-calling) -> tools
# -> guardrail -> done, looping back to the agent after any tool call
# until it has enough to answer in plain text.
#
# build_graph() is called fresh per request (cheap - it's just wiring
# closures together) because the tool set is role-specific and each
# tool closes over one caller's JWT. The checkpointer below is the one
# thing that IS shared across requests/processes-lifetime - that's what
# makes conversation memory actually persist between calls to a
# freshly-built graph, since LangGraph keys memory by thread_id in the
# checkpointer, not by which Python graph object you call invoke() on.

from langchain_core.messages import AIMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode

from app.agent.doctor_tools import build_doctor_tools
from app.agent.patient_tools import build_patient_tools
from app.agent.prompts import build_system_prompt
from app.core.config import settings
from app.guardrails.input_guardrail import check_input
from app.guardrails.output_guardrail import sanitize_output

# One shared in-memory checkpointer for the whole process - see the
# "checkpointer" design note at the top of this artifact for why
# in-memory (resets on restart) is the right tradeoff here.
_checkpointer = MemorySaver()


def build_graph(role: str, token: str):
    tools = build_patient_tools(token) if role == "patient" else build_doctor_tools(token)
    llm = ChatGroq(model=settings.GROQ_MODEL, groq_api_key=settings.GROQ_API_KEY, temperature=0)
    llm_with_tools = llm.bind_tools(tools)
    system_prompt = build_system_prompt(role)

    def guardrail_input_node(state: MessagesState):
        last = state["messages"][-1]
        blocked_reply = check_input(last.content)
        if blocked_reply is not None:
            return {"messages": [AIMessage(content=blocked_reply)]}
        return {}

    def after_input_guardrail(state: MessagesState):
        # If the guardrail node just appended a refusal, the last
        # message is now an AIMessage - stop here. Otherwise the last
        # message is still the original HumanMessage - go to the agent.
        return END if isinstance(state["messages"][-1], AIMessage) else "agent"

    def agent_node(state: MessagesState):
        messages = [SystemMessage(content=system_prompt), *state["messages"]]
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}

    def after_agent(state: MessagesState):
        last = state["messages"][-1]
        return "tools" if getattr(last, "tool_calls", None) else "guardrail_output"

    def guardrail_output_node(state: MessagesState):
        last = state["messages"][-1]
        clean = sanitize_output(last.content)
        if clean != last.content:
            return {"messages": [AIMessage(content=clean)]}
        return {}

    graph = StateGraph(MessagesState)
    graph.add_node("guardrail_input", guardrail_input_node)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", ToolNode(tools))
    graph.add_node("guardrail_output", guardrail_output_node)

    graph.set_entry_point("guardrail_input")
    graph.add_conditional_edges("guardrail_input", after_input_guardrail, {END: END, "agent": "agent"})
    graph.add_conditional_edges("agent", after_agent, {"tools": "tools", "guardrail_output": "guardrail_output"})
    graph.add_edge("tools", "agent")
    graph.add_edge("guardrail_output", END)

    return graph.compile(checkpointer=_checkpointer)