import { useEffect, useState } from "react";

export default function App() {
  const [city, setCity] = useState("Hyderabad"); // default city
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadWeather(cityName) {
    try {
      setLoading(true);
      setError(null);
      setWeather(null);

      // Step 1: Get latitude/longitude of city using OpenStreetMap Nominatim
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${cityName}`
      );
      const geoData = await geoRes.json();
      if (!geoData.length) throw new Error("City not found");

      const { lat, lon, display_name } = geoData[0];

      // Step 2: Fetch weather data
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        hourly: "temperature_2m,precipitation_probability,rain",
      });

      const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weather data");

      const data = await res.json();
      setWeather({ ...data, display_name });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWeather(city);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (city.trim()) {
      loadWeather(city);
    }
  }

  return (
    <div className="justify-center text-center bg-amber-50">
      <h1 className="text-shadow-2xs text-2xl">🌤️ Weather Cast</h1>

      {/* Search Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input className="w-40 shadow-2xl bg-amber-50"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city..."
          style={{ padding: "8px", fontSize: "16px" }}
        />
        <button type="submit" className="bg-black text-amber-50 rounded-2xl w-30 cursor-pointer">
          Search
        </button>
      </form>

      {loading && <div>⏳ Loading weather...</div>}
      {error && <div>❌ {error}</div>}

      {weather && (
        <div>
          <p>📍 {weather.display_name}</p>
          <p>🌡️ Current Temp: {weather.hourly.temperature_2m[0]}°C</p>
          <p>🌧️ Rain Probability: {weather.hourly.precipitation_probability[0]}%</p>
          <p>🌧️ Rainfall: {weather.hourly.rain[0]} mm</p>

          <h2>Next 5 Hours</h2>
          <ul>
            {weather.hourly.time.slice(0, 5).map((time, i) => (
              <li key={i}>
                {new Date(time).toLocaleTimeString()} —{" "}
                {weather.hourly.temperature_2m[i]}°C,{" "}
                {weather.hourly.precipitation_probability[i]}% rain,{" "}
                {weather.hourly.rain[i]} mm rainfall
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
