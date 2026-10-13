# Runs on every incoming message BEFORE it reaches Groq. Two jobs:
# catch classic prompt-injection phrasing, and catch obviously off-topic
# questions (the brief's own example: "what is 3 + 4?"). Both return a
# canned refusal string instead of raising, so the caller can tell
# "blocked" apart from "no opinion" just by checking for None.
#
# This is deliberately a dumb keyword/regex filter, not a second LLM
# call - cheaper, faster, and its behavior doesn't depend on another
# model's judgment call. The system prompt (see agent/prompts.py)
# handles the long tail of phrasing this can't anticipate; this catches
# the clear-cut cases with 100% predictability, which is what a test
# suite can actually pin down.

import re

INJECTION_PATTERNS = [
    re.compile(p, re.IGNORECASE)
    for p in [
        r"ignore (all|everything|every|the above|previous|prior)",
        r"system prompt",
        r"you are now",
        r"pretend (to be|you are)",
        r"act as (an?|the)",
        r"reveal (your|the) instructions",
        r"bypass",
        r"jailbreak",
        r"all (patient|doctor)s?.{0,20}(detail|info|record|data)",
        r"every (patient|doctor)",
    ]
]

# Keyword hints that a question is general trivia, not Med-Log-related.
OFF_TOPIC_KEYWORDS = [
    "capital of", "president of", "write me a", "translate",
    "weather", "who won", "tell me a joke", "poem", "recipe for",
]

ARITHMETIC_RE = re.compile(r"\d+\s*[\+\-\*/]\s*\d+")

# If any of these appear, the message is almost certainly about the
# app's own domain even if it also happens to contain a number or an
# off-topic-sounding word - e.g. "do I have an appointment at 3?" has a
# number in it but is clearly a real question.
DOMAIN_KEYWORDS = [
    "appointment", "doctor", "patient", "slot", "schedule",
    "book", "cancel", "reschedule", "speciality", "today",
]


def check_input(message: str) -> str | None:
    lowered = message.strip().lower()

    for pattern in INJECTION_PATTERNS:
        if pattern.search(lowered):
            return (
                "I can't follow instructions embedded in a message like that. "
                "I can help with appointments, doctors, and scheduling - what do you need?"
            )

    has_domain_word = any(word in lowered for word in DOMAIN_KEYWORDS)
    if not has_domain_word and (ARITHMETIC_RE.search(lowered) or any(k in lowered for k in OFF_TOPIC_KEYWORDS)):
        return (
            "I'm built to help with appointments, doctors, and scheduling - "
            "I can't help with general questions like that."
        )

    return None