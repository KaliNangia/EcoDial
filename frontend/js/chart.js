// Saved Snapshots SVG Trend Graph Renderer Logic

function renderHistoryTrendChart(history) {
  const container = document.getElementById("history-trend-container");
  const svg = document.getElementById("trend-svg");
  
  if (!container || !svg) return;
  
  if (!history || history.length < 2) {
    container.style.display = "none";
    return;
  }
  
  container.style.display = "block";
  svg.innerHTML = "";
  
  // Show up to 8 recent snapshots chronologically
  const recentHistory = [...history].slice(0, 8).reverse();
  
  const width = 600;
  const height = 160;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 25;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  const values = recentHistory.map(entry => parseFloat(entry.total));
  const minVal = Math.min(...values, 0); // Include 0
  const maxVal = Math.max(...values, 5); // Default max 5 tonnes
  const valRange = maxVal - minVal;
  
  // Generate coordinates for points
  const points = recentHistory.map((entry, index) => {
    const x = paddingLeft + (index / (recentHistory.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((parseFloat(entry.total) - minVal) / valRange) * chartHeight;
    return { x, y, entry };
  });
  
  // Draw grid lines
  const numGridLines = 4;
  for (let i = 0; i <= numGridLines; i++) {
    const yVal = minVal + (i / numGridLines) * valRange;
    const y = paddingTop + chartHeight - (i / numGridLines) * chartHeight;
    
    // Grid line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", paddingLeft);
    line.setAttribute("y1", y);
    line.setAttribute("x2", width - paddingRight);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "var(--border)");
    line.setAttribute("stroke-dasharray", "4,4");
    svg.appendChild(line);
    
    // Label
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", paddingLeft - 8);
    text.setAttribute("y", y + 4);
    text.setAttribute("fill", "var(--muted)");
    text.setAttribute("font-size", "10");
    text.setAttribute("text-anchor", "end");
    text.textContent = yVal.toFixed(1);
    svg.appendChild(text);
  }
  
  // Sustainable target line (2.0 tonnes)
  const targetY = paddingTop + chartHeight - ((2.0 - minVal) / valRange) * chartHeight;
  if (targetY >= paddingTop && targetY <= paddingTop + chartHeight) {
    const targetLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    targetLine.setAttribute("x1", paddingLeft);
    targetLine.setAttribute("y1", targetY);
    targetLine.setAttribute("x2", width - paddingRight);
    targetLine.setAttribute("y2", targetY);
    targetLine.setAttribute("stroke", "rgba(16, 185, 129, 0.4)");
    targetLine.setAttribute("stroke-width", "1.5");
    svg.appendChild(targetLine);
    
    const targetText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    targetText.setAttribute("x", width - paddingRight);
    targetText.setAttribute("y", targetY - 4);
    targetText.setAttribute("fill", "#10b981");
    targetText.setAttribute("font-size", "9");
    targetText.setAttribute("font-weight", "bold");
    targetText.setAttribute("text-anchor", "end");
    targetText.textContent = "Target: 2.0 t";
    svg.appendChild(targetText);
  }
  
  // Area under path
  let areaD = `M ${points[0].x} ${paddingTop + chartHeight} `;
  points.forEach(p => {
    areaD += `L ${p.x} ${p.y} `;
  });
  areaD += `L ${points[points.length - 1].x} ${paddingTop + chartHeight} Z`;
  
  const areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  areaPath.setAttribute("d", areaD);
  areaPath.setAttribute("fill", "url(#trend-gradient)");
  areaPath.setAttribute("opacity", "0.15");
  svg.appendChild(areaPath);
  
  // Add gradient definition
  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", "trend-gradient");
    gradient.setAttribute("x1", "0");
    gradient.setAttribute("y1", "0");
    gradient.setAttribute("x2", "0");
    gradient.setAttribute("y2", "1");
    
    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", "#10b981");
    
    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", "#10b981");
    stop2.setAttribute("stop-opacity", "0");
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);
  }
  
  // Line path
  let lineD = `M ${points[0].x} ${points[0].y} `;
  for (let i = 1; i < points.length; i++) {
    lineD += `L ${points[i].x} ${points[i].y} `;
  }
  
  const linePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  linePath.setAttribute("d", lineD);
  linePath.setAttribute("fill", "none");
  linePath.setAttribute("stroke", "#10b981");
  linePath.setAttribute("stroke-width", "3");
  linePath.setAttribute("stroke-linecap", "round");
  linePath.setAttribute("stroke-linejoin", "round");
  svg.appendChild(linePath);
  
  // Dots and labels
  points.forEach((p) => {
    // Circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", p.x);
    circle.setAttribute("cy", p.y);
    circle.setAttribute("r", "5");
    circle.setAttribute("fill", "var(--bg)");
    circle.setAttribute("stroke", "#10b981");
    circle.setAttribute("stroke-width", "2");
    
    // Tooltip or dynamic title
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = `${p.entry.date}: ${p.entry.total} tonnes`;
    circle.appendChild(title);
    svg.appendChild(circle);
    
    // Value label above dot
    const valText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    valText.setAttribute("x", p.x);
    valText.setAttribute("y", p.y - 10);
    valText.setAttribute("fill", "#fff");
    valText.setAttribute("font-size", "9");
    valText.setAttribute("font-weight", "bold");
    valText.setAttribute("text-anchor", "middle");
    valText.textContent = `${p.entry.total} t`;
    svg.appendChild(valText);
    
    // Date label below axis
    const dateText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    dateText.setAttribute("x", p.x);
    dateText.setAttribute("y", paddingTop + chartHeight + 16);
    dateText.setAttribute("fill", "var(--muted)");
    dateText.setAttribute("font-size", "9");
    dateText.setAttribute("text-anchor", "middle");
    const shortDate = p.entry.date.split(",")[0];
    dateText.textContent = shortDate;
    svg.appendChild(dateText);
  });
}
