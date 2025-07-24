import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  city: string;
  country: string;
  feelsLike: number;
  pressure: number;
  visibility: number;
  sunrise: string;
  sunset: string;
  weekday?: string;
}

interface WeatherWidgetProps {
  className?: string;
  showDetails?: boolean;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ className = '', showDetails = false }) => {
  const { lang } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 使用預設城市，不根據瀏覽器位置
      const defaultCity = '台北';
      const response = await fetch(`https://restarter-backend-6e9s.onrender.com/api/weather/current?city=${defaultCity}`);
      const data = await response.json();
      
      if (data.weather) {
        // 使用本地化顯示
        const localizedWeather = getLocalizedWeather(data.weather);
        setWeather(localizedWeather);
      } else {
        setError(data.error || '無法獲取天氣資訊');
      }
    } catch (err) {
      setError('天氣服務暫時無法使用');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 獲取本地化天氣顯示
  const getLocalizedWeather = (weather: any) => {
    // 天氣描述多語言映射
    const weatherDescMap: Record<string, Record<string, string>> = {
      'zh-TW': {
        'clear sky': '晴天',
        'few clouds': '少雲',
        'scattered clouds': '多雲',
        'broken clouds': '陰天',
        'shower rain': '陣雨',
        'rain': '下雨',
        'thunderstorm': '雷雨',
        'snow': '下雪',
        'mist': '霧',
        'fog': '霧',
        'haze': '霾',
        'smoke': '煙霧',
        'dust': '沙塵',
        'sand': '沙塵',
        'ash': '火山灰',
        'squall': '狂風',
        'tornado': '龍捲風'
      },
      'zh-CN': {
        'clear sky': '晴天',
        'few clouds': '少云',
        'scattered clouds': '多云',
        'broken clouds': '阴天',
        'shower rain': '阵雨',
        'rain': '下雨',
        'thunderstorm': '雷雨',
        'snow': '下雪',
        'mist': '雾',
        'fog': '雾',
        'haze': '霾',
        'smoke': '烟雾',
        'dust': '沙尘',
        'sand': '沙尘',
        'ash': '火山灰',
        'squall': '狂风',
        'tornado': '龙卷风'
      },
      'en': {
        'clear sky': 'Clear',
        'few clouds': 'Partly Cloudy',
        'scattered clouds': 'Cloudy',
        'broken clouds': 'Overcast',
        'shower rain': 'Showers',
        'rain': 'Rain',
        'thunderstorm': 'Thunderstorm',
        'snow': 'Snow',
        'mist': 'Mist',
        'fog': 'Fog',
        'haze': 'Haze',
        'smoke': 'Smoke',
        'dust': 'Dust',
        'sand': 'Sand',
        'ash': 'Ash',
        'squall': 'Squall',
        'tornado': 'Tornado'
      },
      'ja': {
        'clear sky': '晴天',
        'few clouds': '晴れ時々曇り',
        'scattered clouds': '曇り',
        'broken clouds': '曇り',
        'shower rain': 'にわか雨',
        'rain': '雨',
        'thunderstorm': '雷雨',
        'snow': '雪',
        'mist': '霧',
        'fog': '霧',
        'haze': 'もや',
        'smoke': '煙',
        'dust': '砂塵',
        'sand': '砂塵',
        'ash': '火山灰',
        'squall': '突風',
        'tornado': '竜巻'
      },
      'ko': {
        'clear sky': '맑음',
        'few clouds': '구름 조금',
        'scattered clouds': '구름 많음',
        'broken clouds': '흐림',
        'shower rain': '소나기',
        'rain': '비',
        'thunderstorm': '천둥번개',
        'snow': '눈',
        'mist': '안개',
        'fog': '안개',
        'haze': '연무',
        'smoke': '연기',
        'dust': '먼지',
        'sand': '모래',
        'ash': '화산재',
        'squall': '돌풍',
        'tornado': '토네이도'
      },
      'th': {
        'clear sky': 'ท้องฟ้าแจ่มใส',
        'few clouds': 'มีเมฆบางส่วน',
        'scattered clouds': 'มีเมฆมาก',
        'broken clouds': 'เมฆมาก',
        'shower rain': 'ฝนตกเป็นช่วง',
        'rain': 'ฝนตก',
        'thunderstorm': 'พายุฝนฟ้าคะนอง',
        'snow': 'หิมะตก',
        'mist': 'หมอก',
        'fog': 'หมอก',
        'haze': 'หมอกควัน',
        'smoke': 'ควัน',
        'dust': 'ฝุ่น',
        'sand': 'ทราย',
        'ash': 'เถ้าถ่าน',
        'squall': 'ลมกระโชก',
        'tornado': 'พายุทอร์นาโด'
      },
      'vi': {
        'clear sky': 'Trời quang',
        'few clouds': 'Ít mây',
        'scattered clouds': 'Nhiều mây',
        'broken clouds': 'U ám',
        'shower rain': 'Mưa rào',
        'rain': 'Mưa',
        'thunderstorm': 'Giông bão',
        'snow': 'Tuyết',
        'mist': 'Sương mù',
        'fog': 'Sương mù',
        'haze': 'Sương mù nhẹ',
        'smoke': 'Khói',
        'dust': 'Bụi',
        'sand': 'Cát',
        'ash': 'Tro núi lửa',
        'squall': 'Gió mạnh',
        'tornado': 'Lốc xoáy'
      },
      'ms': {
        'clear sky': 'Cerah',
        'few clouds': 'Sedikit berawan',
        'scattered clouds': 'Berawan',
        'broken clouds': 'Mendung',
        'shower rain': 'Hujan renyai',
        'rain': 'Hujan',
        'thunderstorm': 'Ribut petir',
        'snow': 'Salji',
        'mist': 'Kabut',
        'fog': 'Kabut',
        'haze': 'Jerebu',
        'smoke': 'Asap',
        'dust': 'Debu',
        'sand': 'Pasir',
        'ash': 'Abu gunung berapi',
        'squall': 'Angin kencang',
        'tornado': 'Puting beliung'
      },
      'la': {
        'clear sky': 'Serenum',
        'few clouds': 'Nubibus paucis',
        'scattered clouds': 'Nubibus dispersis',
        'broken clouds': 'Nubibus fractis',
        'shower rain': 'Imbre',
        'rain': 'Pluvia',
        'thunderstorm': 'Tempestas',
        'snow': 'Nix',
        'mist': 'Nebula',
        'fog': 'Nebula',
        'haze': 'Caligo',
        'smoke': 'Fumus',
        'dust': 'Pulvis',
        'sand': 'Arena',
        'ash': 'Cinis',
        'squall': 'Procella',
        'tornado': 'Turbo'
      }
    };

    // 城市名稱多語言映射
    const cityNameMap: Record<string, Record<string, string>> = {
      'zh-TW': {
        'Taipei': '台北',
        'Taichung': '台中',
        'Tainan': '台南',
        'Kaohsiung': '高雄',
        'New Taipei': '新北',
        'Taoyuan': '桃園',
        'Hsinchu': '新竹',
        'Chiayi': '嘉義',
        'Keelung': '基隆',
        'Hualien': '花蓮',
        'Taitung': '台東',
        'Pingtung': '屏東',
        'Yilan': '宜蘭',
        'Nantou': '南投',
        'Yunlin': '雲林',
        'Changhua': '彰化',
        'Miaoli': '苗栗'
      },
      'zh-CN': {
        'Taipei': '台北',
        'Taichung': '台中',
        'Tainan': '台南',
        'Kaohsiung': '高雄',
        'New Taipei': '新北',
        'Taoyuan': '桃园',
        'Hsinchu': '新竹',
        'Chiayi': '嘉义',
        'Keelung': '基隆',
        'Hualien': '花莲',
        'Taitung': '台东',
        'Pingtung': '屏东',
        'Yilan': '宜兰',
        'Nantou': '南投',
        'Yunlin': '云林',
        'Changhua': '彰化',
        'Miaoli': '苗栗'
      },
      'en': {
        'Taipei': 'Taipei',
        'Taichung': 'Taichung',
        'Tainan': 'Tainan',
        'Kaohsiung': 'Kaohsiung',
        'New Taipei': 'New Taipei',
        'Taoyuan': 'Taoyuan',
        'Hsinchu': 'Hsinchu',
        'Chiayi': 'Chiayi',
        'Keelung': 'Keelung',
        'Hualien': 'Hualien',
        'Taitung': 'Taitung',
        'Pingtung': 'Pingtung',
        'Yilan': 'Yilan',
        'Nantou': 'Nantou',
        'Yunlin': 'Yunlin',
        'Changhua': 'Changhua',
        'Miaoli': 'Miaoli'
      },
      'ja': {
        'Taipei': '台北',
        'Taichung': '台中',
        'Tainan': '台南',
        'Kaohsiung': '高雄',
        'New Taipei': '新北',
        'Taoyuan': '桃園',
        'Hsinchu': '新竹',
        'Chiayi': '嘉義',
        'Keelung': '基隆',
        'Hualien': '花蓮',
        'Taitung': '台東',
        'Pingtung': '屏東',
        'Yilan': '宜蘭',
        'Nantou': '南投',
        'Yunlin': '雲林',
        'Changhua': '彰化',
        'Miaoli': '苗栗'
      },
      'ko': {
        'Taipei': '타이페이',
        'Taichung': '타이중',
        'Tainan': '타이난',
        'Kaohsiung': '가오슝',
        'New Taipei': '신베이',
        'Taoyuan': '타오위안',
        'Hsinchu': '신주',
        'Chiayi': '자이',
        'Keelung': '지룽',
        'Hualien': '화롄',
        'Taitung': '타이둥',
        'Pingtung': '핑둥',
        'Yilan': '이란',
        'Nantou': '난터우',
        'Yunlin': '윈린',
        'Changhua': '창화',
        'Miaoli': '먀오리'
      },
      'th': {
        'Taipei': 'ไทเป',
        'Taichung': 'ไทจง',
        'Tainan': 'ไทหนาน',
        'Kaohsiung': 'เกาสง',
        'New Taipei': 'ซินเป่ย์',
        'Taoyuan': 'เถาหยวน',
        'Hsinchu': 'ซินจู๋',
        'Chiayi': 'เจียอี้',
        'Keelung': 'จีหลง',
        'Hualien': 'ฮวาเหลียน',
        'Taitung': 'ไถตง',
        'Pingtung': 'ผิงตง',
        'Yilan': 'อี๋หลาน',
        'Nantou': 'หนานโถว',
        'Yunlin': 'ยฺหวินหลิน',
        'Changhua': 'จางฮัว',
        'Miaoli': 'เหมียวลี่'
      },
      'vi': {
        'Taipei': 'Đài Bắc',
        'Taichung': 'Đài Trung',
        'Tainan': 'Đài Nam',
        'Kaohsiung': 'Cao Hùng',
        'New Taipei': 'Tân Bắc',
        'Taoyuan': 'Đào Viên',
        'Hsinchu': 'Tân Trúc',
        'Chiayi': 'Gia Nghĩa',
        'Keelung': 'Cơ Long',
        'Hualien': 'Hoa Liên',
        'Taitung': 'Đài Đông',
        'Pingtung': 'Bình Đông',
        'Yilan': 'Nghi Lan',
        'Nantou': 'Nam Đầu',
        'Yunlin': 'Vân Lâm',
        'Changhua': 'Chương Hóa',
        'Miaoli': 'Miêu Lật'
      },
      'ms': {
        'Taipei': 'Taipei',
        'Taichung': 'Taichung',
        'Tainan': 'Tainan',
        'Kaohsiung': 'Kaohsiung',
        'New Taipei': 'New Taipei',
        'Taoyuan': 'Taoyuan',
        'Hsinchu': 'Hsinchu',
        'Chiayi': 'Chiayi',
        'Keelung': 'Keelung',
        'Hualien': 'Hualien',
        'Taitung': 'Taitung',
        'Pingtung': 'Pingtung',
        'Yilan': 'Yilan',
        'Nantou': 'Nantou',
        'Yunlin': 'Yunlin',
        'Changhua': 'Changhua',
        'Miaoli': 'Miaoli'
      },
      'la': {
        'Taipei': 'Taipeium',
        'Taichung': 'Taichungum',
        'Tainan': 'Tainanum',
        'Kaohsiung': 'Kaohsiungum',
        'New Taipei': 'Novum Taipeium',
        'Taoyuan': 'Taoyuanum',
        'Hsinchu': 'Hsinchuum',
        'Chiayi': 'Chiayium',
        'Keelung': 'Keelungum',
        'Hualien': 'Hualienum',
        'Taitung': 'Taitungum',
        'Pingtung': 'Pingtungum',
        'Yilan': 'Yilanum',
        'Nantou': 'Nantouum',
        'Yunlin': 'Yunlinum',
        'Changhua': 'Changhuaum',
        'Miaoli': 'Miaolium'
      }
    };

    // 星期多語言映射
    const weekdayMap: Record<string, string[]> = {
      'zh-TW': ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      'zh-CN': ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      'en': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      'ja': ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
      'ko': ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
      'th': ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'],
      'vi': ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
      'ms': ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'],
      'la': ['Dies Solis', 'Dies Lunae', 'Dies Martis', 'Dies Mercurii', 'Dies Iovis', 'Dies Veneris', 'Dies Saturni']
    };

    // 獲取本地化內容
    const localizedDesc = weatherDescMap[lang]?.[weather.description.toLowerCase()] || weather.description;
    const localizedCity = cityNameMap[lang]?.[weather.city] || weather.city;
    const currentWeekday = weekdayMap[lang]?.[new Date().getDay()] || weekdayMap['en'][new Date().getDay()];

    return {
      ...weather,
      description: localizedDesc,
      city: localizedCity,
      weekday: currentWeekday
    };
  };

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getWeekdayText = (date: Date) => {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `星期${weekdays[date.getDay()]}`;
  };

  if (loading) {
    return (
      <div className={`weather-widget loading ${className}`}>
        <div className="weather-skeleton">
          <div className="temp-skeleton"></div>
          <div className="desc-skeleton"></div>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={`weather-widget error ${className}`}>
        <div className="weather-error">
          <span>🌤️</span>
          <span>天氣資訊暫時無法顯示</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`weather-widget ${className}`}>
      <div className="weather-main">
        <div className="weather-left">
          <div className="weather-icon">
            <img src={getWeatherIcon(weather.icon)} alt={weather.description} />
          </div>
          <div className="weather-info">
            <div className="weather-temp">{weather.temp}°C</div>
            <div className="weather-desc">{weather.description}</div>
          </div>
        </div>
        <div className="weather-center">
          <div className="weather-city">{weather.city}</div>
        </div>
                     <div className="weather-right">
               <div className="weather-weekday">{weather.weekday}</div>
             </div>
      </div>
      
      {showDetails && (
        <div className="weather-details">
          <div className="weather-detail-item">
            <span>體感溫度</span>
            <span>{weather.feelsLike}°C</span>
          </div>
          <div className="weather-detail-item">
            <span>濕度</span>
            <span>{weather.humidity}%</span>
          </div>
          <div className="weather-detail-item">
            <span>風速</span>
            <span>{weather.windSpeed} m/s</span>
          </div>
          <div className="weather-detail-item">
            <span>能見度</span>
            <span>{weather.visibility} km</span>
          </div>
        </div>
      )}
      
      <style>{`
        .weather-widget {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 10px;
          padding: 8px 12px;
          box-shadow: 0 2px 8px rgba(107, 91, 255, 0.1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin-top: 8px;
        }
        
        .weather-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }
        
        .weather-left {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .weather-icon img {
          width: 28px;
          height: 28px;
        }
        
        .weather-info {
          flex: 1;
        }
        
        .weather-temp {
          font-size: 16px;
          font-weight: 700;
          color: #6B5BFF;
          line-height: 1;
        }
        
        .weather-desc {
          font-size: 11px;
          color: #666;
          margin-top: 1px;
        }
        
        .weather-center {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
        }
        
        .weather-city {
          font-size: 10px;
          color: #666;
          text-align: center;
        }
        
        .weather-right {
          display: flex;
          align-items: center;
        }
        
        .weather-weekday {
          font-size: 11px;
          color: #6B5BFF;
          font-weight: 600;
          padding: 3px 6px;
          background: rgba(107, 91, 255, 0.1);
          border-radius: 4px;
        }
        
        .weather-details {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #eee;
        }
        
        .weather-detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }
        
        .weather-error {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #999;
          font-size: 14px;
        }
        
        .weather-skeleton {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .temp-skeleton {
          width: 60px;
          height: 24px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }
        
        .desc-skeleton {
          width: 80px;
          height: 14px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }
        
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default WeatherWidget; 