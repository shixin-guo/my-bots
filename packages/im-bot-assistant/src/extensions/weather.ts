import axios from 'axios';
import { config } from 'dotenv';
config({ path: '.env' });
const city = 'Hefei';
const apiKey = process.env.WEATHER_API_KEY!;
const apiUrl = 'http://api.openweathermap.org/data/2.5/weather';

const GetWeatherDataTips = async (): Promise<string> =>
  axios({
    url: apiUrl,
    method: 'GET',
    params: {
      q: city,
      appid: apiKey,
      units: 'metric',
    },
  })
    .then(({ data: weatherData }) => {
      const { weather, main, name, wind } = weatherData;
      return `There is *${weather[0].description}* in ${name} with a temperature of *${main.feels_like}* degrees Celsius and a humidity of ${main.humidity}%. There is also a wind with a speed of ${wind.speed} and gusts up to ${wind.gust} meters per second.`;
    })
    .catch((error) => {
      console.error(`Error fetching weather data: ${error}`);
      return 'Error fetching weather data';
    });
export default GetWeatherDataTips;

// {
//   coord: { lon: 117.2808, lat: 31.8639 },
//   weather: [ { id: 500, main: 'Rain', description: 'light rain', icon: '10d' } ],
//   base: 'stations',
//   main: {
//     temp: 13.43,
//     feels_like: 13,
//     temp_min: 13.43,
//     temp_max: 13.43,
//     pressure: 1010,
//     humidity: 83,
//     sea_level: 1010,
//     grnd_level: 1007
//   },
//   visibility: 10000,
//   wind: { speed: 2.68, deg: 95, gust: 4.32 },
//   rain: { '1h': 0.67 },
//   clouds: { all: 100 },
//   dt: 1679307054,
//   sys: { country: 'CN', sunrise: 1679264141, sunset: 1679307687 },
//   timezone: 28800,
//   id: 1808722,
//   name: 'Hefei',
//   cod: 200
// }
