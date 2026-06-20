from app.calculator import calculate_footprint

def test_calculate_footprint_defaults():
    # Test with typical default values
    inputs = {
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
    result = calculate_footprint(inputs)
    assert "total" in result
    assert "breakdown" in result
    assert result["total"] > 0
    assert result["breakdown"]["transport"] > 0
    assert result["breakdown"]["home"] > 0
    assert result["breakdown"]["diet"] == 2500
    assert result["breakdown"]["consumption"] > 0

def test_calculate_footprint_zero_inputs():
    # Test with minimum possible inputs
    inputs = {
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
    result = calculate_footprint(inputs)
    assert result["breakdown"]["transport"] == 0
    assert result["breakdown"]["home"] == 0
    assert result["breakdown"]["diet"] == 1050
    assert result["breakdown"]["consumption"] == 0
    assert result["total"] == 1050

def test_calculate_footprint_household_division():
    # Test division of home energy footprint by household size
    inputs_1 = {
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
    inputs_2 = inputs_1.copy()
    inputs_2["household_size"] = 2
    
    result_1 = calculate_footprint(inputs_1)
    result_2 = calculate_footprint(inputs_2)
    
    assert result_2["breakdown"]["home"] == round(result_1["breakdown"]["home"] / 2)

def test_calculate_footprint_invalid_fuel():
    # Test fallback fuel type calculation
    inputs = {
        "car_km_per_week": 100,
        "car_fuel": "unknown_fuel_type",
        "household_size": 1,
        "diet": "vegan"
    }
    # It should fall back to petrol factor (0.170)
    result = calculate_footprint(inputs)
    expected_car_emissions = 100 * 52 * 0.170
    assert result["breakdown"]["transport"] == round(expected_car_emissions)
