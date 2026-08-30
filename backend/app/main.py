import logging
import asyncio

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import (
    AddressSuggestResponse,
    AddressSuggestion,
    AnalyzeSiteRequest,
    AnalyzeSiteResponse,
    CompareSitesRequest,
    CompareSitesResponse,
)
from app.routers import trends as trends_router
from app.routers import zoning as zoning_router
from app.services import ai_consultant
from app.services.address_suggest import suggest_addresses
from app.services.analyze_site import analyze_site

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SpotCore AI API", version="0.1.0")
app.include_router(trends_router.router)
app.include_router(zoning_router.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "spotcore-ai"}


@app.get("/suggest-address", response_model=AddressSuggestResponse)
async def get_suggest_address(
    q: str = Query(..., min_length=1, max_length=280),
    limit: int = Query(6, ge=1, le=10),
) -> AddressSuggestResponse:
    rows = await suggest_addresses(q.strip(), limit)
    return AddressSuggestResponse(
        suggestions=[AddressSuggestion(**r) for r in rows],
        source="photon",
    )


@app.post("/analyze-site", response_model=AnalyzeSiteResponse)
async def post_analyze_site(body: AnalyzeSiteRequest) -> AnalyzeSiteResponse:
    return await analyze_site(body.address, body.business_type, body.budget, body.radius_m)


@app.post("/compare-sites", response_model=CompareSitesResponse)
async def post_compare_sites(body: CompareSitesRequest) -> CompareSitesResponse:
    # Run both analyses concurrently for speed
    site_a_task = analyze_site(body.address_a, body.business_type, body.budget, body.radius_m)
    site_b_task = analyze_site(body.address_b, body.business_type, body.budget, body.radius_m)
    
    site_a, site_b = await asyncio.gather(site_a_task, site_b_task)
    
    # Determine winner by total score
    winner_address = site_a.location.label if site_a.total_score >= site_b.total_score else site_b.location.label
    
    # Get AI-driven reason for the win
    reason = await ai_consultant.get_comparison_insight(site_a, site_b, body.business_type)
    
    return CompareSitesResponse(
        site_a=site_a,
        site_b=site_b,
        comparison_winner=winner_address,
        winner_reason=reason
    )
