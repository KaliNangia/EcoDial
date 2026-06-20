// EcoDial Carbon Footprint Awareness Application Logic (Modular Client App)

// ==========================================
// 1. Core State, API Base URL and Constants
// ==========================================

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

// Default User Inputs State
let userInputs = {
  car_km_per_week: 150,
  car_fuel: "petrol",
  public_transit_km_per_week: 80,
  short_haul_flights_per_year: 2,
  long_haul_flights_per_year: 0,
  electricity_kwh_per_month: 250,
  natural_gas_kwh_per_month: 300,
  household_size: 2,
  diet: "medium_meat",
  goods_spend_usd_per_month: 300,
  waste_kg_per_week: 10
};

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

let activeParamId = "car_km_per_week";
let audioEnabled = true;
let isDragging = false;

// Web Audio API click synthesiser
let audioCtx = null;

function playClickSound() {
  if (!audioEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.012);
    
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.012);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.012);
  } catch (e) {
    console.warn("Web Audio failure: ", e);
  }
}

// ==========================================
// 2. DOM Elements
// ==========================================

const dialInteractive = document.getElementById("dial-interactive");
const dialKnob = document.getElementById("dial-knob-element");
const dialProgressArc = document.getElementById("dial-progress-arc");
const dialTicksContainer = document.getElementById("dial-ticks-container");
const dialCategoryLabel = document.getElementById("dial-category-label");
const dialValueLabel = document.getElementById("dial-value-label");
const dialUnitLabel = document.getElementById("dial-unit-label");
const dialMinValLabel = document.getElementById("dial-min-val-label");
const dialMaxValLabel = document.getElementById("dial-max-val-label");

const dialBtnDec = document.getElementById("dial-btn-dec");
const dialBtnInc = document.getElementById("dial-btn-inc");
const toggleSoundBtn = document.getElementById("toggle-sound-btn");
const soundStatusText = document.getElementById("sound-status-text");
const soundIconOn = toggleSoundBtn.querySelector(".sound-on");
const soundIconOff = toggleSoundBtn.querySelector(".sound-off");


const scoreValue = document.getElementById("score-value");
const impactBadge = document.getElementById("impact-badge");
const comparisonUserVal = document.getElementById("comparison-user-val");
const userFootprintFill = document.getElementById("user-footprint-fill");

const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanes = document.querySelectorAll(".tab-pane");
const paramCards = document.querySelectorAll(".param-card");

const breakdownFillTransport = document.getElementById("breakdown-fill-transport");
const breakdownValTransport = document.getElementById("breakdown-val-transport");
const breakdownFillHome = document.getElementById("breakdown-fill-home");
const breakdownValHome = document.getElementById("breakdown-val-home");
const breakdownFillDiet = document.getElementById("breakdown-fill-diet");
const breakdownValDiet = document.getElementById("breakdown-val-diet");
const breakdownFillConsumption = document.getElementById("breakdown-fill-consumption");
const breakdownValConsumption = document.getElementById("breakdown-val-consumption");

const insightsSummaryText = document.getElementById("insights-summary-text");
const recommendationsList = document.getElementById("recommendations-list");

const saveSnapshotBtn = document.getElementById("save-snapshot-btn");
const resetPlatformBtn = document.getElementById("reset-platform-btn");
const historyTableBody = document.getElementById("history-table-body");

// Community Elements
const friendNameInput = document.getElementById("friend-name-input");
const friendScoreInput = document.getElementById("friend-score-input");
const addFriendBtn = document.getElementById("add-friend-btn");
const statusLightsGrid = document.getElementById("status-lights-grid");
const leaderboardTableBody = document.getElementById("leaderboard-table-body");

// Eco-Passport Elements
const ecocardCardElement = document.getElementById("ecocard-card-element");
const cardHolderNameInput = document.getElementById("card-holder-name");
const cardFootprintVal = document.getElementById("card-footprint-val");
const cardStatusVal = document.getElementById("card-status-val");
const downloadCardBtn = document.getElementById("download-card-btn");

// ==========================================
// 3. Dial Interaction Math & SVG Rendering
// ==========================================

const SVG_PERIMETER = 534;
const ARC_ANGLE_MAX = 270;

function renderTicks() {
  dialTicksContainer.innerHTML = "";
  const numTicks = 31;
  for (let i = 0; i < numTicks; i++) {
    const tick = document.createElement("div");
    tick.className = "dial-tick";
    const tickAngle = 135 + (i / (numTicks - 1)) * ARC_ANGLE_MAX;
    tick.style.transform = `rotate(${tickAngle}deg)`;
    dialTicksContainer.appendChild(tick);
  }
}

function updateTicksHighlight(ratio) {
  const ticks = dialTicksContainer.querySelectorAll(".dial-tick");
  const activeTicksCount = Math.round(ratio * (ticks.length - 1));
  ticks.forEach((tick, idx) => {
    if (idx <= activeTicksCount) {
      tick.classList.add("active");
    } else {
      tick.classList.remove("active");
    }
  });
}

function updateAllCardVisuals() {
  Object.keys(PARAM_SPECS).forEach((paramId) => {
    const spec = PARAM_SPECS[paramId];
    const value = userInputs[paramId];
    const displayValSpan = document.getElementById(`val-${paramId}`);
    if (displayValSpan) {
      displayValSpan.textContent = typeof value === "number" ? value.toLocaleString() : value.replace("_", " ");
    }
  });
}

function updateDialVisuals() {
  const spec = PARAM_SPECS[activeParamId];
  const value = userInputs[activeParamId];
  
  let ratio = 0;
  if (spec.isCategoric) {
    const idx = spec.options.indexOf(value);
    ratio = idx / (spec.options.length - 1);
    
    dialValueLabel.style.fontSize = "1.2rem";
    dialValueLabel.textContent = value.replace("_", " ");
    dialUnitLabel.textContent = "option";
    
    // Update Start/End labels
    dialMinValLabel.textContent = spec.options[0].replace("_", " ");
    dialMaxValLabel.textContent = spec.options[spec.options.length - 1].replace("_", " ");
  } else {
    ratio = (value - spec.min) / (spec.max - spec.min);
    dialValueLabel.style.fontSize = "1.5rem";
    dialValueLabel.textContent = value.toLocaleString();
    dialUnitLabel.textContent = spec.unit;
    
    // Update Start/End labels
    dialMinValLabel.textContent = spec.min.toLocaleString();
    dialMaxValLabel.textContent = spec.max.toLocaleString();
  }
  
  dialCategoryLabel.textContent = spec.label;
  
  const rotation = -135 + ratio * ARC_ANGLE_MAX;
  dialKnob.style.transform = `rotate(${rotation}deg)`;
  
  const arcLength = SVG_PERIMETER * (ARC_ANGLE_MAX / 360);
  const fillOffset = SVG_PERIMETER - (ratio * arcLength);
  dialProgressArc.style.strokeDashoffset = fillOffset;
  
  updateTicksHighlight(ratio);
  
  const displayValSpan = document.getElementById(`val-${activeParamId}`);
  if (displayValSpan) {
    displayValSpan.textContent = typeof value === "number" ? value.toLocaleString() : value.replace("_", " ");
  }

  dialInteractive.setAttribute("aria-valuenow", typeof value === "number" ? value : 0);
  dialInteractive.setAttribute("aria-valuetext", String(value).replace("_", " "));
}



function updateCalculations() {
  if (isDragging) {
    // Compute locally during active drags for zero latency and minimal network overhead
    const result = runCalculation(userInputs);
    renderCalculationResult(result);
  } else {
    // Sync with the backend API for secure data verification
    calculateAndRender();
  }
}

function handleDialInteraction(e) {
  const dialRect = dialInteractive.getBoundingClientRect();
  const cx = dialRect.left + dialRect.width / 2;
  const cy = dialRect.top + dialRect.height / 2;
  
  const clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;
  const clientY = (e.touches && e.touches.length > 0) ? e.touches[0].clientY : e.clientY;
  
  const dx = clientX - cx;
  const dy = clientY - cy;
  
  let angle = Math.atan2(dy, dx) * 180 / Math.PI;
  angle = (angle + 360) % 360;
  
  let normAngle = (angle - 135 + 360) % 360;
  
  if (normAngle > 285) {
    normAngle = normAngle > 322 ? 0 : ARC_ANGLE_MAX;
  }
  
  const ratio = Math.max(0, Math.min(1, normAngle / ARC_ANGLE_MAX));
  const spec = PARAM_SPECS[activeParamId];
  let newValue;
  
  if (spec.isCategoric) {
    const idx = Math.round(ratio * (spec.options.length - 1));
    newValue = spec.options[idx];
  } else {
    newValue = spec.min + ratio * (spec.max - spec.min);
    newValue = Math.round(newValue / spec.step) * spec.step;
    newValue = Math.max(spec.min, Math.min(spec.max, newValue));
  }
  
  if (userInputs[activeParamId] !== newValue) {
    userInputs[activeParamId] = newValue;
    playClickSound();
    updateDialVisuals();
    updateCalculations();
  }
}

function initDialDrag() {
  const startDrag = (e) => {
    isDragging = true;
    handleDialInteraction(e);
    e.preventDefault();
  };
  
  const dragMove = (e) => {
    if (!isDragging) return;
    handleDialInteraction(e);
    if (e.cancelable) {
      e.preventDefault();
    }
  };
  
  const stopDrag = () => {
    if (isDragging) {
      isDragging = false;
      calculateAndRender();
    }
  };
  
  dialInteractive.addEventListener("mousedown", startDrag);
  window.addEventListener("mousemove", dragMove);
  window.addEventListener("mouseup", stopDrag);
  
  dialInteractive.addEventListener("touchstart", startDrag, { passive: false });
  window.addEventListener("touchmove", dragMove, { passive: false });
  window.addEventListener("touchend", stopDrag);
  
  dialInteractive.addEventListener("dragstart", (e) => e.preventDefault());
}

function adjustParam(direction) {
  const spec = PARAM_SPECS[activeParamId];
  let value = userInputs[activeParamId];
  
  if (spec.isCategoric) {
    const currentIdx = spec.options.indexOf(value);
    let nextIdx = currentIdx + direction;
    if (nextIdx >= 0 && nextIdx < spec.options.length) {
      userInputs[activeParamId] = spec.options[nextIdx];
      playClickSound();
    }
  } else {
    let newValue = value + direction * spec.step;
    newValue = Math.max(spec.min, Math.min(spec.max, newValue));
    if (newValue !== value) {
      userInputs[activeParamId] = newValue;
      playClickSound();
    }
  }
  updateDialVisuals();
  updateCalculations();
}

dialInteractive.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowRight") {
    adjustParam(1);
    e.preventDefault();
  } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
    adjustParam(-1);
    e.preventDefault();
  }
});

toggleSoundBtn.addEventListener("click", () => {
  audioEnabled = !audioEnabled;
  if (audioEnabled) {
    soundIconOn.classList.remove("hidden");
    soundIconOff.classList.add("hidden");
    soundStatusText.textContent = "Audio Click: ON";
    playClickSound();
  } else {
    soundIconOn.classList.add("hidden");
    soundIconOff.classList.remove("hidden");
    soundStatusText.textContent = "Audio Click: MUTED";
  }
});

dialBtnDec.addEventListener("click", () => adjustParam(-1));
dialBtnInc.addEventListener("click", () => adjustParam(1));

// ==========================================
// 4. Client Fallback Footprint & Insights Logic
// ==========================================

function runCalculation(inputs) {
  const carFactor = CAR_FACTORS_PER_KM[inputs.car_fuel];
  const carEmissions = inputs.car_km_per_week * WEEKS_PER_YEAR * carFactor;
  const transitEmissions = inputs.public_transit_km_per_week * WEEKS_PER_YEAR * PUBLIC_TRANSIT_PER_KM;
  const flightEmissions = (inputs.short_haul_flights_per_year * SHORT_HAUL_TRIP_KM * FLIGHT_SHORT_HAUL_PER_KM) +
                         (inputs.long_haul_flights_per_year * LONG_HAUL_TRIP_KM * FLIGHT_LONG_HAUL_PER_KM);
  const transport = carEmissions + transitEmissions + flightEmissions;
  
  const electricity = inputs.electricity_kwh_per_month * MONTHS_PER_YEAR * ELECTRICITY_PER_KWH;
  const gas = inputs.natural_gas_kwh_per_month * MONTHS_PER_YEAR * NATURAL_GAS_PER_KWH;
  const home = (electricity + gas) / inputs.household_size;
  
  const diet = DIET_ANNUAL_KG[inputs.diet];
  
  const goods = inputs.goods_spend_usd_per_month * MONTHS_PER_YEAR * GOODS_PER_USD_MONTHLY;
  const waste = inputs.waste_kg_per_week * WEEKS_PER_YEAR * WASTE_PER_KG;
  const consumption = goods + waste;
  
  const total = transport + home + diet + consumption;
  
  return {
    breakdown: {
      transport: Math.round(transport),
      home: Math.round(home),
      diet: Math.round(diet),
      consumption: Math.round(consumption)
    },
    total: Math.round(total)
  };
}

function generateInsights(inputs, breakdown, totalKg) {
  const recommendations = [];
  const sortedCategories = Object.keys(breakdown).sort((a, b) => breakdown[b] - breakdown[a]);
  
  sortedCategories.forEach((category) => {
    const amount = breakdown[category];
    
    if (category === "transport" && amount > 0) {
      const carAnnualKm = inputs.car_km_per_week * WEEKS_PER_YEAR;
      const carEmissions = carAnnualKm * CAR_FACTORS_PER_KM[inputs.car_fuel];
      const flightEmissions = (inputs.short_haul_flights_per_year * SHORT_HAUL_TRIP_KM * FLIGHT_SHORT_HAUL_PER_KM) +
                              (inputs.long_haul_flights_per_year * LONG_HAUL_TRIP_KM * FLIGHT_LONG_HAUL_PER_KM);
      
      if ((inputs.short_haul_flights_per_year + inputs.long_haul_flights_per_year) > 0 && flightEmissions > carEmissions) {
        recommendations.push({
          category: "transport",
          action: "Replace one or more flights per year with rail or video calls, and combine trips to halve aviation emissions.",
          savings: Math.round(0.5 * amount)
        });
      } else if (inputs.car_km_per_week > 0 && inputs.car_fuel !== "electric") {
        const currentCar = carAnnualKm * CAR_FACTORS_PER_KM[inputs.car_fuel];
        const electricCar = carAnnualKm * CAR_FACTORS_PER_KM.electric;
        const savings = Math.round(currentCar - electricCar);
        if (savings > 0) {
          recommendations.push({
            category: "transport",
            action: "Shift short car trips to walking, cycling or public transit, and consider an electric vehicle for the rest.",
            savings: savings
          });
        }
      } else {
        recommendations.push({
          category: "transport",
          action: "Carpool or use public transit for routine journeys to cut transport emissions.",
          savings: Math.round(0.2 * amount)
        });
      }
    }
    
    if (category === "home" && amount > 0) {
      recommendations.push({
        category: "home",
        action: "Switch to a renewable electricity tariff and improve insulation/thermostat settings to cut roughly a third of home energy.",
        savings: Math.round(0.33 * amount)
      });
    }
    
    if (category === "diet") {
      const idx = DIET_LADDER.indexOf(inputs.diet);
      if (idx < DIET_LADDER.length - 1) {
        const target = DIET_LADDER[idx + 1];
        const savings = Math.round(DIET_ANNUAL_KG[inputs.diet] - DIET_ANNUAL_KG[target]);
        if (savings > 0) {
          recommendations.push({
            category: "diet",
            action: `Shift toward a ${target.replace("_", " ")} diet — even a few plant-based days each week helps significantly.`,
            savings: savings
          });
        }
      }
    }
    
    if (category === "consumption" && amount > 0) {
      recommendations.push({
        category: "consumption",
        action: "Buy less and choose durable, second-hand or repairable goods, and reduce waste by composting and recycling.",
        savings: Math.round(0.25 * amount)
      });
    }
  });
  
  const totalTonnes = (totalKg / 1000).toFixed(2);
  const targetTonnes = (SUSTAINABLE_TARGET_ANNUAL_KG / 1000).toFixed(1);
  let summary = "";
  
  if (totalKg <= SUSTAINABLE_TARGET_ANNUAL_KG) {
    summary = `Your footprint is ${totalTonnes} t CO2e/yr — at or below the sustainable target of ${targetTonnes} t. Keep it up!`;
  } else {
    const over = ((totalKg - SUSTAINABLE_TARGET_ANNUAL_KG) / 1000).toFixed(2);
    summary = `Your footprint is ${totalTonnes} t CO2e/yr, about ${over} t above the target of ${targetTonnes} t. Target these actions for reductions.`;
  }
  
  return {
    summary: summary,
    recommendations: recommendations.slice(0, 4)
  };
}

function getStatusData(totalKg) {
  let statusText = "High Emitted";
  let statusEmoji = "(>_<)";
  let badgeClass = "badge badge-warning";
  
  if (totalKg <= SUSTAINABLE_TARGET_ANNUAL_KG) {
    statusText = "Sustainable";
    statusEmoji = "(^_^)";
    badgeClass = "badge badge-sustainable";
  } else if (totalKg <= GLOBAL_AVG_ANNUAL_KG) {
    statusText = "Moderate";
    statusEmoji = "(-_-)";
    badgeClass = "badge badge-moderate";
  }
  
  return { statusText, statusEmoji, badgeClass };
}

// ==========================================
// 5. REST API Client Integrations & Rendering
// ==========================================

async function calculateAndRender() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userInputs)
    });
    if (!response.ok) throw new Error("Calculation API failed");
    
    const result = await response.json();
    renderCalculationResult(result);
  } catch (e) {
    console.warn("FastAPI Server unavailable. Falling back to offline client-side calculation models: ", e);
    const result = runCalculation(userInputs);
    renderCalculationResult(result);
  }
}

function renderCalculationResult(result) {
  const totalTonnes = result.total / 1000;
  
  // Render main score
  scoreValue.textContent = totalTonnes.toFixed(2);
  comparisonUserVal.textContent = `${totalTonnes.toFixed(1)} t`;
  
  // Update passport display values in real time
  cardFootprintVal.textContent = `${totalTonnes.toFixed(2)} t`;
  
  // Set footprint badges using shared helper function
  const { statusText, statusEmoji, badgeClass } = getStatusData(result.total);
  
  impactBadge.textContent = statusText === "Sustainable" ? "Sustainable 🌱" : `${statusText} Impact ⚡`;
  impactBadge.className = badgeClass;
  
  cardStatusVal.innerHTML = `${statusEmoji} ${statusText}`;
  cardStatusVal.className = "ecocard-status";
  
  // Render comparison tracker bar
  const globalProportion = Math.min(130, (result.total / GLOBAL_AVG_ANNUAL_KG) * 100);
  userFootprintFill.style.width = `${globalProportion}%`;
  
  if (result.total > GLOBAL_AVG_ANNUAL_KG) {
    userFootprintFill.classList.add("over-avg");
  } else {
    userFootprintFill.classList.remove("over-avg");
  }
  
  // Render category breakdown chart (each category scales absolute relative to 6.0 tonnes)
  const maxCategoryVal = 6000;
  
  const transportPct = Math.min(100, (result.breakdown.transport / maxCategoryVal) * 100);
  breakdownFillTransport.style.width = `${transportPct}%`;
  breakdownValTransport.textContent = `${(result.breakdown.transport / 1000).toFixed(2)} t`;
  
  const homePct = Math.min(100, (result.breakdown.home / maxCategoryVal) * 100);
  breakdownFillHome.style.width = `${homePct}%`;
  breakdownValHome.textContent = `${(result.breakdown.home / 1000).toFixed(2)} t`;
  
  const dietPct = Math.min(100, (result.breakdown.diet / maxCategoryVal) * 100);
  breakdownFillDiet.style.width = `${dietPct}%`;
  breakdownValDiet.textContent = `${(result.breakdown.diet / 1000).toFixed(2)} t`;
  
  const consumptionPct = Math.min(100, (result.breakdown.consumption / maxCategoryVal) * 100);
  breakdownFillConsumption.style.width = `${consumptionPct}%`;
  breakdownValConsumption.textContent = `${(result.breakdown.consumption / 1000).toFixed(2)} t`;
  
  // Render insights actions
  const insights = generateInsights(userInputs, result.breakdown, result.total);
  insightsSummaryText.textContent = insights.summary;
  
  recommendationsList.innerHTML = "";
  if (insights.recommendations.length === 0) {
    recommendationsList.innerHTML = `<li style="color: var(--muted); font-style: italic; font-size: 0.85rem;">No recommendations needed! Operating inside targets.</li>`;
  } else {
    insights.recommendations.forEach((rec) => {
      const li = document.createElement("li");
      li.className = "recommendation";
      li.innerHTML = `
        <div class="recommendation-action">${rec.action}</div>
        <div class="recommendation-saving">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
          Est. Saving: <strong>${rec.savings.toLocaleString()} kg CO2e / yr</strong>
        </div>
      `;
      recommendationsList.appendChild(li);
    });
  }

  // Update current user score in leaderboard
  updateUserLeaderboardScore(totalTonnes);
}

// Draw the Passport Card on a high-DPI canvas and trigger PNG download
function downloadEcoCardImage() {
  const holderName = cardHolderNameInput.value.trim() || "Eco Champion";
  const result = runCalculation(userInputs);
  const scoreText = `${(result.total / 1000).toFixed(2)} tonnes`;
  
  // Determine status metadata using the shared helper function
  const { statusText, statusEmoji } = getStatusData(result.total);
  const statusLabel = statusText;

  // High resolution canvas matching card graphics at 2x scale (760x440)
  const canvas = document.createElement("canvas");
  canvas.width = 760;
  canvas.height = 440;
  const ctx = canvas.getContext("2d");

  // Clip path for transparent rounded corners (matches border-radius: 16px at 2x scale)
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(0, 0, 760, 440, 32);
  } else {
    ctx.rect(0, 0, 760, 440);
  }
  ctx.clip();

  // 1. Background Gradient (linear-gradient(135deg, #0c2016 0%, #030a07 100%))
  const bgGrad = ctx.createLinearGradient(0, 0, 760, 440);
  bgGrad.addColorStop(0, "#0c2016");
  bgGrad.addColorStop(1, "#030a07");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 760, 440);

  // 2. Glowing Overlay (matches .ecocard-glow radial-gradient)
  const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 760);
  glowGrad.addColorStop(0, "rgba(16, 185, 129, 0.05)");
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, 760, 440);

  // 3. Card Outer Border - ALWAYS green
  ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 760, 440);

  // 4. Header: 🌱 ECODIAL & CARBON PASSPORT
  ctx.fillStyle = "#10b981";
  ctx.font = "bold 26px 'Outfit', Arial, sans-serif";
  ctx.shadowColor = "rgba(16, 185, 129, 0.4)";
  ctx.shadowBlur = 10;
  ctx.fillText("🌱 ECODIAL", 40, 70);
  ctx.shadowBlur = 0; // Reset shadow

  ctx.fillStyle = "#4f7962";
  ctx.font = "bold 14px 'Outfit', Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("CARBON PASSPORT", 720, 68);
  ctx.textAlign = "left";

  // Divider Line
  ctx.strokeStyle = "rgba(16, 185, 129, 0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 90);
  ctx.lineTo(720, 90);
  ctx.stroke();

  // 5. Fields & Values
  // Cardholder Label
  ctx.fillStyle = "#4b8066";
  ctx.font = "bold 12px 'Outfit', Arial, sans-serif";
  ctx.fillText("CARD HOLDER", 40, 140);

  // Cardholder Name (Value)
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px 'Outfit', Arial, sans-serif";
  ctx.fillText(holderName.toUpperCase(), 40, 180);

  // Underline under Name
  ctx.strokeStyle = "rgba(16, 185, 129, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 195);
  ctx.lineTo(720, 195);
  ctx.stroke();

  // Annual Footprint Label
  ctx.fillStyle = "#4b8066";
  ctx.font = "bold 12px 'Outfit', Arial, sans-serif";
  ctx.fillText("ANNUAL CO2e", 40, 255);

  // Annual Footprint Value
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px 'Outfit', Arial, sans-serif";
  ctx.fillText(scoreText.toUpperCase(), 40, 310);

  // Status Label
  ctx.fillStyle = "#4b8066";
  ctx.font = "bold 12px 'Outfit', Arial, sans-serif";
  ctx.fillText("STATUS", 480, 255);

  // Status Pill Badge Background - ALWAYS green
  ctx.fillStyle = "rgba(16, 185, 129, 0.1)";
  const tagWidth = 240;
  const tagHeight = 42;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(480, 272, tagWidth, tagHeight, 12);
  } else {
    ctx.rect(480, 272, tagWidth, tagHeight);
  }
  ctx.fill();
  
  // Status Pill Badge Border - ALWAYS green
  ctx.strokeStyle = "rgba(16, 185, 129, 0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Status Pill Badge Text & Emoticon - ALWAYS green
  ctx.fillStyle = "#10b981";
  ctx.font = "bold 16px 'Outfit', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${statusEmoji} ${statusLabel.toUpperCase()}`, 480 + tagWidth / 2, 298);
  ctx.textAlign = "left";

  // 6. Footer Divider Line
  ctx.strokeStyle = "rgba(16, 185, 129, 0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 355);
  ctx.lineTo(720, 355);
  ctx.stroke();

  // Footer left/right text
  ctx.fillStyle = "#4b8066";
  ctx.font = "bold 12px 'Outfit', Arial, sans-serif";
  ctx.fillText("Track & Reduce Carbon", 40, 385);

  ctx.textAlign = "right";
  ctx.fillText("2026 ISSUE", 720, 385);

  // Trigger browser download
  const link = document.createElement("a");
  link.download = `ecodial-passport-${holderName.toLowerCase().replace(/\s+/g, '-')}.png`;
  link.href = canvas.toDataURL("image/png");
  playClickSound();
  link.click();
}

downloadCardBtn.addEventListener("click", downloadEcoCardImage);

// Synchronize Passport Card input changes in real time
cardHolderNameInput.addEventListener("input", () => {
  localStorage.setItem("ecodial_cardholder_name", cardHolderNameInput.value);
  updateUserLeaderboardScore(parseFloat(scoreValue.textContent) || 0);
});

// ==========================================
// 6. Navigation Tabs & Cards Grid Logic
// ==========================================

function cycleCategoricalValue(paramId) {
  const spec = PARAM_SPECS[paramId];
  if (!spec || !spec.isCategoric) return;
  
  const currentValue = userInputs[paramId];
  const currentIdx = spec.options.indexOf(currentValue);
  const nextIdx = (currentIdx + 1) % spec.options.length;
  const nextValue = spec.options[nextIdx];
  
  userInputs[paramId] = nextValue;
  playClickSound();
}

function initNavigation() {
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabPanes.forEach((p) => p.classList.remove("active"));
      
      btn.classList.add("active");
      const targetCategory = btn.getAttribute("data-category");
      document.getElementById(`tab-${targetCategory}`).classList.add("active");
      
      const firstCard = document.querySelector(`#tab-${targetCategory} .param-card`);
      if (firstCard) {
        // Just activate it on tab change without cycling
        const firstCardId = firstCard.getAttribute("data-id");
        paramCards.forEach((c) => c.classList.remove("active"));
        firstCard.classList.add("active");
        activeParamId = firstCardId;
        updateDialVisuals();
      }
    });
  });
  
  paramCards.forEach((card) => {
    card.addEventListener("click", () => {
      const clickedParamId = card.getAttribute("data-id");
      const spec = PARAM_SPECS[clickedParamId];
      
      paramCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      activeParamId = clickedParamId;
      
      if (spec && spec.isCategoric) {
        cycleCategoricalValue(clickedParamId);
        calculateAndRender();
      } else {
        playClickSound();
      }
      updateDialVisuals();
    });
  });
}

// ==========================================
// 7. Snapshots History Layer
// ==========================================

const SNAPSHOTS_KEY = "ecodial_carbon_history";

function loadHistory() {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    const history = raw ? JSON.parse(raw) : [];
    renderHistoryTable(history);
  } catch (e) {
    console.error("Failed to load history: ", e);
  }
}

function saveSnapshot() {
  try {
    const result = runCalculation(userInputs); // Fallback safe math for snapshots
    const snapshot = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      total: (result.total / 1000).toFixed(2),
      breakdown: {
        transport: (result.breakdown.transport / 1000).toFixed(2),
        home: (result.breakdown.home / 1000).toFixed(2),
        diet: (result.breakdown.diet / 1000).toFixed(2),
        consumption: (result.breakdown.consumption / 1000).toFixed(2)
      },
      inputs: JSON.parse(JSON.stringify(userInputs))
    };
    
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    const history = raw ? JSON.parse(raw) : [];
    history.unshift(snapshot);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(history));
    
    playClickSound();
    renderHistoryTable(history);
  } catch (e) {
    console.error("Failed to save snapshot: ", e);
  }
}

function deleteHistoryEntry(id) {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    let history = raw ? JSON.parse(raw) : [];
    history = history.filter((entry) => entry.id !== id);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(history));
    playClickSound();
    renderHistoryTable(history);
  } catch (e) {
    console.error("Failed to delete snapshot: ", e);
  }
}

function loadHistoryEntry(inputs) {
  userInputs = JSON.parse(JSON.stringify(inputs));
  playClickSound();
  updateAllCardVisuals();
  updateDialVisuals();
  const spec = PARAM_SPECS[activeParamId];
  const tabBtn = document.querySelector(`.tab-btn[data-category="${spec.category}"]`);
  if (tabBtn && !tabBtn.classList.contains("active")) {
    tabBtn.click();
  }
  const card = document.getElementById(`card-${activeParamId}`);
  if (card) {
    card.classList.add("active");
  }
  calculateAndRender();
}

function renderHistoryTable(history) {
  historyTableBody.innerHTML = "";
  if (history.length === 0) {
    historyTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-history">No snapshots saved yet. Save current estimates using the button above.</td>
      </tr>
    `;
    return;
  }
  
  history.forEach((entry) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${entry.date}</td>
      <td style="font-weight: 700; color: #fff;">${entry.total} t</td>
      <td>${entry.breakdown.transport} t</td>
      <td>${entry.breakdown.home} t</td>
      <td>${entry.breakdown.diet} t</td>
      <td>${entry.breakdown.consumption} t</td>
      <td style="text-align: right; white-space: nowrap;">
        <button class="btn-load-entry btn-delete-entry" style="color: var(--primary); margin-right: 0.5rem;" data-id="${entry.id}">Load</button>
        <button class="btn-del btn-delete-entry" data-id="${entry.id}">Delete</button>
      </td>
    `;
    
    tr.querySelector(".btn-load-entry").addEventListener("click", () => {
      loadHistoryEntry(entry.inputs);
    });
    
    tr.querySelector(".btn-del").addEventListener("click", () => {
      deleteHistoryEntry(entry.id);
    });
    
    historyTableBody.appendChild(tr);
  });
}

// ==========================================
// 8. Community Board & Competition API integrations
// ==========================================

const COMMUNITY_KEY = "ecodial_community_members";
const DEFAULT_COMMUNITY = [
  { id: "seed-1", name: "Green Guru", score: 1.65, isSelf: false },
  { id: "seed-2", name: "Eco Champ", score: 2.35, isSelf: false },
  { id: "seed-3", name: "Carbon Heavy", score: 5.40, isSelf: false }
];

let communityMembers = [];

async function loadCommunityBoard() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard`);
    if (!response.ok) throw new Error("Leaderboard REST API is offline");
    communityMembers = await response.json();
    
    // Ensure the current user exists in the board
    const currentName = cardHolderNameInput.value.trim() || "You";
    const userExists = communityMembers.some((m) => m.isSelf);
    
    if (!userExists) {
      const currentScore = parseFloat(scoreValue.textContent) || 1.85;
      const userSelf = {
        id: "user-self",
        name: `${currentName} (You)`,
        score: currentScore,
        isSelf: true
      };
      await addOrUpdateLeaderboardMember(userSelf);
    } else {
      renderCommunityBoard();
    }
  } catch (e) {
    console.warn("FastAPI Server unavailable. Falling back to local storage community rankings: ", e);
    // Fallback to local storage database mock
    const raw = localStorage.getItem(COMMUNITY_KEY);
    communityMembers = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_COMMUNITY));
    
    const currentName = cardHolderNameInput.value.trim() || "You";
    const userExists = communityMembers.some((m) => m.isSelf);
    if (!userExists) {
      const currentScore = parseFloat(scoreValue.textContent) || 1.85;
      communityMembers.push({
        id: "user-self",
        name: `${currentName} (You)`,
        score: currentScore,
        isSelf: true
      });
      localStorage.setItem(COMMUNITY_KEY, JSON.stringify(communityMembers));
    }
    renderCommunityBoard();
  }
}

async function addOrUpdateLeaderboardMember(member) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(member)
    });
    if (!response.ok) throw new Error("POST request failed");
    communityMembers = await response.json();
    renderCommunityBoard();
  } catch (e) {
    console.warn("Adding member in local offline mode: ", e);
    const existingIdx = communityMembers.findIndex((m) => m.id === member.id || (member.isSelf && m.isSelf));
    if (existingIdx !== -1) {
      communityMembers[existingIdx] = member;
    } else {
      communityMembers.push(member);
    }
    localStorage.setItem(COMMUNITY_KEY, JSON.stringify(communityMembers));
    renderCommunityBoard();
  }
}

async function updateUserLeaderboardScore(score) {
  const currentName = cardHolderNameInput.value.trim() || "You";
  const selfMember = communityMembers.find((m) => m.isSelf) || { id: "user-self" };
  
  const updatedSelf = {
    id: selfMember.id,
    name: `${currentName} (You)`,
    score: score,
    isSelf: true
  };
  
  await addOrUpdateLeaderboardMember(updatedSelf);
}

async function addCommunityMember() {
  const name = friendNameInput.value.trim();
  const scoreVal = parseFloat(friendScoreInput.value);
  
  if (!name) {
    alert("Please enter a member name.");
    return;
  }
  
  const finalScore = isNaN(scoreVal) ? (parseFloat(scoreValue.textContent) || 0) : scoreVal;
  
  const newMember = {
    id: Date.now().toString(),
    name: name,
    score: Math.round(finalScore * 10) / 10,
    isSelf: false
  };
  
  await addOrUpdateLeaderboardMember(newMember);
  
  friendNameInput.value = "";
  friendScoreInput.value = "";
}

async function deleteCommunityMember(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard/${id}`, {
      method: "DELETE"
    });
    if (!response.ok) throw new Error("DELETE request failed");
    communityMembers = await response.json();
    renderCommunityBoard();
  } catch (e) {
    console.warn("Deleting member in local offline mode: ", e);
    communityMembers = communityMembers.filter((m) => m.id !== id || m.isSelf);
    localStorage.setItem(COMMUNITY_KEY, JSON.stringify(communityMembers));
    renderCommunityBoard();
  }
}

function renderCommunityBoard() {
  // 1. Sort members ascending by score (lowest footprint = 1st rank!)
  communityMembers.sort((a, b) => a.score - b.score);
  
  // 2. Render Status LED Lights Grid
  statusLightsGrid.innerHTML = "";
  communityMembers.forEach((member) => {
    const card = document.createElement("div");
    card.className = `status-light-card ${member.isSelf ? "active" : ""}`;
    
    // Choose LED color based on footprint
    let ledColor = "led-red";
    if (member.score * 1000 <= SUSTAINABLE_TARGET_ANNUAL_KG) {
      ledColor = "led-green";
    } else if (member.score * 1000 <= GLOBAL_AVG_ANNUAL_KG) {
      ledColor = "led-yellow";
    }
    
    card.innerHTML = `
      <div class="led-indicator ${ledColor}" title="${member.name} Status"></div>
      <div class="status-light-name">${member.name}</div>
      <div class="status-light-score">${member.score.toFixed(1)} t</div>
    `;
    statusLightsGrid.appendChild(card);
  });
  
  // 3. Render Leaderboard table rows
  leaderboardTableBody.innerHTML = "";
  communityMembers.forEach((member, index) => {
    const tr = document.createElement("tr");
    if (member.isSelf) {
      tr.style.backgroundColor = "rgba(16, 185, 129, 0.05)";
      tr.style.borderLeft = "3px solid var(--primary)";
    }
    
    let ledColor = "led-red";
    if (member.score * 1000 <= SUSTAINABLE_TARGET_ANNUAL_KG) {
      ledColor = "led-green";
    } else if (member.score * 1000 <= GLOBAL_AVG_ANNUAL_KG) {
      ledColor = "led-yellow";
    }
    
    const isDeletable = !member.isSelf;
    const actionCell = isDeletable 
      ? `<button class="btn-del-friend btn-delete-entry" data-id="${member.id}">Remove</button>`
      : `<span style="font-size: 0.7rem; color: var(--primary); font-weight: 700;">Host</span>`;
      
    tr.innerHTML = `
      <td style="font-weight: 700; color: #fff;">${index + 1}</td>
      <td style="font-weight: 600; color: ${member.isSelf ? "var(--primary)" : "#cbd5e1"};">${member.name}</td>
      <td style="font-weight: 700; font-family: monospace;">${member.score.toFixed(2)} t</td>
      <td>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div class="led-indicator ${ledColor}" style="margin: 0;"></div>
          <span style="font-size: 0.7rem; text-transform: uppercase;">
            ${ledColor === "led-green" ? "Sustainable" : ledColor === "led-yellow" ? "Moderate" : "High"}
          </span>
        </div>
      </td>
      <td style="text-align: right;">${actionCell}</td>
    `;
    
    if (isDeletable) {
      tr.querySelector(".btn-del-friend").addEventListener("click", () => {
        deleteCommunityMember(member.id);
      });
    }
    
    leaderboardTableBody.appendChild(tr);
  });
}

addFriendBtn.addEventListener("click", addCommunityMember);

// ==========================================
// 9. Reset and Initialization
// ==========================================

resetPlatformBtn.addEventListener("click", () => {
  userInputs = {
    car_km_per_week: 150,
    car_fuel: "petrol",
    public_transit_km_per_week: 80,
    short_haul_flights_per_year: 2,
    long_haul_flights_per_year: 0,
    electricity_kwh_per_month: 250,
    natural_gas_kwh_per_month: 300,
    household_size: 2,
    diet: "medium_meat",
    goods_spend_usd_per_month: 300,
    waste_kg_per_week: 10
  };
  cardHolderNameInput.value = "Green Champion";
  localStorage.setItem("ecodial_cardholder_name", "Green Champion");
  playClickSound();
  updateAllCardVisuals();
  updateDialVisuals();
  calculateAndRender();
});

saveSnapshotBtn.addEventListener("click", saveSnapshot);

function init() {
  // Load cardholder name if saved previously
  const savedCardholder = localStorage.getItem("ecodial_cardholder_name");
  if (savedCardholder) {
    cardHolderNameInput.value = savedCardholder;
  }
  
  renderTicks();
  initDialDrag();
  initNavigation();
  updateAllCardVisuals();
  updateDialVisuals();
  calculateAndRender();
  loadHistory();
  loadCommunityBoard();
}

window.addEventListener("DOMContentLoaded", init);
