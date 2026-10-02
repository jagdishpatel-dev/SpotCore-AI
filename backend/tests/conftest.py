import json
from pathlib import Path

import pytest

GOLDEN_PATH = Path(__file__).resolve().parent.parent / "evals" / "zoning_golden.json"


def load_golden_cases() -> list[dict]:
    return json.loads(GOLDEN_PATH.read_text(encoding="utf-8"))["cases"]


@pytest.fixture(scope="session")
def golden_cases() -> list[dict]:
    return load_golden_cases()
