<template>
  <div class="weather-chart">
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="!error && weatherData">
      <div class="location">
        <h2>{{ formatted_address }}天气预报 <el-button @click="handleSearch" type="primary" :icon="Edit" circle /></h2>
        <p>{{ weatherData.result.hourly.description }}</p>
      </div>
      <div class="summaries">
        <el-card class="weather-summary" shadow="hover">
          <h3 class="title">天气概况 - {{ dayjs(weatherData.result.hourly.cloudrate[0].datetime).format('HH') }}时</h3>
          <el-divider></el-divider>
          <el-row>
            <el-col :span="12">
              <div class="summary-item">
                <el-icon><SuitcaseLine /></el-icon>
                <div><strong>云量：</strong> {{ weatherData.result.hourly.cloudrate[0].value }}</div>
              </div>
              <div class="summary-item">
                <el-icon><MagicStick /></el-icon>
                <div><strong>降水量：</strong> {{ weatherData.result.hourly.precipitation[0].value }} mm</div>
              </div>
              <div class="summary-item">
                <el-icon><Basketball /></el-icon>
                <div><strong>降水概率：</strong> {{ weatherData.result.hourly.precipitation[0].probability }}%</div>
              </div>
              <div class="summary-item">
                <el-icon><ShoppingTrolley /></el-icon>
                <div><strong>体感温度：</strong> {{ weatherData.result.hourly.apparent_temperature[0].value }} °C</div>
              </div>
              <div class="summary-item">
                <el-icon><Sunny /></el-icon>
                <div><strong>地表 2 米气温：</strong> {{ weatherData.result.hourly.temperature[0].value }} °C</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="summary-item">
                <el-icon><Apple /></el-icon>
                <div><strong>地面气压：</strong> {{ (weatherData.result.hourly.pressure[0].value / 100).toFixed(2) }} hPa
                </div>
              </div>
              <div class="summary-item">
                <el-icon><Sugar /></el-icon>
                <div><strong>相对湿度：</strong> {{ (weatherData.result.hourly.humidity[0].value * 100).toFixed(2) }}%</div>
              </div>
              <div class="summary-item">
                <el-icon><VideoCameraFilled /></el-icon>
                <div><strong>风速：</strong> {{ weatherData.result.hourly.wind[0].speed }} m/s</div>
              </div>
              <div class="summary-item">
                <el-icon><List /></el-icon>
                <div><strong>风向：</strong> {{ weatherData.result.hourly.wind[0].direction }}°</div>
              </div>
              <div class="summary-item">
                <el-icon><TrendCharts /></el-icon>
                <div><strong>PM2.5：</strong> {{ weatherData.result.hourly.air_quality.pm25[0].value }} μg/m³</div>
              </div>
            </el-col>
          </el-row>
          <el-divider></el-divider>
          <el-row>
            <el-col :span="12">
              <div class="summary-item">
                <el-icon><Promotion /></el-icon>
                <div><strong>能见度：</strong> {{ weatherData.result.hourly.visibility[0].value }} km</div>
              </div>
              <div class="summary-item">
                <el-icon><HomeFilled /></el-icon>
                <div><strong>AQI (国标)：</strong> {{ weatherData.result.hourly.air_quality.aqi[0].value.chn }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="summary-item">
                <el-icon><Headset /></el-icon>
                <div><strong>向下短波辐射通量：</strong> {{ weatherData.result.hourly.dswrf[0].value }} W/m²</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </div>
      <div class="summaries" v-if="summaries.length">
        <h3>温馨提示</h3>
        <div v-for="(summary, index) in summaries" :key="index" class="summary">{{ summary || '-' }}</div>
      </div>
      <div v-for="(option, index) in chartOptions" :key="index" ref="charts" class="chart"></div>
    </div>
  </div>

  <el-dialog v-model="dialogFormVisible" title="地点" width="500">
    <el-form :model="form">
      <el-form-item label="地点" :label-width="formLabelWidth">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="fetchLocationData">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { Edit, SuitcaseLine, MagicStick, Basketball, ShoppingTrolley, Sunny, Apple, Sugar, VideoCameraFilled, List, TrendCharts, Promotion, HomeFilled, Headset } from '@element-plus/icons-vue';
</script>

<script>
import * as echarts from 'echarts';
import dayjs from 'dayjs';

export default {
  data() {
    return {
      myLocation: '',
      formatted_address: '佛山南海',
      weatherData: null,
      error: null,
      chartOptions: [],
      summaries: [],
      form: {
        name: '',
      },
      dialogFormVisible: false,
      formLabelWidth: '120px',
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
      fetch('http://localhost:3000/proxy?myLocation=' + this.myLocation)
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
      const timeData = this.weatherData.result.hourly.temperature.map(item => dayjs(item.datetime).format('HH') + '时');

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
          // 检查并销毁已有图表实例
          const chartDom = this.$refs.charts[index];
          let existingChart = echarts.getInstanceByDom(chartDom);
          if (existingChart) {
            existingChart.dispose(); // 销毁已有图表实例
          }

          // 初始化新图表
          const chartInstance = echarts.init(chartDom);
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
    handleSearch() {
      this.dialogFormVisible = true;
      this.form.name = '';
    },
    fetchLocationData() {
      this.error = null;
      this.dialogFormVisible = false;
      // 传入地点名称
      fetch('http://localhost:3000/location?location=' + this.form.name)
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
          console.log(data);
          this.myLocation = data.location;
          this.formatted_address = data.formatted_address;
          this.fetchWeatherData();
        })
        .catch(error => {
          this.error = '获取数据错误：' + error.message;
        });
    }
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
  color: #d9534f;
  /* A color for warnings */
  cursor: pointer;
  transition: background-color 0.2s;
}

.title {
  font-size: 20px;
  margin-bottom: 10px;
}

.summary-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}


.summary:hover {
  background-color: #5246f3;
  /* Light gray on hover */
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