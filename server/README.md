# Server
## 简介
服务器端，主要负责处理客户端的api请求，并返回相应的结果。解决cors跨域问题，实现数据交互。

## 目录结构
```
PS D:\Desktop\aa\server> treee -I node_modules
server
├── package-lock.json
├── package.json
├── readme.md
└── server.js
```

## 技术栈
- Node.js
- Express.js
- axios
- cors


## 运行
1.安装node.js环境（官网下载安装包安装），并确保npm可用。
2.安装依赖包：
```
npm install
npm run start
```

## 注意
1.彩云天气的api接口token[https://platform.caiyunapp.com/]需要自己申请，并在server.js中替换掉。
2.如果npm install安装失败，请尝试使用淘宝镜像源：
```
npm config set registry http://registry.npm.taobao.org
```



