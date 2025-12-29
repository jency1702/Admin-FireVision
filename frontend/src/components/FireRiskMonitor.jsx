

import { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* Leaflet icon fix */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const OWM_KEY = process.env.REACT_APP_OWM_KEY;
console.log("OWM KEY:", OWM_KEY);

export default function AreaFireRiskAdvanced() {
  const [area, setArea] = useState("");
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [risk, setRisk] = useState(null);
  const [trend, setTrend] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- FDI ---------- */
  const computeFDI = (temp, humidity, wind) =>
    Math.round(
      (temp / 50) * 45 +
      ((100 - humidity) / 100) * 35 +
      (wind / 50) * 20
    );

  const getRiskLevel = (fdi) => {
    if (fdi >= 80) return "Extreme";
    if (fdi >= 60) return "High";
    if (fdi >= 40) return "Medium";
    return "Low";
  };

  /* ---------- CURRENT WEATHER ---------- */
  const processCurrent = (data) => {
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const wind = Math.round(data.wind.speed * 3.6);

    const fdi = computeFDI(temp, humidity, wind);

    setWeather({
      name: data.name || "Your Location",
      temp,
      humidity,
      wind,
    });

    setRisk({
      fdi,
      level: getRiskLevel(fdi),
      safety: Math.max(100 - fdi, 0),
    });

    return fdi;
  };

  /* ---------- FORECAST TREND ---------- */
  const processForecast = (list, currentFDI) => {
    const next = list[1];
    const temp = next.main.temp;
    const humidity = next.main.humidity;
    const wind = Math.round(next.wind.speed * 3.6);

    const futureFDI = computeFDI(temp, humidity, wind);

    let result = "Stable";
    if (futureFDI > currentFDI + 5) result = "Increasing";
    else if (futureFDI < currentFDI - 5) result = "Decreasing";

    setTrend(result);
    setForecast({ temp, humidity, wind });
  };

  /* ---------- FETCH BY COORDS ---------- */
  const fetchByCoords = async (lat, lon) => {
    setLoading(true);
    setError("");

    try {
      const current = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_KEY}`
      );

      const forecast = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_KEY}`
      );

      const currentFDI = processCurrent(current.data);
      processForecast(forecast.data.list, currentFDI);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch weather data");
    }

    setLoading(false);
  };

  /* ---------- CITY ---------- */
  const fetchByCity = async () => {
    if (!area.trim()) {
      setError("Please enter a city or area name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${area}&units=metric&appid=${OWM_KEY}`
      );

      const { lat, lon } = res.data.coord;
      setCoords([lat, lon]);
      fetchByCoords(lat, lon);
    } catch {
      setError("City not found");
      setLoading(false);
    }
  };

  /* ---------- GPS ---------- */
  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords([lat, lon]);
        fetchByCoords(lat, lon);
      },
      () => setError("Location access denied"),
      { enableHighAccuracy: true }
    );
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="max-w-6xl mx-auto rounded-xl bg-white border shadow-md p-6">

        <h2 className="text-3xl font-bold text-orange-600">
          Area Fire Risk Monitor
        </h2>
      
        <br />
        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              setError("");
            }}
            placeholder="Enter city / area"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300
            focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <button
            onClick={fetchByCity}
            className="px-6 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700"
          >
            Check by City
          </button>

          <button
            onClick={useMyLocation}
            className="px-6 py-3 rounded-lg font-semibold bg-orange-600 text-white hover:bg-orange-700"
          >
            Use My Location
          </button>
        </div>
        {loading && (
          <div className="mb-4 rounded-md bg-blue-100 px-4 py-2 text-blue-700">
            Loading weather data...
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md bg-red-100 px-4 py-2 text-red-700">
            {error}
          </div>
        )}

        {weather && risk && (
          <div className="grid md:grid-cols-2 gap-6">

            {/* INFO */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">
                Fire Risk Level:
                <span
                  className={`ml-3 px-4 py-1 rounded-full font-bold text-white
                  ${
                    risk.level === "Extreme"
                      ? "bg-red-600"
                      : risk.level === "High"
                      ? "bg-orange-500"
                      : risk.level === "Medium"
                      ? "bg-yellow-400 text-black"
                      : "bg-green-600"
                  }`}
                >
                  {risk.level}
                </span>
              </h3>

              <ul className="space-y-2 text-gray-700">
                <li>Location: {weather.name}</li>
                <li>Temperature: {weather.temp} °C</li>
                <li>Humidity: {weather.humidity} %</li>
                <li>Wind: {weather.wind} km/h</li>
              </ul>

              <div className="p-4 rounded-lg bg-gray-50 border">
                Safety Score: <b>{risk.safety}/100</b><br />
                Fire Danger Index (FDI): <b>{risk.fdi}</b>
              </div>

              {trend && forecast && (
                <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <h4 className="font-semibold">
                    Fire Risk Trend (Next 3 Hours)
                  </h4>
                  <p
                    className={`font-bold ${
                      trend === "Increasing"
                        ? "text-red-600"
                        : trend === "Decreasing"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {trend}
                  </p>
                  <p className="text-sm text-gray-600">
                    Forecast → Temp: {forecast.temp}°C | Humidity:{" "}
                    {forecast.humidity}% | Wind: {forecast.wind} km/h
                  </p>
                </div>
              )}
            </div>

            {/* MAP */}
            <div className="h-[360px] rounded-xl overflow-hidden border shadow">
              {coords && (
                <MapContainer center={coords} zoom={10} className="h-full w-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={coords}>
                    <Popup>{weather.name}</Popup>
                  </Marker>
                </MapContainer>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
