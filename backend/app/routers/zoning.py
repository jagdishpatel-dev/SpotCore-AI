from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import ZoningAnswerResponse, ZoningQuestionRequest
from app.services import ai_consultant, zoning_rag

logger = logging.getLogger(__name__)

router = APIRouter(tags=["zoning"])


@router.post("/zoning-ask", response_model=ZoningAnswerResponse)
async def post_zoning_ask(body: ZoningQuestionRequest) -> ZoningAnswerResponse:
    if not zoning_rag.index_exists(body.jurisdiction):
        raise HTTPException(
            status_code=503,
            detail=(
                f"No zoning index built for jurisdiction={body.jurisdiction!r}. "
                f"Run: python -m app.services.zoning_rag --jurisdiction {body.jurisdiction}"
            ),
        )
    return await ai_consultant.get_zoning_answer(
        question=body.question,
        jurisdiction=body.jurisdiction,
        zoning_district=body.zoning_district,
        address=body.address,
    )
