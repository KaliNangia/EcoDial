"""
Comprehensive unit tests for the Ecodial carbon footprint calculation engine.
Tests default values, boundary conditions, all fuel types, all diet types,
division-by-zero guards, invalid field fallbacks, and maximum input scenarios.
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


def test_calculate_all_fuel_types() -> None:
    """
    Test each fuel type produces correctly differentiated emissions.
    Ensures electric < hybrid < petrol ≈ diesel for the same distance.
    """
    base: Dict[str, Any] = {
        "car_km_per_week": 200,
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
    results: Dict[str, int] = {}
    for fuel in ["petrol", "diesel", "hybrid", "electric"]:
        test_input = base.copy()
        test_input["car_fuel"] = fuel
        result = calculate_footprint(test_input)
        results[fuel] = result["breakdown"]["transport"]

    assert results["electric"] < results["hybrid"]
    assert results["hybrid"] < results["petrol"]
    assert results["diesel"] >= results["petrol"]  # diesel slightly higher


def test_calculate_all_diet_types() -> None:
    """
    Test each diet type produces the expected annual emissions value.
    """
    expected: Dict[str, float] = {
        "heavy_meat": 3300.0,
        "medium_meat": 2500.0,
        "low_meat": 1900.0,
        "pescatarian": 1700.0,
        "vegetarian": 1500.0,
        "vegan": 1050.0,
    }
    base: Dict[str, Any] = {
        "car_km_per_week": 0,
        "car_fuel": "petrol",
        "public_transit_km_per_week": 0,
        "short_haul_flights_per_year": 0,
        "long_haul_flights_per_year": 0,
        "electricity_kwh_per_month": 0,
        "natural_gas_kwh_per_month": 0,
        "household_size": 1,
        "goods_spend_usd_per_month": 0,
        "waste_kg_per_week": 0
    }
    for diet_key, expected_val in expected.items():
        test_input = base.copy()
        test_input["diet"] = diet_key
        result = calculate_footprint(test_input)
        assert result["breakdown"]["diet"] == expected_val, f"Diet '{diet_key}' expected {expected_val}, got {result['breakdown']['diet']}"


def test_calculate_maximum_boundary_values() -> None:
    """
    Test with all inputs at their maximum allowed values.
    Ensures no overflow, no exceptions, and the total is a large but valid number.
    """
    inputs: Dict[str, Any] = {
        "car_km_per_week": 2000,
        "car_fuel": "diesel",
        "public_transit_km_per_week": 2000,
        "short_haul_flights_per_year": 50,
        "long_haul_flights_per_year": 30,
        "electricity_kwh_per_month": 5000,
        "natural_gas_kwh_per_month": 5000,
        "household_size": 1,
        "diet": "heavy_meat",
        "goods_spend_usd_per_month": 10000,
        "waste_kg_per_week": 300
    }
    result: Dict[str, Any] = calculate_footprint(inputs)
    assert result["total"] > 0
    assert isinstance(result["total"], int)
    # Should be a very large number (all max inputs)
    assert result["total"] > 50000


def test_calculate_household_division_by_zero_guard() -> None:
    """
    Test that household_size=0 does not cause ZeroDivisionError.
    The calculator should clamp to at least 1.
    """
    inputs: Dict[str, Any] = {
        "car_km_per_week": 0,
        "car_fuel": "petrol",
        "public_transit_km_per_week": 0,
        "short_haul_flights_per_year": 0,
        "long_haul_flights_per_year": 0,
        "electricity_kwh_per_month": 200,
        "natural_gas_kwh_per_month": 100,
        "household_size": 0,
        "diet": "vegan",
        "goods_spend_usd_per_month": 0,
        "waste_kg_per_week": 0
    }
    result: Dict[str, Any] = calculate_footprint(inputs)
    assert result["breakdown"]["home"] > 0
    # With household_size clamped to 1, it should equal the full home energy
    expected_home = round((200 * 12 * 0.450 + 100 * 12 * 0.183) / 1)
    assert result["breakdown"]["home"] == expected_home


def test_calculate_missing_fields_use_defaults() -> None:
    """
    Test that missing input fields gracefully fall back to 0 via dict.get().
    """
    inputs: Dict[str, Any] = {
        "car_fuel": "electric",
        "diet": "vegan",
        "household_size": 1
    }
    result: Dict[str, Any] = calculate_footprint(inputs)
    assert result["total"] == 1050  # Only vegan diet contributes
    assert result["breakdown"]["transport"] == 0
    assert result["breakdown"]["home"] == 0
    assert result["breakdown"]["consumption"] == 0


def test_calculate_flight_emissions_correct() -> None:
    """
    Test that flight emission calculations use correct per-trip distance factors.
    """
    inputs: Dict[str, Any] = {
        "car_km_per_week": 0,
        "car_fuel": "petrol",
        "public_transit_km_per_week": 0,
        "short_haul_flights_per_year": 5,
        "long_haul_flights_per_year": 2,
        "electricity_kwh_per_month": 0,
        "natural_gas_kwh_per_month": 0,
        "household_size": 1,
        "diet": "vegan",
        "goods_spend_usd_per_month": 0,
        "waste_kg_per_week": 0
    }
    result: Dict[str, Any] = calculate_footprint(inputs)
    expected_short = 5 * 1100.0 * 0.158
    expected_long = 2 * 6500.0 * 0.150
    assert result["breakdown"]["transport"] == round(expected_short + expected_long)
