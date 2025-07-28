const express = require('express');
const router = express.Router();
const axios = require('axios');

// WeatherAPI.com 配置
const WEATHERAPI_KEY = process.env.WEATHERAPI_KEY;
const WEATHERAPI_BASE_URL = 'http://api.weatherapi.com/v1';

// 獲取當前天氣
router.get('/current', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    
    if (!WEATHERAPI_KEY) {
      return res.status(500).json({ 
        error: 'WeatherAPI key not configured',
        weather: {
          temp: 25,
          description: '晴天',
          icon: '01d',
          humidity: 60,
          windSpeed: 5,
          city: city || '台北'
        }
      });
    }

    let query;
    if (lat && lon) {
      query = `${lat},${lon}`;
    } else if (city) {
      query = encodeURIComponent(city);
    } else {
      return res.status(400).json({ error: '請提供城市名稱或經緯度' });
    }

    const url = `${WEATHERAPI_BASE_URL}/current.json?key=${WEATHERAPI_KEY}&q=${query}&aqi=no&lang=zh`;
    
    const response = await axios.get(url);
    const data = response.data;

    const weather = {
      temp: Math.round(data.current.temp_c),
      description: data.current.condition.text,
      icon: data.current.condition.icon,
      humidity: data.current.humidity,
      windSpeed: Math.round(data.current.wind_kph),
      city: data.location.name,
      country: data.location.country,
      feelsLike: Math.round(data.current.feelslike_c),
      pressure: data.current.pressure_mb,
      visibility: data.current.vis_km,
      sunrise: data.forecast?.forecastday[0]?.astro?.sunrise || '06:00',
      sunset: data.forecast?.forecastday[0]?.astro?.sunset || '18:00',
      uv: data.current.uv,
      lastUpdated: data.current.last_updated
    };

    res.json({ weather });
  } catch (error) {
    console.error('Weather API error:', error.response?.data || error.message);
    console.error('API Key exists:', !!WEATHERAPI_KEY);
    
    // 如果是API Key問題，返回預設數據
    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(200).json({ 
        weather: {
          temp: 25,
          description: '晴天',
          icon: '01d',
          humidity: 60,
          windSpeed: 5,
          city: city || '台北'
        }
      });
    }
    
    // 任何錯誤都返回預設數據，而不是 500 錯誤
    return res.status(200).json({ 
      weather: {
        temp: 25,
        description: '晴天',
        icon: '01d',
        humidity: 60,
        windSpeed: 5,
        city: city || '台北',
        country: 'TW',
        feelsLike: 25,
        pressure: 1013,
        visibility: 10,
        sunrise: '06:00',
        sunset: '18:00',
        uv: 5,
        lastUpdated: new Date().toISOString()
      }
    });
  }
});

// 獲取3天預報
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    
    if (!WEATHERAPI_KEY) {
      return res.status(500).json({ 
        error: 'WeatherAPI key not configured',
        forecast: []
      });
    }

    let query;
    if (lat && lon) {
      query = `${lat},${lon}`;
    } else if (city) {
      query = encodeURIComponent(city);
    } else {
      return res.status(400).json({ error: '請提供城市名稱或經緯度' });
    }

    const url = `${WEATHERAPI_BASE_URL}/forecast.json?key=${WEATHERAPI_KEY}&q=${query}&days=3&aqi=no&lang=zh`;
    
    const response = await axios.get(url);
    const data = response.data;

    // 處理預報數據
    const forecast = data.forecast.forecastday.map(day => ({
      date: day.date,
      temp: Math.round(day.day.avgtemp_c),
      description: day.day.condition.text,
      icon: day.day.condition.icon,
      humidity: day.day.avghumidity,
      windSpeed: Math.round(day.day.maxwind_kph),
      maxTemp: Math.round(day.day.maxtemp_c),
      minTemp: Math.round(day.day.mintemp_c),
      sunrise: day.astro.sunrise,
      sunset: day.astro.sunset
    }));

    res.json({ forecast });
  } catch (error) {
    console.error('Weather forecast API error:', error);
    // 返回預設預報數據
    return res.status(200).json({ 
      forecast: [
        {
          date: new Date().toISOString().split('T')[0],
          temp: 25,
          description: '晴天',
          icon: '01d',
          humidity: 60,
          windSpeed: 5,
          maxTemp: 28,
          minTemp: 22,
          sunrise: '06:00',
          sunset: '18:00'
        }
      ]
    });
  }
});

// 獲取用戶位置的天氣（基於IP）
router.get('/location', async (req, res) => {
  try {
    // 使用WeatherAPI.com的IP定位功能
    if (!WEATHERAPI_KEY) {
      return res.json({ 
        city: '台北',
        country: 'TW',
        lat: 25.0330,
        lon: 121.5654
      });
    }

    const url = `${WEATHERAPI_BASE_URL}/ip.json?key=${WEATHERAPI_KEY}`;
    const response = await axios.get(url);
    const data = response.data;

    res.json({ 
      city: data.city,
      country: data.country_code,
      lat: data.lat,
      lon: data.lon
    });
  } catch (error) {
    console.error('Location API error:', error);
    res.json({ 
      city: '台北',
      country: 'TW',
      lat: 25.0330,
      lon: 121.5654
    });
  }
});

module.exports = router; 