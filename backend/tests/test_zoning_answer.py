"""
get_zoning_answer(): the reported status must come from the rules table, never from the LLM.

Retrieval and the LLM call are stubbed so these run offline.
"""

import asyncio
from types import SimpleNamespace

import pytest

from app.services import ai_consultant


def _fake_completion(text: str):
    return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=text))], model="stub")


@pytest.fixture
def no_retrieval(monkeypatch):
    excerpts = [{"citation": "25-2-491", "title": "Permitted, Conditional, and Prohibited Uses", "text": "...", "score": 0.9}]
    monkeypatch.setattr(ai_consultant.zoning_rag, "retrieve", lambda *a, **k: excerpts)


def _ask(question: str, district: str | None):
    return asyncio.run(ai_consultant.get_zoning_answer(question=question, zoning_district=district))


def test_status_comes_from_table_even_if_llm_disagrees(no_retrieval, monkeypatch):
    monkeypatch.setattr(ai_consultant, "_chat_completion", lambda **k: _fake_completion("Yes, it's permitted. " * 5))
    result = _ask("I want to open a bar here", "CS-1")
    assert result.status == "conditional"
    assert result.matched_use == "Cocktail Lounge"
    assert result.table_value == "C"
    assert result.status_reason == "table"


def test_status_is_returned_when_llm_fails(no_retrieval, monkeypatch):
    def boom(**_):
        raise TimeoutError("provider stalled")

    monkeypatch.setattr(ai_consultant, "_chat_completion", boom)
    result = _ask("Can I open a liquor store?", "CH")
    assert result.status == "permitted"
    assert "couldn't be generated" in result.answer
    assert result.citations[0].citation == "25-2-491"


def test_unmatched_business_is_unclear(no_retrieval, monkeypatch):
    monkeypatch.setattr(ai_consultant, "_chat_completion", lambda **k: _fake_completion("Explanation. " * 10))
    result = _ask("Can I open a food truck park?", "GR")
    assert result.status == "unclear"
    assert result.status_reason == "no_confident_match"
    assert result.matched_use is None


def test_prompt_states_status_as_fixed(no_retrieval):
    messages, pre = ai_consultant.build_zoning_messages("Can I open a bar?", [], zoning_district="CBD")
    assert pre["status"] == "permitted"
    assert "Status : PERMITTED" in messages[1]["content"]
    assert "Never contradict" in messages[0]["content"]
