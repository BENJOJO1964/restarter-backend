const express = require('express');
const router = express.Router();
const axios = require('axios');

// OpenWeatherMap API 配置
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// 獲取當前天氣
router.get('/current', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    
    if (!OPENWEATHER_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenWeatherMap API key not configured',
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

    let url;
    if (lat && lon) {
      url = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=zh_tw`;
    } else if (city) {
      url = `${OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=zh_tw`;
    } else {
      return res.status(400).json({ error: '請提供城市名稱或經緯度' });
    }

    const response = await axios.get(url);
    const data = response.data;

    const weather = {
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      city: data.name,
      country: data.sys.country,
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
      visibility: data.visibility / 1000, // 轉換為公里
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000)
    };

    res.json({ weather });
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ 
      error: '無法獲取天氣資訊',
      weather: {
        temp: 25,
        description: '晴天',
        icon: '01d',
        humidity: 60,
        windSpeed: 5,
        city: '台北'
      }
    });
  }
});

// 獲取5天預報
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    
    if (!OPENWEATHER_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenWeatherMap API key not configured',
        forecast: []
      });
    }

    let url;
    if (lat && lon) {
      url = `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=zh_tw`;
    } else if (city) {
      url = `${OPENWEATHER_BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=zh_tw`;
    } else {
      return res.status(400).json({ error: '請提供城市名稱或經緯度' });
    }

    const response = await axios.get(url);
    const data = response.data;

    // 處理預報數據，按天分組
    const dailyForecast = {};
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyForecast[date]) {
        dailyForecast[date] = {
          date: new Date(item.dt * 1000),
          temp: Math.round(item.main.temp),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed)
        };
      }
    });

    const forecast = Object.values(dailyForecast).slice(0, 5); // 只取5天
    res.json({ forecast });
  } catch (error) {
    console.error('Weather forecast API error:', error);
    res.status(500).json({ 
      error: '無法獲取天氣預報',
      forecast: []
    });
  }
});

// 獲取用戶位置的天氣（基於IP）
router.get('/location', async (req, res) => {
  try {
    // 這裡可以整合IP地理位置服務
    // 暫時返回預設位置
    res.json({ 
      city: '台北',
      country: 'TW',
      lat: 25.0330,
      lon: 121.5654
    });
  } catch (error) {
    console.error('Location API error:', error);
    res.status(500).json({ error: '無法獲取位置資訊' });
  }
});

module.exports = router; 