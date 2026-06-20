# Pydantic Schemas for Input Validation and API Serialization

from pydantic import BaseModel, Field
from typing import Literal

class FootprintInputs(BaseModel):
    car_km_per_week: float = Field(default=150.0, ge=0.0, le=2000.0, description="Weekly driving in km")
    car_fuel: Literal["petrol", "diesel", "hybrid", "electric"] = Field(default="petrol", description="Car fuel type")
    public_transit_km_per_week: float = Field(default=80.0, ge=0.0, le=2000.0, description="Weekly public transit in km")
    short_haul_flights_per_year: int = Field(default=2, ge=0, le=50, description="Short trips per year")
    long_haul_flights_per_year: int = Field(default=0, ge=0, le=30, description="Long trips per year")
    electricity_kwh_per_month: float = Field(default=250.0, ge=0.0, le=5000.0, description="Monthly electricity in kWh")
    natural_gas_kwh_per_month: float = Field(default=300.0, ge=0.0, le=5000.0, description="Monthly natural gas in kWh")
    household_size: int = Field(default=2, ge=1, le=15, description="Number of household members")
    diet: Literal["heavy_meat", "medium_meat", "low_meat", "pescatarian", "vegetarian", "vegan"] = Field(default="medium_meat", description="Primary diet profile")
    goods_spend_usd_per_month: float = Field(default=300.0, ge=0.0, le=10000.0, description="Monthly consumer spend in USD")
    waste_kg_per_week: float = Field(default=10.0, ge=0.0, le=300.0, description="Weekly waste in kg")

class LeaderboardMember(BaseModel):
    id: str = Field(..., description="Unique user or seed identifier")
    name: str = Field(..., min_length=1, max_length=50, description="Member name")
    score: float = Field(..., ge=0.0, description="Leaderboard score in annual tonnes")
    isSelf: bool = Field(default=False, description="Flag representing the local user")
