# 🌱 EcoDial Carbon Calculation Guide

This guide explains the calculations and environmental science behind the **EcoDial Carbon Footprint Tracker**. It outlines exactly which parameters you adjust, what emission factors are applied, and how they convert to your annual carbon score.

---

## 📅 Time Normalization
To keep comparisons consistent, all inputs (weekly driving, monthly utility bills, annual flights) are normalized to **annual kilograms of CO2-equivalent (kg CO2e)**.
* **Weeks per Year**: $52$
* **Months per Year**: $12$
* **Conversion to Tonnes**: $\text{Total kg CO2e} \div 1000 = \text{Tonnes CO2e / year}$

---

## 🚗 Category 1: Transportation

### 1. Personal Car Travel
The carbon footprint of driving depends on your drivetrain/fuel type. Emissions are calculated by multiplying your weekly distance by 52 weeks, and then by the specific fuel factor.

$$\text{Annual kg CO2e} = \text{Car km/week} \times 52 \times \text{Fuel Factor}$$

| Car Fuel Type | Emission Factor (kg CO2e / km) | Scientific Context / Source |
| :--- | :--- | :--- |
| **Petrol** | `0.170` | Average petrol car. DEFRA 2023. |
| **Diesel** | `0.171` | Slightly higher density emissions. DEFRA 2023. |
| **Hybrid** | `0.120` | Leverages partial battery recaptures. DEFRA 2023. |
| **Electric** | `0.047` | Includes grid-generation losses. DEFRA 2023. |

### 2. Public Transit
Covers train, bus, and light rail travel.
$$\text{Annual kg CO2e} = \text{Transit km/week} \times 52 \times 0.060\text{ kg/km}$$
* **Emission Factor**: `0.060 kg CO2e / passenger-km` (DEFRA averages).

### 3. Aviation / Flights
Short-haul flights are more carbon-intensive per kilometer because takeoffs consume significant fuel. Flights are calculated using standard representative trip distances:

$$\text{Annual kg CO2e} = (\text{Short flights/yr} \times 1100\text{ km} \times 0.158\text{ kg/km}) + (\text{Long flights/yr} \times 6500\text{ km} \times 0.150\text{ kg/km})$$

* **Short-haul (one-way < 3 hours)**: `1,100 km` flight distance at `0.158 kg CO2e / passenger-km`.
* **Long-haul (one-way > 3 hours)**: `6,500 km` flight distance at `0.150 kg CO2e / passenger-km`.
* *Note: Multipliers include radiative forcing (high-altitude ozone impacts).*

---

## 🏡 Category 2: Home Energy
Home energy emissions represent utility grids. Because households share heating and appliances, **emissions are divided by the number of people living in the home**.

$$\text{Annual kg CO2e} = \frac{(\text{Electricity kWh/month} \times 12 \times 0.450) + (\text{Natural Gas kWh/month} \times 12 \times 0.183)}{\text{Household Size}}$$

| Energy Type | Emission Factor | Scientific Context / Source |
| :--- | :--- | :--- |
| **Electricity** | `0.450 kg CO2e / kWh` | Representative global average for electricity grids (IEA). |
| **Natural Gas** | `0.183 kg CO2e / kWh` | Carbon content of natural gas heating (DEFRA). |

---

## 🍽️ Category 3: Diet & Food
Food production footprints are based on agricultural lifecycle emissions (livestock, transport, packaging). Diet scores are deterministic, annual constants based on diet style:

$$\text{Annual kg CO2e} = \text{Diet Constant}$$

| Diet Type | Annual Footprint (kg CO2e) | Scientific Context / Source |
| :--- | :--- | :--- |
| **Heavy Meat** | `3,300` | High beef/lamb consumption (Scarborough et al.). |
| **Average Meat** | `2,500` | Moderate meat intake (Scarborough et al.). |
| **Low Meat** | `1,900` | Limited meat, poultry-centric (Scarborough et al.). |
| **Pescatarian** | `1,700` | Seafood and vegetarian diet (Scarborough et al.). |
| **Vegetarian** | `1,500` | Dairy/eggs, no meat (Scarborough et al.). |
| **Vegan** | `1,050` | Fully plant-based agricultural footprint (Scarborough et al.). |

---

## 🛍️ Category 4: Consumption & Waste

### 1. Consumer Goods Spending
Estimates emissions embedded in manufacturing, shipping, and retail of clothes, electronics, and goods.
$$\text{Annual kg CO2e} = \text{USD spend/month} \times 12 \times 0.40\text{ kg/\$}$$
* **Emission Factor**: `0.40 kg CO2e per USD spent` (EXIOBASE environment input/output index).

### 2. Landfill Waste
Calculates methane and decomposition footprints from solid landfill trash.
$$\text{Annual kg CO2e} = \text{Waste kg/week} \times 52 \times 0.580\text{ kg/kg}$$
* **Emission Factor**: `0.580 kg CO2e per kg of waste` (EPA WARM system average).

---

## 🏁 Carbon Baselines & Target Benchmarks
Your total annual score is compared against two standardized global indicators to calculate your status badges:

1. **Sustainable Carbon Target**: `2,000 kg CO2e / year` (2.0 tonnes)
   * *This represents the target per-capita carbon allocation to help guide reduction efforts and transition towards an eco-friendly lifestyle.*
2. **Global Average Footprint**: `4,800 kg CO2e / year` (4.8 tonnes)
   * *The current average per-capita emission level worldwide.*

### 🚨 System Status Board Lights
* 🟢 **Green status**: Footprint is **$\le 2.0$ tonnes** (Sustainable).
* 🟡 **Yellow status**: Footprint is **between $2.0$ and $4.8$ tonnes** (Moderate).
* 🔴 **Red status**: Footprint **exceeds $4.8$ tonnes** (High).

---

## 🏆 Boundary Scenarios: Best vs. Worst Case

Here is how the boundaries of the calculator scale, showing the absolute greenest path (Best Case) and the heaviest emission path (Worst Case) based on the dial limits.

### 🟢 1. Best-Case Scenario (Minimum Carbon Output)
Designed for a zero-emissions commuter with a shared zero-waste household and a fully plant-based diet.

* **Driving**: $0\text{ km/week}$ $\rightarrow$ $0\text{ kg}$
* **Transit**: $0\text{ km/week}$ $\rightarrow$ $0\text{ kg}$
* **Flights**: $0\text{ trips/year}$ $\rightarrow$ $0\text{ kg}$
* **Home Energy**: $0\text{ kWh/month}$ (Electricity & Gas) shared across $15$ occupants $\rightarrow$ $0\text{ kg}$
* **Diet**: Vegan $\rightarrow$ $1,050\text{ kg}$
* **Goods Spend**: $\$0/\text{month}$ $\rightarrow$ $0\text{ kg}$
* **Landfill Waste**: $0\text{ kg/week}$ $\rightarrow$ $0\text{ kg}$
* **Total Score**: **`1,050 kg CO2e / year`** (or **`1.05 tonnes`**)
* *Status*: **🟢 Sustainable / Eco Champion**

---

### 🔴 2. Worst-Case Scenario (Maximum Carbon Output)
A single occupant who drives heavily in a diesel vehicle, flies constantly, has high utility waste, spends heavily, and eats a meat-heavy diet.

* **Driving**: $2,000\text{ km/week}$ diesel ($0.171\text{ factor}$) $\times 52$ $\rightarrow$ $17,784\text{ kg}$
* **Transit**: $2,000\text{ km/week}$ ($0.060\text{ factor}$) $\times 52$ $\rightarrow$ $6,240\text{ kg}$
* **Flights (Short)**: $50\text{ flights/year} \times 1,100\text{ km} \times 0.158$ $\rightarrow$ $8,690\text{ kg}$
* **Flights (Long)**: $30\text{ flights/year} \times 6,500\text{ km} \times 0.150$ $\rightarrow$ $29,250\text{ kg}$
* **Home Energy**: $5,000\text{ kWh/mo}$ electricity ($0.450$) + $5,000\text{ kWh/mo}$ gas ($0.183$) $\times 12$ months, single occupant ($1$) $\rightarrow$ $37,980\text{ kg}$
* **Diet**: Heavy Meat $\rightarrow$ $3,300\text{ kg}$
* **Goods Spend**: $\$10,000/\text{month}$ ($0.40$) $\times 12$ $\rightarrow$ $48,000\text{ kg}$
* **Landfill Waste**: $300\text{ kg/week}$ ($0.580$) $\times 52$ $\rightarrow$ $9,048\text{ kg}$
* **Total Score**: **`160,292 kg CO2e / year`** (or **`160.29 tonnes`**)
* *Status*: **🔴 High Emissions (80x Sustainable target)**
