
const axios = require('axios');

/**
 * Get the minutely precipitation forecast for a specific location and timestamp.
 */
async function getMinuteForecast(lat, lon, dt) {
    if (!lat || !lon || !dt) {
        throw new Error('Latitude, Longitude, and dt (timestamp) are required');
    }

    try {
        const response = await axios.get('https://api.openweathermap.org/data/3.0/onecall', {
            params: {
                lat,
                lon,
                exclude: 'current,hourly,daily,alerts',
                appid: process.env.OPENWEATHER_API_KEY,
                units: 'metric'
            }
        });

        const minutelyData = response.data.minutely;

        if (!minutelyData || minutelyData.length === 0) {
            throw new Error('No minute-level forecast available for this location');
        }

        const targetTimestamp = parseInt(dt, 10);
        const forecast = minutelyData.find(item => item.dt === targetTimestamp);

        if (!forecast) {
            throw new Error('No data available for the given timestamp');
        }

        return forecast;

    } catch (error) {
        throw new Error(error.response?.data?.message || error.message);
    }
}

module.exports = {
    getMinuteForecast
};
