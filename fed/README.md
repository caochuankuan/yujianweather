# 彩云天气api

## 简介
通过调用彩云天气的api, 结合echarts, 可视化天气数据。

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
```
https://docs.caiyunapp.com/weather-api/
```