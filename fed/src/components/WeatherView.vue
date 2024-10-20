<template>
  <div class="weather-chart">
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="!error && weatherData">
      <div class="location">
        <h2>佛山南海天气预报</h2>
        <p>{{ weatherData.result.hourly.description }}</p>
      </div>
      <div class="summaries">
        <h3>天气概况</h3>
        <div v-for="(summary, index) in summaries" :key="index" class="summary">{{ summary || '-' }}</div>
      </div>
      <div v-for="(option, index) in chartOptions" :key="index" ref="charts" class="chart"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import dayjs from 'dayjs';

export default {
  data() {
    return {
      weatherData: null,
      error: null,
      chartOptions: [],
      summaries: [],
    };
  },
  mounted() {
    window.addEventListener('resize', this.resizeCharts);
    setTimeout(() => {
      this.fetchWeatherData();
    }, 100);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeCharts);
  },
  methods: {
    fetchWeatherData() {
      fetch('http://localhost:3000/proxy')
        .then(response => {
          if (response.status === 429) {
            this.error = '请求过多，请稍后再试。';
            return;
          }
          if (!response.ok) {
            throw new Error(`HTTP错误！状态：${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          this.weatherData = data;
          this.initCharts();
        })
        .catch(error => {
          this.error = '获取数据错误：' + error.message;
        });
    },
    initCharts() {
      const timeData = this.weatherData.result.hourly.temperature.map(item => dayjs(item.datetime).format('HH'));

      this.chartOptions = [
        {
          title: { text: '降水与云量' },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: timeData },
          yAxis: { type: 'value' },
          series: [
            {
              name: '降水量 (mm)',
              type: 'line',
              data: this.weatherData.result.hourly.precipitation.map(item => item.value),
            },
            {
              name: '降水概率 (%)',
              type: 'line',
              data: this.weatherData.result.hourly.precipitation.map(item => item.probability),
              smooth: true,
            },
            {
              name: '云量 (0.0-1.0)',
              type: 'line',
              data: this.weatherData.result.hourly.cloudrate.map(item => item.value),
              smooth: true,
            },
          ],
        },
        {
          title: { text: '气温与体感温度 (°C)' },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: timeData },
          yAxis: { type: 'value' },
          series: [
            {
              name: '地表 2 米气温',
              type: 'line',
              data: this.weatherData.result.hourly.temperature.map(item => item.value),
              smooth: true,
            },
            {
              name: '体感温度',
              type: 'line',
              data: this.weatherData.result.hourly.apparent_temperature.map(item => item.value),
              smooth: true,
            },
          ],
        },
        {
          title: { text: '气压与湿度' },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: timeData },
          yAxis: { type: 'value' },
          series: [
            {
              name: '地面气压 (hPa)',
              type: 'line',
              data: this.weatherData.result.hourly.pressure.map(item => item.value / 100),
              smooth: true,
            },
            {
              name: '相对湿度 (%)',
              type: 'line',
              data: this.weatherData.result.hourly.humidity.map(item => item.value * 100),
              smooth: true,
            },
          ],
        },
        {
          title: { text: '风速与风向' },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: timeData },
          yAxis: { type: 'value' },
          series: [
            {
              name: '风速 (m/s)',
              type: 'line',
              data: this.weatherData.result.hourly.wind.map(item => item.speed),
              smooth: true,
            },
            {
              name: '风向 (°)',
              type: 'line',
              data: this.weatherData.result.hourly.wind.map(item => item.direction),
              smooth: true,
            },
          ],
        },
        {
          title: { text: '能见度与PM2.5' },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: timeData },
          yAxis: { type: 'value' },
          series: [
            {
              name: '能见度 (km)',
              type: 'line',
              data: this.weatherData.result.hourly.visibility.map(item => item.value),
              smooth: true,
            },
            {
              name: 'PM2.5 (μg/m³)',
              type: 'line',
              data: this.weatherData.result.hourly.air_quality.pm25.map(item => item.value),
              smooth: true,
            },
            {
              name: 'AQI (国标)',
              type: 'line',
              data: this.weatherData.result.hourly.air_quality.aqi.map(item => item.value.chn),
              smooth: true,
            },
          ],
        },
        {
          title: { text: '向下短波辐射通量' },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: timeData },
          yAxis: { type: 'value' },
          series: [
            {
              name: '向下短波辐射通量 (W/m²)',
              type: 'line',
              data: this.weatherData.result.hourly.dswrf.map(item => item.value),
              smooth: true,
            },
          ],
        },
      ];

      // 生成概括信息
      this.summaries = [];

      // 降水概率概括
      const precipitationProbabilities = this.weatherData.result.hourly.precipitation.map(item => item.probability);
      const timePeriodsWithHighPrecipitation = timeData.filter((_, index) => precipitationProbabilities[index] > 0.5);
      if (timePeriodsWithHighPrecipitation.length > 0) {
        this.summaries.push(`${timePeriodsWithHighPrecipitation.join(', ')}点降水概率超过50%。`);
      }

      // 气温概括
      const temperatures = this.weatherData.result.hourly.temperature.map(item => item.value);
      const highTemp = Math.max(...temperatures);
      const lowTemp = Math.min(...temperatures);
      const highTempTime = timeData[temperatures.indexOf(highTemp)];
      const lowTempTime = timeData[temperatures.indexOf(lowTemp)];
      
      if (highTemp > 30) {
        this.summaries.push(`高温预警：气温最高达到 ${highTemp}°C，出现在 ${highTempTime}点。`);
      }
      if (lowTemp < 0) {
        this.summaries.push(`低温预警：气温最低降至 ${lowTemp}°C，出现在 ${lowTempTime}点。`);
      }

      // 风速概括
      const windSpeeds = this.weatherData.result.hourly.wind.map(item => item.speed);
      const maxWindSpeed = Math.max(...windSpeeds);
      const maxWindSpeedTime = timeData[windSpeeds.indexOf(maxWindSpeed)];
      if (maxWindSpeed > 30) {
        this.summaries.push(`${maxWindSpeedTime}点风速较大，最高风速超过 30 m/s。`);
      }

      this.$nextTick(() => {
        this.chartOptions.forEach((option, index) => {
          const chartInstance = echarts.init(this.$refs.charts[index]);
          chartInstance.setOption(option);
        });
      });
    },
    resizeCharts() {
      this.chartOptions.forEach((_, index) => {
        const chartInstance = echarts.getInstanceByDom(this.$refs.charts[index]);
        if (chartInstance) {
          chartInstance.resize();
        }
      });
    },
  },
};
</script>

<style scoped>
.weather-chart {
  font-family: Arial, sans-serif;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.location {
  margin-bottom: 20px;
}

.location h2 {
  font-size: 24px;
  margin-bottom: 5px;
}

.chart {
  width: 100%;
  height: 400px;
  margin-bottom: 20px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.summaries {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}

.summary {
  margin: 10px 0;
  font-weight: bold;
  color: #d9534f; /* A color for warnings */
  cursor: pointer;
  transition: background-color 0.2s;
}

.summary:hover {
  background-color: #f0f0f0; /* Light gray on hover */
}

.error {
  color: #d9534f;
  font-weight: bold;
  margin-bottom: 20px;
}

@media (max-width: 600px) {
  .weather-chart {
    padding: 10px;
  }

  .chart {
    height: 300px;
  }
}
</style>