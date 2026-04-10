import logging

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import AddressSuggestResponse, AddressSuggestion, AnalyzeSiteRequest, AnalyzeSiteResponse
from app.routers import trends as trends_router
from app.services.address_suggest import suggest_addresses
from app.services.analyze_site import analyze_site

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GeoScore AI API", version="0.1.0")
app.include_router(trends_router.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "geoscore-ai"}


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
