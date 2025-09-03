import { useEffect, useState } from "react";

// 1. Define types for the weather data we expect
interface WeatherData {
  display_name: string;
  hourly: {
    temperature_2m: number[];
    precipitation_probability: number[];
    rain: number[];
    time: string[];
  };
}

export default function App() {
  const [city, setCity] = useState("Hyderabad"); // default city
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadWeather(cityName: string) {
    try {
      setLoading(true);
      setError(null);
      setWeather(null);

      // Step 1: Get latitude/longitude of city using Nominatim
      const geoRes = await fetch(
        `${import.meta.env.VITE_GEOCODE_URL}${cityName}`
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

      const url = `${import.meta.env.VITE_WEATHER_URL}?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weather data");

      const data = await res.json();
      setWeather({
        display_name,
        hourly: data.hourly,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWeather(city);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (city.trim()) {
      loadWeather(city);
    }
  }

  return (
    <div className="justify-center text-center bg-amber-50 min-h-screen p-5">
      <h1 className="text-shadow-2xs text-2xl font-bold mb-4">🌤️ Weather Cast</h1>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-5">
        <input
          className="w-40 shadow-2xl bg-amber-50 border p-2 rounded-md mr-2"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city..."
        />
        <button
          type="submit"
          className="bg-black text-amber-50 rounded-2xl px-4 py-2 cursor-pointer"
        >
          Search
        </button>
      </form>

      {loading && <div>⏳ Loading weather...</div>}
      {error && <div>❌ {error}</div>}

      {weather && (
        <div className="bg-white shadow-lg rounded-xl p-4">
          <p className="font-semibold">📍 {weather.display_name}</p>
          <p>🌡️ Current Temp: {weather.hourly.temperature_2m[0]}°C</p>
          <p>🌧️ Rain Probability: {weather.hourly.precipitation_probability[0]}%</p>
          <p>🌧️ Rainfall: {weather.hourly.rain[0]} mm</p>

          <h2 className="mt-3 font-bold">Next 5 Hours</h2>
          <ul className="text-sm mt-2">
            {weather.hourly.time.slice(0, 5).map((time: string, i: number) => (
              <li key={i}>
                {new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} —{" "}
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
