// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');  // 引入 cors 中间件

const app = express();

// 启用 CORS 中间件，允许所有来源
app.use(cors());

app.get('/', (req, res) => {
    res.send('Welcome to the API!');  // 或者返回其他内容
});


// 代理的路由
app.get('/proxy', async (req, res) => {
  console.log("Proxy route accessed");
  try {
    // 修改点1：替换为你自己的 彩云天气 token， 具体获取方式请参考 https://platform.caiyunapp.com/
    // 修改点2：替换为你需要获取的城市经纬度，例如111.132311,25.056656
    // 例子：https://api.caiyunapp.com/v2.6/TAkhjf8d1nlSlspN/101.6656,39.2072/hourly?hourlysteps=1
    const response = await axios.get('https://api.caiyunapp.com/v2.6/修改点1/修改点2/hourly?hourlysteps=10');
    
    console.log("Response data:", response.data);
    
    res.json(response.data);
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
