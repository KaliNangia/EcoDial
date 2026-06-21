// EcoDial Carbon Footprint Awareness Application Logic (Modular Client App)

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

let activeParamId = "car_km_per_week";
let isDragging = false;
let activeCommitments = [];
let personalGoal = 2.5;

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
const personalGoalInput = document.getElementById("personal-goal-input");
const personalGoalStatus = document.getElementById("personal-goal-status");
const personalGoalFill = document.getElementById("personal-goal-fill");
const sustainableFill = document.querySelector(".sustainable-fill");
const avgFill = document.querySelector(".avg-fill");

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
    const value = userInputs[paramId];
    const displayValSpan = document.getElementById(`val-${paramId}`);
    if (displayValSpan) {
      displayValSpan.textContent = typeof value === "number" ? value.toLocaleString() : String(value).replace(/_/g, " ");
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

  // Update dynamic ARIA roles for screen reader accessibility
  dialInteractive.setAttribute("aria-valuemin", spec.isCategoric ? 0 : spec.min);
  dialInteractive.setAttribute("aria-valuemax", spec.isCategoric ? spec.options.length - 1 : spec.max);
  dialInteractive.setAttribute("aria-valuenow", spec.isCategoric ? spec.options.indexOf(value) : value);
  dialInteractive.setAttribute("aria-valuetext", spec.isCategoric ? String(value).replace("_", " ") : `${value} ${spec.unit || ""}`);
  dialInteractive.setAttribute("aria-label", `Control Dial for ${spec.label}`);

  paramCards.forEach((c) => {
    const isParamActive = c.getAttribute("data-id") === activeParamId;
    c.setAttribute("aria-pressed", isParamActive ? "true" : "false");
  });
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
        const totalFlights = inputs.short_haul_flights_per_year + inputs.long_haul_flights_per_year;
        recommendations.push({
          category: "transport",
          action: `Your ${totalFlights} annual flight(s) produce ${Math.round(flightEmissions).toLocaleString()} kg CO2e. Replacing just one flight with rail or video calls would save ~${Math.round(flightEmissions / totalFlights).toLocaleString()} kg.`,
          savings: Math.round(0.5 * amount)
        });
      } else if (inputs.car_km_per_week > 0 && inputs.car_fuel !== "electric") {
        const currentCar = carAnnualKm * CAR_FACTORS_PER_KM[inputs.car_fuel];
        const electricCar = carAnnualKm * CAR_FACTORS_PER_KM.electric;
        const savings = Math.round(currentCar - electricCar);
        if (savings > 0) {
          recommendations.push({
            category: "transport",
            action: `Your ${inputs.car_km_per_week} km/week ${inputs.car_fuel} driving emits ${Math.round(currentCar).toLocaleString()} kg CO2e/yr. Switching to electric would save ${savings.toLocaleString()} kg — or cut 30 km/week for a quick ${Math.round(30 * WEEKS_PER_YEAR * CAR_FACTORS_PER_KM[inputs.car_fuel]).toLocaleString()} kg saving.`,
            savings: savings
          });
        }
      } else {
        recommendations.push({
          category: "transport",
          action: `Your transport emits ${Math.round(amount).toLocaleString()} kg CO2e/yr. Carpooling or using public transit for routine journeys could cut ~20%.`,
          savings: Math.round(0.2 * amount)
        });
      }
    }
    
    if (category === "home" && amount > 0) {
      const elecAnnual = Math.round(inputs.electricity_kwh_per_month * MONTHS_PER_YEAR * ELECTRICITY_PER_KWH);
      const gasAnnual = Math.round(inputs.natural_gas_kwh_per_month * MONTHS_PER_YEAR * NATURAL_GAS_PER_KWH);
      const bigger = elecAnnual > gasAnnual ? `electricity (${elecAnnual.toLocaleString()} kg)` : `gas heating (${gasAnnual.toLocaleString()} kg)`;
      recommendations.push({
        category: "home",
        action: `Your biggest home source is ${bigger}. Switching to a renewable tariff and improving insulation could save ~${Math.round(0.33 * amount).toLocaleString()} kg CO2e/yr.`,
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
            action: `Your ${inputs.diet.replace("_", " ")} diet produces ${DIET_ANNUAL_KG[inputs.diet].toLocaleString()} kg CO2e/yr. Shifting to ${target.replace("_", " ")} saves ${savings.toLocaleString()} kg — even a few plant-based days weekly helps.`,
            savings: savings
          });
        }
      }
    }
    
    if (category === "consumption" && amount > 0) {
      const goodsAnnual = Math.round(inputs.goods_spend_usd_per_month * MONTHS_PER_YEAR * GOODS_PER_USD_MONTHLY);
      const wasteAnnual = Math.round(inputs.waste_kg_per_week * WEEKS_PER_YEAR * WASTE_PER_KG);
      recommendations.push({
        category: "consumption",
        action: `Your spending adds ${goodsAnnual.toLocaleString()} kg and waste adds ${wasteAnnual.toLocaleString()} kg CO2e/yr. Buying durable/second-hand goods and composting could save ~${Math.round(0.25 * amount).toLocaleString()} kg.`,
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
  
  // Render comparison tracker bars (scaled dynamically relative to the maximum)
  const maxBarVal = Math.max(4.8, totalTonnes, personalGoal, 2.0);
  
  const sustainablePct = (2.0 / maxBarVal) * 100;
  if (sustainableFill) {
    sustainableFill.style.width = `${sustainablePct}%`;
  }
  
  const avgPct = (4.8 / maxBarVal) * 100;
  if (avgFill) {
    avgFill.style.width = `${avgPct}%`;
  }
  
  const userPct = (totalTonnes / maxBarVal) * 100;
  if (userFootprintFill) {
    userFootprintFill.style.width = `${userPct}%`;
    if (result.total > GLOBAL_AVG_ANNUAL_KG) {
      userFootprintFill.classList.add("over-avg");
    } else {
      userFootprintFill.classList.remove("over-avg");
    }
  }
  
  const goalPct = (personalGoal / maxBarVal) * 100;
  if (personalGoalFill) {
    personalGoalFill.style.width = `${goalPct}%`;
  }
  
  // Render goal status badge
  if (personalGoalStatus) {
    if (totalTonnes <= personalGoal) {
      personalGoalStatus.textContent = "Goal Met";
      personalGoalStatus.className = "goal-badge met";
    } else {
      const over = totalTonnes - personalGoal;
      personalGoalStatus.textContent = `+${over.toFixed(1)} t Over`;
      personalGoalStatus.className = "goal-badge over";
    }
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
      const isCommitted = activeCommitments.some(c => c.action === rec.action);
      const li = document.createElement("li");
      li.className = "recommendation";
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";
      li.style.gap = "1rem";
      
      const textDiv = document.createElement("div");
      textDiv.style.flex = "1";
      textDiv.innerHTML = `
        <div class="recommendation-action">${rec.action}</div>
        <div class="recommendation-saving">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
          Est. Saving: <strong>${rec.savings.toLocaleString()} kg CO2e / yr</strong>
        </div>
      `;
      
      const actionBtn = document.createElement("button");
      actionBtn.className = "btn";
      actionBtn.style.padding = "6px 12px";
      actionBtn.style.fontSize = "0.75rem";
      actionBtn.style.whiteSpace = "nowrap";
      actionBtn.style.boxShadow = "none";
      if (isCommitted) {
        actionBtn.textContent = "Committed ✓";
        actionBtn.className = "btn secondary";
        actionBtn.disabled = true;
      } else {
        actionBtn.textContent = "+ Commit";
        actionBtn.addEventListener("click", () => {
          addCommitment(rec);
        });
      }
      
      li.appendChild(textDiv);
      li.appendChild(actionBtn);
      recommendationsList.appendChild(li);
    });
  }

  // Update commitments UI list
  renderCommitments();

  // Update current user score in leaderboard
  debouncedUpdateUserLeaderboardScore(totalTonnes);
}

// The downloadEcoCardImage function is defined in passport.js
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
      tabBtns.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      tabPanes.forEach((p) => p.classList.remove("active"));
      
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
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
    const activateCard = () => {
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
    };
    card.addEventListener("click", activateCard);
    // Keyboard activation for accessibility (Enter and Space)
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activateCard();
      }
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
  
  renderHistoryTrendChart(history);
}

// The renderHistoryTrendChart function is defined in chart.js

// ==========================================
// 8. Commitments Tracker & Category Insights Functions
// ==========================================

function loadPersonalGoal() {
  try {
    const raw = localStorage.getItem("ecodial_personal_goal");
    if (raw) {
      personalGoal = parseFloat(raw);
    }
  } catch (e) {
    console.error("Failed to load personal goal: ", e);
  }
  if (personalGoalInput) {
    personalGoalInput.value = personalGoal.toFixed(1);
  }
}

function savePersonalGoal(val) {
  try {
    localStorage.setItem("ecodial_personal_goal", val.toString());
  } catch (e) {
    console.error("Failed to save personal goal: ", e);
  }
}

function loadCommitments() {
  try {
    const raw = localStorage.getItem("ecodial_commitments");
    activeCommitments = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load commitments: ", e);
    activeCommitments = [];
  }
  renderCommitments();
}

function saveCommitments() {
  try {
    localStorage.setItem("ecodial_commitments", JSON.stringify(activeCommitments));
  } catch (e) {
    console.error("Failed to save commitments: ", e);
  }
}

function addCommitment(rec) {
  if (!activeCommitments.some(c => c.action === rec.action)) {
    activeCommitments.push(rec);
    saveCommitments();
    playClickSound();
    calculateAndRender();
  }
}

function removeCommitment(actionText) {
  activeCommitments = activeCommitments.filter(c => c.action !== actionText);
  saveCommitments();
  playClickSound();
  calculateAndRender();
}

function renderCommitments() {
  const commitmentsList = document.getElementById("commitments-list");
  const emptyMsg = document.getElementById("commitments-empty-msg");
  const totalSavedSpan = document.getElementById("commitments-total-saved");
  const progressBar = document.getElementById("commitments-progress-bar");
  
  if (!commitmentsList) return;
  
  commitmentsList.innerHTML = "";
  
  if (activeCommitments.length === 0) {
    if (emptyMsg) emptyMsg.classList.remove("hidden");
    commitmentsList.appendChild(emptyMsg || document.createElement("li"));
    totalSavedSpan.textContent = "0 kg CO2e / yr";
    progressBar.style.width = "0%";
    return;
  }
  
  if (emptyMsg) emptyMsg.classList.add("hidden");
  
  let totalSavings = 0;
  
  activeCommitments.forEach((c) => {
    totalSavings += c.savings;
    
    const li = document.createElement("li");
    li.className = "recommendation";
    li.style.borderLeftColor = "var(--primary)";
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.gap = "1rem";
    
    const textDiv = document.createElement("div");
    textDiv.style.flex = "1";
    textDiv.innerHTML = `
      <div class="recommendation-action">${c.action}</div>
      <div class="recommendation-saving">Est. Saving: <strong>${c.savings.toLocaleString()} kg CO2e / yr</strong></div>
    `;
    
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-delete-entry";
    removeBtn.textContent = "Remove";
    removeBtn.style.color = "var(--accent)";
    removeBtn.addEventListener("click", () => {
      removeCommitment(c.action);
    });
    
    li.appendChild(textDiv);
    li.appendChild(removeBtn);
    commitmentsList.appendChild(li);
  });
  
  totalSavedSpan.textContent = `${totalSavings.toLocaleString()} kg CO2e / yr`;
  
  const currentTotalKg = (parseFloat(scoreValue.textContent) || 0) * 1000;
  const progressPct = currentTotalKg > 0 ? Math.min(100, (totalSavings / currentTotalKg) * 100) : 0;
  progressBar.style.width = `${progressPct}%`;
}

const CATEGORY_DETAILS_MAP = {
  transport: {
    title: "🚗 Transport Emissions Details",
    text: "Transport emissions are computed from your weekly car driving (km/week × 52 × fuel factor) and public transit use, plus annual short/long-haul flight trips (1,100km / 6,500km per trip times aviation factors). Transitioning to electric vehicles and flying less represent the highest-impact actions to lower transport carbon footprints."
  },
  home: {
    title: "🏡 Home Energy Emissions Details",
    text: "Home energy emissions combine monthly electricity (0.450 kg CO2e/kWh) and natural gas (0.183 kg CO2e/kWh) consumption, scaled annually and divided by your household size. Sharing living spaces distributes the structural carbon burden among members. Switching to heat pumps and solar panels reduces emissions to near-zero."
  },
  diet: {
    title: "🍽️ Diet Emissions Details",
    text: "Diet emissions are derived from fixed lifecycle carbon footprints associated with different dietary lifestyles: heavy meat (3,300 kg CO2e/yr), vegetarian (1,500 kg CO2e/yr), and vegan (1,050 kg CO2e/yr). Swapping animal products for grains, legumes, and local vegetables dramatically decreases agricultural carbon output."
  },
  consumption: {
    title: "🛍️ Consumption & Waste Details",
    text: "Consumption emissions scale monthly consumer goods expenditure (0.40 kg CO2e/USD) and weekly landfill waste (0.58 kg CO2e/kg) to annual estimates. Transitioning to a circular economy—buying durable, repairable, or secondhand goods, composting organic waste, and recycling plastic/metals—minimizes lifecycle carbon impact."
  }
};

function initBreakdownInteractive() {
  const categories = ["transport", "home", "diet", "consumption"];
  const panel = document.getElementById("breakdown-details-panel");
  const titleEl = document.getElementById("breakdown-details-title");
  const textEl = document.getElementById("breakdown-details-text");
  
  categories.forEach(cat => {
    const row = document.getElementById(`breakdown-row-${cat}`);
    if (!row) return;
    
    const activate = () => {
      categories.forEach(c => {
        const r = document.getElementById(`breakdown-row-${c}`);
        if (r) r.style.background = "transparent";
      });
      
      row.style.background = "rgba(16, 185, 129, 0.08)";
      panel.classList.remove("hidden");
      titleEl.textContent = CATEGORY_DETAILS_MAP[cat].title;
      textEl.textContent = CATEGORY_DETAILS_MAP[cat].text;
      playClickSound();
    };
    
    row.addEventListener("click", activate);
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    });
  });
}

// ==========================================
// 9. Community Board & Competition API integrations
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

// Debounced version prevents flooding the server during rapid dial adjustments
let _leaderboardSyncTimer = null;
function debouncedUpdateUserLeaderboardScore(score) {
  clearTimeout(_leaderboardSyncTimer);
  _leaderboardSyncTimer = setTimeout(() => {
    updateUserLeaderboardScore(score);
  }, 500);
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

function getLedColor(scoreInTonnes) {
  if (scoreInTonnes * 1000 <= SUSTAINABLE_TARGET_ANNUAL_KG) return "led-green";
  if (scoreInTonnes * 1000 <= GLOBAL_AVG_ANNUAL_KG) return "led-yellow";
  return "led-red";
}

function getLedLabel(ledColor) {
  if (ledColor === "led-green") return "Sustainable";
  if (ledColor === "led-yellow") return "Moderate";
  return "High";
}

function renderCommunityBoard() {
  // 1. Sort members ascending by score (lowest footprint = 1st rank!)
  communityMembers.sort((a, b) => a.score - b.score);
  
  // 2. Render Status LED Lights Grid (uses textContent for XSS safety)
  statusLightsGrid.innerHTML = "";
  communityMembers.forEach((member) => {
    const card = document.createElement("div");
    card.className = `status-light-card ${member.isSelf ? "active" : ""}`;
    
    const ledColor = getLedColor(member.score);
    
    const led = document.createElement("div");
    led.className = `led-indicator ${ledColor}`;
    led.setAttribute("title", `${member.name} Status`);
    led.setAttribute("aria-label", `${getLedLabel(ledColor)} status`);
    
    const nameDiv = document.createElement("div");
    nameDiv.className = "status-light-name";
    nameDiv.textContent = member.name;
    
    const scoreDiv = document.createElement("div");
    scoreDiv.className = "status-light-score";
    scoreDiv.textContent = `${member.score.toFixed(1)} t`;
    
    card.appendChild(led);
    card.appendChild(nameDiv);
    card.appendChild(scoreDiv);
    statusLightsGrid.appendChild(card);
  });
  
  // 3. Render Leaderboard table rows (uses textContent for XSS safety)
  leaderboardTableBody.innerHTML = "";
  communityMembers.forEach((member, index) => {
    const tr = document.createElement("tr");
    if (member.isSelf) {
      tr.style.backgroundColor = "rgba(16, 185, 129, 0.05)";
      tr.style.borderLeft = "3px solid var(--primary)";
    }
    
    const ledColor = getLedColor(member.score);
    const isDeletable = !member.isSelf;
    
    // Rank cell
    const tdRank = document.createElement("td");
    tdRank.style.cssText = "font-weight: 700; color: #fff;";
    tdRank.textContent = String(index + 1);
    
    // Name cell (XSS-safe via textContent)
    const tdName = document.createElement("td");
    tdName.style.cssText = `font-weight: 600; color: ${member.isSelf ? "var(--primary)" : "#cbd5e1"};`;
    tdName.textContent = member.name;
    
    // Score cell
    const tdScore = document.createElement("td");
    tdScore.style.cssText = "font-weight: 700; font-family: monospace;";
    tdScore.textContent = `${member.score.toFixed(2)} t`;
    
    // Status cell with LED and text label
    const tdStatus = document.createElement("td");
    const statusWrapper = document.createElement("div");
    statusWrapper.style.cssText = "display: flex; align-items: center; gap: 0.5rem;";
    const ledDiv = document.createElement("div");
    ledDiv.className = `led-indicator ${ledColor}`;
    ledDiv.style.margin = "0";
    const statusSpan = document.createElement("span");
    statusSpan.style.cssText = "font-size: 0.7rem; text-transform: uppercase;";
    statusSpan.textContent = getLedLabel(ledColor);
    statusWrapper.appendChild(ledDiv);
    statusWrapper.appendChild(statusSpan);
    tdStatus.appendChild(statusWrapper);
    
    // Action cell
    const tdAction = document.createElement("td");
    tdAction.style.textAlign = "right";
    if (isDeletable) {
      const removeBtn = document.createElement("button");
      removeBtn.className = "btn-del-friend btn-delete-entry";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => deleteCommunityMember(member.id));
      tdAction.appendChild(removeBtn);
    } else {
      const hostSpan = document.createElement("span");
      hostSpan.style.cssText = "font-size: 0.7rem; color: var(--primary); font-weight: 700;";
      hostSpan.textContent = "Host";
      tdAction.appendChild(hostSpan);
    }
    
    tr.appendChild(tdRank);
    tr.appendChild(tdName);
    tr.appendChild(tdScore);
    tr.appendChild(tdStatus);
    tr.appendChild(tdAction);
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
  
  loadPersonalGoal();

  if (personalGoalInput) {
    personalGoalInput.addEventListener("change", (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val) || val < 0.1) {
        val = 0.1;
      } else if (val > 25.0) {
        val = 25.0;
      }
      personalGoal = val;
      e.target.value = val.toFixed(1);
      savePersonalGoal(val);
      calculateAndRender();
    });
  }
  
  renderTicks();
  initDialDrag();
  initNavigation();
  updateAllCardVisuals();
  updateDialVisuals();
  loadCommitments();
  initBreakdownInteractive();
  calculateAndRender();
  loadHistory();
  loadCommunityBoard();
}

window.addEventListener("DOMContentLoaded", init);
