// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');  // 引入 cors 中间件
const { token, location, key } = require('./config') // 引入配置文件

const app = express();

// 启用 CORS 中间件，允许所有来源
app.use(cors());

app.get('/', (req, res) => {
    res.send('Welcome to the API!');  // 或者返回其他内容
});


// 代理的路由
app.get('/proxy', async (req, res) => {
  try {
    // 修改点1：替换为你自己的 彩云天气 token， 具体获取方式请参考 https://platform.caiyunapp.com/
    // 修改点2：替换为你需要获取的城市经纬度，例如111.132311,25.056656
    // 例子：https://api.caiyunapp.com/v2.6/TAkhjf8d1nlSlspN/101.6656,39.2072/hourly?hourlysteps=1
    // const response = await axios.get('https://api.caiyunapp.com/v2.6/修改点1/修改点2/hourly?hourlysteps=10');
    const locationToUse = req.query.myLocation || location; // 使用 myLocation 或 location
    // config.js 是我的文件，里面：
    // module.exports = {
    //   token: 'xxxx', // 彩云天气
    //   location: '113.xxxx,23.xxxxx', // 初始位置
    //   key: 'xxxxxxxxxxx'  // 高德地图API的key
    // };
    
    const response = await axios.get(`https://api.caiyunapp.com/v2.6/${token}/${locationToUse}/hourly?hourlysteps=10`);
    
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data:", error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});

app.get('/location', async (req, res) => {
  try {
    const req_location = req.query.location;
    console.log("req_location:", req_location);
    const response = await axios.get(`https://restapi.amap.com/v3/geocode/geo?address=${req_location}&output=JSON&key=${key}`);
    const geocodes = response.data.geocodes;
    if (Array.isArray(geocodes) && geocodes.length > 0) {
      console.log("geocodes[0]:", geocodes[0]);
      res.json(geocodes[0]);
    } else {
      console.error("No geocodes found or invalid format");
      res.status(404).send("No geocodes found for the specified location");
    }    
  } catch (error) {
    console.error("Error fetching data:", error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).send(error.message);
  }
});

// 设置服务器监听端口
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
  // url
  console.log(`http://localhost:${PORT}/proxy`);
});
