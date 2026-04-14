import logging
from typing import Any
from pydantic import BaseModel, Field
from openai import OpenAI
from app.config import settings
from app.services.scoring import RawSignals

logger = logging.getLogger(__name__)

class AIInsight(BaseModel):
    strategic_overview: str = Field(..., description="A professional 2-sentence synthesis of the site's viability.")
    the_edge: str = Field(..., description="What makes this spot unique or a competitive advantage.")
    the_blindspot: str = Field(..., description="A hidden risk or negative factor to consider.")
    the_power_move: str = Field(..., description="One specific, actionable piece of advice to maximize success.")

class AIInsights(BaseModel):
    insights: AIInsight
    confidence_score: float = Field(..., description="How confident the AI is in this analysis (0.0 to 1.0).")

async def get_ai_consultant_insights(
    signals: RawSignals, 
    business_type: str, 
    total_score: int, 
    recommendation: str
) -> AIInsights | None:
    """
    Acts as a world-class urban planner and business strategist to provide
    nuanced, actionable insights based on the site's raw signals.
    """
    if not settings.openai_api_key:
        logger.warning("OpenAI API key not configured. Skipping AI insights.")
        return None

    client = OpenAI(api_key=settings.openai_api_key)

    # Construct a high-density prompt
    prompt = f"""
    You are a world-class NYC Urban Planner and SMB Business Strategist. 
    Analyze the following site data for a new {business_type} and provide a strategic critique.

    SITE DATA:
    - Total Viability Score: {total_score}/100 ({recommendation})
    - Population: {signals.population if signals.population else 'Unknown'}
    - Median Household Income: ${signals.median_income if signals.median_income else 'Unknown'}
    - Competitor Count (within radius): {signals.competitor_count}
    - Complementary Businesses: {signals.complementary_count}
    - Commercial POI Density: {signals.commercial_poi_count}
    - Transit: {signals.subway_within_800m} subways, {signals.bus_within_400m} bus stops.
    - Nearest Subway: {signals.nearest_subway_m if signals.nearest_subway_m else 'Unknown'}m
    - Vacancy Rate: {signals.vacancy_pct if signals.vacancy_pct else 'Unknown'}%
    - College Education Rate: {signals.pct_college_educated if signals.pct_college_educated else 'Unknown'}%
    - Median Age: {signals.median_age if signals.median_age else 'Unknown'}

    Your goal is to move beyond the numbers and provide 'consultant-level' intuition.
    Focus on the RELATIONSHIP between these numbers.
    
    Return the response as a valid JSON object matching the following structure:
    {{
      "insights": {{
        "strategic_overview": "...",
        "the_edge": "...",
        "the_blindspot": "...",
        "the_power_move": "..."
      }},
      "confidence_score": 0.95
    }}
    """

    try:
        response = client.chat.completions.create(
            model=settings.ai_model,
            messages=[{"role": "system", "content": "You are a professional urban planner. Respond only in JSON."},
                      {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        import json
        data = json.loads(response.choices[0].message.content)
        return AIInsights(**data)
    except Exception as e:
        logger.error(f"AI Consultant error: {e}")
        return None
