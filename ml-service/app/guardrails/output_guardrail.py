# Runs on the agent's final answer before it's returned. Looks for the
# CANARY token that agent/prompts.py embeds in the system prompt - if
# the model's reply ever contains it, that's strong evidence a
# prompt-leak attempt actually worked (the model repeated something
# from its own instructions), so the real reply is swapped for a
# refusal instead of being sent back.

from app.agent.prompts import CANARY


def sanitize_output(text: str) -> str:
    if CANARY in text:
        return "I can't share that information."
    return text