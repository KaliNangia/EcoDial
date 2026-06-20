# Carbon Footprint Calculator Math Module

WEEKS_PER_YEAR = 52
MONTHS_PER_YEAR = 12

CAR_FACTORS_PER_KM = {
    "petrol": 0.170,
    "diesel": 0.171,
    "hybrid": 0.120,
    "electric": 0.047
}

PUBLIC_TRANSIT_PER_KM = 0.060
FLIGHT_SHORT_HAUL_PER_KM = 0.158
FLIGHT_LONG_HAUL_PER_KM = 0.150

SHORT_HAUL_TRIP_KM = 1100.0
LONG_HAUL_TRIP_KM = 6500.0

ELECTRICITY_PER_KWH = 0.450
NATURAL_GAS_PER_KWH = 0.183

DIET_ANNUAL_KG = {
    "heavy_meat": 3300.0,
    "medium_meat": 2500.0,
    "low_meat": 1900.0,
    "pescatarian": 1700.0,
    "vegetarian": 1500.0,
    "vegan": 1050.0
}

GOODS_PER_USD_MONTHLY = 0.40
WASTE_PER_KG = 0.580

def calculate_footprint(inputs: dict) -> dict:
    """
    Computes annual carbon footprint in kg CO2e based on user inputs.
    """
    car_fuel = inputs.get("car_fuel", "petrol")
    car_factor = CAR_FACTORS_PER_KM.get(car_fuel, 0.170)
    
    car_emissions = inputs.get("car_km_per_week", 0) * WEEKS_PER_YEAR * car_factor
    transit_emissions = inputs.get("public_transit_km_per_week", 0) * WEEKS_PER_YEAR * PUBLIC_TRANSIT_PER_KM
    flight_emissions = (
        inputs.get("short_haul_flights_per_year", 0) * SHORT_HAUL_TRIP_KM * FLIGHT_SHORT_HAUL_PER_KM
    ) + (
        inputs.get("long_haul_flights_per_year", 0) * LONG_HAUL_TRIP_KM * FLIGHT_LONG_HAUL_PER_KM
    )
    transport = car_emissions + transit_emissions + flight_emissions
    
    electricity = inputs.get("electricity_kwh_per_month", 0) * MONTHS_PER_YEAR * ELECTRICITY_PER_KWH
    gas = inputs.get("natural_gas_kwh_per_month", 0) * MONTHS_PER_YEAR * NATURAL_GAS_PER_KWH
    
    # Ensure household_size is at least 1 to avoid division by zero
    household_size = max(1, inputs.get("household_size", 1))
    home = (electricity + gas) / household_size
    
    diet_key = inputs.get("diet", "medium_meat")
    diet = DIET_ANNUAL_KG.get(diet_key, 2500.0)
    
    goods = inputs.get("goods_spend_usd_per_month", 0) * MONTHS_PER_YEAR * GOODS_PER_USD_MONTHLY
    waste = inputs.get("waste_kg_per_week", 0) * WEEKS_PER_YEAR * WASTE_PER_KG
    consumption = goods + waste
    
    total = transport + home + diet + consumption
    
    return {
        "breakdown": {
            "transport": round(transport),
            "home": round(home),
            "diet": round(diet),
            "consumption": round(consumption)
        },
        "total": round(total)
    }
