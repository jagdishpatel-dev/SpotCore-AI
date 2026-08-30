from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    ZoningAnswerResponse,
    ZoningMapRequest,
    ZoningMapResponse,
    ZoningQuestionRequest,
)
from app.services import ai_consultant, zoning_geo, zoning_rag

logger = logging.getLogger(__name__)

router = APIRouter(tags=["zoning"])

# Pilot scope: only Austin's zoning polygon dataset is wired up.
_MAP_SUPPORTED_JURISDICTIONS = {"austin_tx"}


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


@router.post("/zoning-map", response_model=ZoningMapResponse)
async def post_zoning_map(body: ZoningMapRequest) -> ZoningMapResponse:
    if body.jurisdiction not in _MAP_SUPPORTED_JURISDICTIONS:
        raise HTTPException(
            status_code=404,
            detail=f"No zoning map data available for jurisdiction={body.jurisdiction!r} yet.",
        )
    features = await zoning_geo.fetch_zoning_polygons(
        lat=body.lat,
        lon=body.lon,
        radius_m=body.radius_m,
        business_query=body.business_type,
        jurisdiction=body.jurisdiction,
    )
    return ZoningMapResponse(jurisdiction=body.jurisdiction, business_type=body.business_type, features=features)
