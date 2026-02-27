// ---------------- SUMMARY ----------------
async function loadSummary() {
  const res = await fetch("/api/summary");
  const data = await res.json();

  document.getElementById("bz").innerText = data.bz;
  document.getElementById("wind").innerText = data.wind;
  document.getElementById("state").innerText = "System: " + data.state;
}

// ---------------- ALERTS ----------------
async function loadAlerts() {
  const res = await fetch("/api/alerts");
  const alerts = await res.json();

  const ul = document.getElementById("alerts");
  ul.innerHTML = "";

  alerts.forEach(alert => {
    const li = document.createElement("li");
    li.innerText = alert;
    ul.appendChild(li);
  });
}

// ---------------- CHART ----------------
async function createChart(endpoint, canvasId, label) {
  const res = await fetch(endpoint);
  const data = await res.json();

  new Chart(document.getElementById(canvasId), {
    type: "line",
    data: {
      labels: data.map(d => d.time),
      datasets: [{
        label: label,
        data: data.map(d => d.value),
        borderWidth: 2
      }]
    }
  });
}

// ---------------- INIT ----------------
loadSummary();
loadAlerts();

createChart("/api/bz", "bzChart", "Bz (nT)");
createChart("/api/wind", "windChart", "Solar Wind");

// Auto refresh
setInterval(() => {
  loadSummary();
  loadAlerts();
}, 10000);