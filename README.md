
````markdown
# 🛣️ Town Arrival & Weather Forecast API

A Node.js Express API that calculates towns or villages along a driving route between two locations and predicts the weather (rain or not) at the estimated arrival time for each town.

---

## 🌟 Features

- 🚗 Calculates a driving route between two places using **OpenRouteService**
- 📍 Identifies key towns/villages along the route via **reverse geocoding**
- ⏰ Estimates the arrival time at each town
- 🌦️ Predicts whether it will rain at that time using a weather forecasting service
- 🧩 Includes rate limiting to avoid hitting API limits

---

## 📦 Tech Stack

- **Node.js + Express** – Backend framework
- **Axios** – For making HTTP requests
- **OpenRouteService API** – Geocoding and routing
- **Custom Weather Service** – (via `weatherService.js`)
- **CORS & dotenv** – Middleware and environment configuration

---
````

## 🔧 Setup Instructions

1. **Clone the repository**



2. **Install dependencies**

```bash
npm install
```

3. **Create a `.env` file**

```env
ORS_API_KEY=your_openrouteservice_api_key
```

4. **Start the server**

```bash
node index.js
```

The server will run on `http://localhost:3000` by default.

---

## 📡 API Usage

### `POST /api/towns`

**Request Body:**

```json
{
  "start": "Colombo, Sri Lanka",
  "end": "Kandy, Sri Lanka"
}
```

**Response Example:**

```json
{
  "start": "Colombo, Sri Lanka",
  "end": "Kandy, Sri Lanka",
  "cityWithArrival": [
    {
      "lat": 7.2906,
      "lon": 80.6337,
      "time": 1700000000,
      "town": "Mawanella",
      "timeReadable": "2025-05-12T10:00:00.000Z"
    }
  ],
  "weatherResults": [
    {
      "lat": 7.2906,
      "lon": 80.6337,
      "town": "Mawanella",
      "time": 1700000000,
      "timeReadable": "2025-05-12T10:00:00.000Z",
      "willRain": false
    }
  ]
}
```

---

## 🧠 How It Works

1. **Geocoding:** Converts place names into coordinates
2. **Routing:** Uses OpenRouteService to generate a driving route
3. **Sampling:** Samples 10 points evenly along the route
4. **Reverse Geocoding:** Gets the nearest town/village for each point
5. **ETA Calculation:** Estimates time of arrival for each location
6. **Forecasting:** Checks precipitation forecasts at each location and time
7. **Returns:** An array of towns with weather info

---

## 📂 Project Structure

```
town-weather-api/
├── index.js
├── weatherService.js
├── .env
├── package.json
```

---

## 📝 Notes

* Be mindful of **OpenRouteService API rate limits**
* You must implement a valid `getMinuteForecast()` inside `weatherService.js`
* Ideal for **travel apps**, **delivery tracking**, and **commuting platforms**

---

## 🙌 Author

Made with ❤️ by [Dilshan Tharindu](https://www.linkedin.com/in/dilshan-tharindu)

---

## 📥 License

Feel free to use and modify this for personal or educational projects. Attribution appreciated.

```

