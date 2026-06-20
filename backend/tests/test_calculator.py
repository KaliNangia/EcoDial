"""
Unit tests for the Ecodial carbon footprint calculation engine.
Tests boundary values, typical configurations, division scenarios, and invalid fields.
"""

from typing import Dict, Any
from app.calculator import calculate_footprint


def test_calculate_footprint_defaults() -> None:
    """
    Test the calculator engine with standard default values.
    Ensures calculations complete successfully and all breakdown metrics are present.
    """
    inputs: Dict[str, Any] = {
        "car_km_per_week": 150,
        "car_fuel": "petrol",
        "public_transit_km_per_week": 80,
        "short_haul_flights_per_year": 2,
        "long_haul_flights_per_year": 0,
        "electricity_kwh_per_month": 250,
        "natural_gas_kwh_per_month": 300,
        "household_size": 2,
        "diet": "medium_meat",
        "goods_spend_usd_per_month": 300,
        "waste_kg_per_week": 10
    }
    result: Dict[str, Any] = calculate_footprint(inputs)
    assert "total" in result
    assert "breakdown" in result
    assert result["total"] > 0
    assert result["breakdown"]["transport"] > 0
    assert result["breakdown"]["home"] > 0
    assert result["breakdown"]["diet"] == 2500
    assert result["breakdown"]["consumption"] > 0


def test_calculate_footprint_zero_inputs() -> None:
    """
    Test the calculator engine with zero value inputs.
    Verifies that the engine outputs minimal values (diet fallback) without exceptions.
    """
    inputs: Dict[str, Any] = {
        "car_km_per_week": 0,
        "car_fuel": "petrol",
        "public_transit_km_per_week": 0,
        "short_haul_flights_per_year": 0,
        "long_haul_flights_per_year": 0,
        "electricity_kwh_per_month": 0,
        "natural_gas_kwh_per_month": 0,
        "household_size": 1,
        "diet": "vegan",
        "goods_spend_usd_per_month": 0,
        "waste_kg_per_week": 0
    }
    result: Dict[str, Any] = calculate_footprint(inputs)
    assert result["breakdown"]["transport"] == 0
    assert result["breakdown"]["home"] == 0
    assert result["breakdown"]["diet"] == 1050
    assert result["breakdown"]["consumption"] == 0
    assert result["total"] == 1050


def test_calculate_footprint_household_division() -> None:
    """
    Test division of home energy footprint by household size.
    Ensures that sharing home resources divides carbon contributions proportionally.
    """
    inputs_1: Dict[str, Any] = {
        "car_km_per_week": 0,
        "public_transit_km_per_week": 0,
        "short_haul_flights_per_year": 0,
        "long_haul_flights_per_year": 0,
        "electricity_kwh_per_month": 500,
        "natural_gas_kwh_per_month": 500,
        "household_size": 1,
        "diet": "vegan",
        "goods_spend_usd_per_month": 0,
        "waste_kg_per_week": 0
    }
    inputs_2: Dict[str, Any] = inputs_1.copy()
    inputs_2["household_size"] = 2
    
    result_1: Dict[str, Any] = calculate_footprint(inputs_1)
    result_2: Dict[str, Any] = calculate_footprint(inputs_2)
    
    assert result_2["breakdown"]["home"] == round(result_1["breakdown"]["home"] / 2)


def test_calculate_footprint_invalid_fuel() -> None:
    """
    Test fallback fuel type logic during calculation.
    Ensures unknown parameters fall back gracefully to default factors.
    """
    inputs: Dict[str, Any] = {
        "car_km_per_week": 100,
        "car_fuel": "unknown_fuel_type",
        "household_size": 1,
        "diet": "vegan"
    }
    # It should fall back to petrol factor (0.170)
    result: Dict[str, Any] = calculate_footprint(inputs)
    expected_car_emissions: float = 100 * 52 * 0.170
    assert result["breakdown"]["transport"] == round(expected_car_emissions)
