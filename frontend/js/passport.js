// Shareable Carbon Passport Canvas Drawing and Downloading Logic

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
