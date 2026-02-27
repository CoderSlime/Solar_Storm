const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 5000;

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// NOAA APIs
const NOAA_BZ = "https://services.swpc.noaa.gov/products/solar-wind/mag-2-hour.json";
const NOAA_WIND = "https://services.swpc.noaa.gov/products/solar-wind/plasma-2-hour.json";

// ---------------- SUMMARY ----------------
app.get("/api/summary", async (req, res) => {
  try {
    const bzData = (await axios.get(NOAA_BZ)).data;
    const windData = (await axios.get(NOAA_WIND)).data;

    const bz = parseFloat(bzData.at(-1)[3]);
    const wind = parseFloat(windData.at(-1)[2]);

    let state = "NORMAL";
    if (bz <= -10) state = "CRITICAL";
    else if (bz <= -5) state = "ELEVATED";

    res.json({ bz, wind, state });
  } catch {
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

// ---------------- BZ GRAPH ----------------
app.get("/api/bz", async (req, res) => {
  try {
    const data = (await axios.get(NOAA_BZ)).data.slice(1);

    res.json(
      data.map(row => ({
        time: row[0],
        value: parseFloat(row[3])
      }))
    );
  } catch {
    res.status(500).json({ error: "Failed" });
  }
});

// ---------------- SOLAR WIND GRAPH ----------------
app.get("/api/wind", async (req, res) => {
  try {
    const data = (await axios.get(NOAA_WIND)).data.slice(1);

    res.json(
      data.map(row => ({
        time: row[0],
        value: parseFloat(row[2])
      }))
    );
  } catch {
    res.status(500).json({ error: "Failed" });
  }
});

// ---------------- ALERTS ----------------
app.get("/api/alerts", async (req, res) => {
  try {
    const bz = parseFloat((await axios.get(NOAA_BZ)).data.at(-1)[3]);
    const wind = parseFloat((await axios.get(NOAA_WIND)).data.at(-1)[2]);

    let alerts = [];

    if (bz <= -10) alerts.push("🔴 Critical geomagnetic storm");
    else if (bz <= -5) alerts.push("🟠 Elevated geomagnetic activity");

    if (wind > 600) alerts.push("🟠 High solar wind speed");

    if (alerts.length === 0) alerts.push("🟢 All systems normal");

    res.json(alerts);
  } catch {
    res.status(500).json({ error: "Failed" });
  }
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});