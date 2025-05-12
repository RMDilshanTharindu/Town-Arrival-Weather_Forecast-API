const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const { getMinuteForecast } = require("./weatherService"); // Assuming weatherService.js is in the same directory

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const ORS_API_KEY = process.env.ORS_API_KEY;

const delay = (ms) => new Promise((res) => setTimeout(res, ms)); // For rate limiting


// Helper: Get coordinates of a place
async function geocodePlace(place) {
  const res = await axios.get(
    `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${place}`
  );
  return res.data.features[0].geometry.coordinates; // [lon, lat]
}

// Helper: Reverse geocode a point to get the nearest town/village
async function reverseGeocode(coord) {
  try {
    const res = await axios.get(
      `https://api.openrouteservice.org/geocode/reverse?api_key=${ORS_API_KEY}&point.lon=${coord[0]}&point.lat=${coord[1]}&boundary.circle.radius=5`
    );

    if (!res.data.features || res.data.features.length === 0) {
      console.log("No features returned for:", coord);
      return "Unknown";
    }

    const props = res.data.features[0].properties;
    const name =
      props.locality ||
      props.name ||
      props.county ||
      props.region ||
      props.state ||
      props.label ||
      "Unknown";

    return name;
  } catch (err) {
    console.log("Reverse geocode failed for:", coord);
    console.error(err.message);
    return "Unknown";
  }
}

// Convert UNIX timestamp to human-readable format
function toHumanReadable(unixTime) {
  return new Date(unixTime * 1000).toISOString();
}

// Route to fetch towns and weather information
app.post("/api/towns", async (req, res) => {
  const { start, end } = req.body;

  try {
    const startCoord = await geocodePlace(start);
    const endCoord = await geocodePlace(end);

    const routeRes = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        coordinates: [startCoord, endCoord],
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const route = routeRes.data.features[0];
    const coords = route.geometry.coordinates; // [lon, lat]
    const totalDuration = route.properties.summary.duration; // seconds

    const sampleCount = 10;
    const interval = Math.floor(coords.length / sampleCount);
    const sampledPoints = coords.filter((_, i) => i % interval === 0);
    sampledPoints.push(coords[coords.length - 1]); // Make sure end is included

    const cityWithArrival = [];
    const currentUnixTime = Math.floor(Date.now() / 1000); // Current Unix time in seconds

    for (let i = 0; i < sampledPoints.length; i++) {
      const point = sampledPoints[i];
      const town = await reverseGeocode(point);
      const etaSeconds = (i / sampledPoints.length) * totalDuration;
      const etaUnix = currentUnixTime + Math.round(etaSeconds);

      const alreadyExists = cityWithArrival.find(
        (c) => c.lat === point[1] && c.lon === point[0]
      );

      if (!alreadyExists) {
        cityWithArrival.push({
          lat: point[1],
          lon: point[0],
          time: etaUnix,
          town,
          timeReadable: toHumanReadable(etaUnix),
        });
      }

      await delay(200); // Avoid hitting rate limit
    }

    const weatherResults = [];
    for (const item of cityWithArrival) {
      const lat = item.lat;
      const lon = item.lon;
      const dt = item.time;
      const roundedTime = Math.round(dt / 60) * 60;

      try {
        const forecast = await getMinuteForecast(lat, lon, roundedTime);
        console.log(`📍 Forecast for [${lat}, ${lon}] at ${roundedTime}:`, forecast);

        weatherResults.push({
          lat,
          lon,
          town: item.town,
          time: dt,
          timeReadable: item.timeReadable,
          willRain: forecast.precipitation > 0,
        });
      } catch (err) {
        console.error(`❌ Error for [${lat}, ${lon}] at ${dt}:`, err.message);
        weatherResults.push({
          lat,
          lon,
          town: item.town,
          time: dt,
          timeReadable: item.timeReadable,
          willRain: false,
        });
      }
    }

    res.json({
      start,
      end,
      cityWithArrival,
      weatherResults,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch towns and ETA" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
