// Core Constants and Calculation Specifications for EcoDial

const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? (window.location.port === "8080" ? "http://localhost:8000" : "")
  : "";

const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

// Local calculation factors in case of offline server fallback
const CAR_FACTORS_PER_KM = {
  petrol: 0.170,
  diesel: 0.171,
  hybrid: 0.120,
  electric: 0.047
};

const PUBLIC_TRANSIT_PER_KM = 0.060;
const FLIGHT_SHORT_HAUL_PER_KM = 0.158;
const FLIGHT_LONG_HAUL_PER_KM = 0.150;

const SHORT_HAUL_TRIP_KM = 1100.0;
const LONG_HAUL_TRIP_KM = 6500.0;

const ELECTRICITY_PER_KWH = 0.450;
const NATURAL_GAS_PER_KWH = 0.183;

const DIET_ANNUAL_KG = {
  heavy_meat: 3300.0,
  medium_meat: 2500.0,
  low_meat: 1900.0,
  pescatarian: 1700.0,
  vegetarian: 1500.0,
  vegan: 1050.0
};

const GOODS_PER_USD_MONTHLY = 0.40;
const WASTE_PER_KG = 0.580;

const GLOBAL_AVG_ANNUAL_KG = 4800.0;
const SUSTAINABLE_TARGET_ANNUAL_KG = 2000.0;

const DIET_LADDER = ["heavy_meat", "medium_meat", "low_meat", "pescatarian", "vegetarian", "vegan"];

// Parameter Specifications
const PARAM_SPECS = {
  car_km_per_week: { label: "Car Driving", min: 0, max: 2000, step: 10, unit: "km / week", category: "transport" },
  car_fuel: { label: "Car Fuel Type", isCategoric: true, options: ["petrol", "diesel", "hybrid", "electric"], category: "transport" },
  public_transit_km_per_week: { label: "Public Transit", min: 0, max: 2000, step: 10, unit: "km / week", category: "transport" },
  short_haul_flights_per_year: { label: "Short Flights", min: 0, max: 50, step: 1, unit: "trips / year", category: "transport" },
  long_haul_flights_per_year: { label: "Long Flights", min: 0, max: 30, step: 1, unit: "trips / year", category: "transport" },
  electricity_kwh_per_month: { label: "Electricity", min: 0, max: 5000, step: 20, unit: "kWh / month", category: "home" },
  natural_gas_kwh_per_month: { label: "Natural Gas", min: 0, max: 5000, step: 20, unit: "kWh / month", category: "home" },
  household_size: { label: "Household Size", min: 1, max: 15, step: 1, unit: "people", category: "home" },
  diet: { label: "Primary Diet", isCategoric: true, options: ["heavy_meat", "medium_meat", "low_meat", "pescatarian", "vegetarian", "vegan"], category: "lifestyle" },
  goods_spend_usd_per_month: { label: "Goods Spending", min: 0, max: 10000, step: 50, unit: "USD / month", category: "lifestyle" },
  waste_kg_per_week: { label: "Landfill Waste", min: 0, max: 300, step: 1, unit: "kg / week", category: "lifestyle" }
};
