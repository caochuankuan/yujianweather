# 彩云天气api

## 简介
通过调用彩云天气的api, 结合echarts, 可视化天气数据。
通过高德地图api获取用户当前位置的天气数据。

## 项目结构
```
PS D:\Desktop\aa\fed> treee -I node_modules
fed
├── README.md
├── babel.config.js
├── jsconfig.json
├── package-lock.json
├── package.json
├── public
│   ├── favicon.ico
│   └── index.html
├── src
│   ├── App.vue
│   ├── components
│   │   └── WeatherView.vue
│   └── main.js
└── vue.config.js
```

## 技术栈
- Vue
- echarts
- axios
- dayjs

## 运行项目
1.安装node.js环境（官网下载安装包安装），并确保npm可用。
2.安装依赖包：
```
npm install
npm run serve
```

## 温馨提示
如果npm install安装失败，请尝试使用淘宝镜像源：
```
npm config set registry http://registry.npm.taobao.org
```

## 接口文档
1. 彩云天气api：
```
https://docs.caiyunapp.com/weather-api/
```
2. 高德地图api：
```
https://lbs.amap.com/api/webservice/guide/api/georegeo
```



## Elememt Plus
使用Element Plus作为UI组件库，可以快速搭建页面。
1. 安装依赖包：
```
npm install element-plus --save
```
2. 在main.js中引入Element Plus：
```
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

createApp(App).use(ElementPlus).mount('#app')
```
