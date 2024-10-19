import { useState, useEffect } from "react";
import Search from "./components/search";
import CurrentWeather from "./components/current-weather";
import Forecast from "./components/forecast";
import { WEATHER_API_URL, WEATHER_API_KEY } from "./components/api";
import "./App.css";

function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cityIndex, setCityIndex] = useState(0);

  // List of default cities in India with their coordinates
  const defaultCities = [
    { label: "Mumbai, IN", value: "19.0760 72.8777" },
    { label: "Delhi, IN", value: "28.6139 77.2090" },
    { label: "Bengaluru, IN", value: "12.9716 77.5946" },
    { label: "Chennai, IN", value: "13.0827 80.2707" },
    { label: "Kolkata, IN", value: "22.5726 88.3639" },
    { label: "Hyderabad, IN", value: "17.3850 78.4867" },
  ];

  // Function to fetch weather data
  const fetchWeatherData = (lat, lon, label) => {
    const currentWeatherFetch = fetch(
      `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );
    const forecastFetch = fetch(
      `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );

    setLoading(true);

    Promise.all([currentWeatherFetch, forecastFetch])
      .then(async (response) => {
        const weatherResponse = await response[0].json();
        const forecastResponse = await response[1].json();

        setCurrentWeather({ city: label, ...weatherResponse });
        setForecast({ city: label, ...forecastResponse });
        setError(null);
      })
      .catch((err) => {
        setError("Unable to fetch weather data");
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  // Trigger fetching weather data on app load and cycle through cities
  useEffect(() => {
    const cycleCities = () => {
      const currentCity = defaultCities[cityIndex];
      const [lat, lon] = currentCity.value.split(" ");
      fetchWeatherData(lat, lon, currentCity.label);
    };

    cycleCities(); // Fetch weather for the initial city

    const intervalId = setInterval(() => {
      setCityIndex((prevIndex) => (prevIndex + 1) % defaultCities.length);
    }, 5000); // Change city every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [cityIndex]);

  const handleOnSearchChange = (searchData) => {
    const [lat, lon] = searchData.value.split(" ");
    fetchWeatherData(lat, lon, searchData.label);
  };

  return (
    <div className="container">
      <Search onSearchChange={handleOnSearchChange} />
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {currentWeather && <CurrentWeather data={currentWeather} />}
      {forecast && <Forecast data={forecast} />}
    </div>
  );
}

export default App;
