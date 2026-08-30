"""Structured pipeline events for analyze-site observability."""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def log_event(event: str, **fields: str | int | float | bool | None) -> None:
    extra = {"event": event}
    for k, v in fields.items():
        if v is not None:
            extra[k] = v
    logger.info(event, extra=extra)
