// server.js
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const cors = require('cors');
const dayjs = require('dayjs');
const lunar = require('lunar-javascript');
const sha1 = require('sha1');
const { token, location, key, FEISHU_WEBHOOK_URL, WECHAT_USER_ID, WECHAT_TEMPLATE_ID, appid, secret } = require('./config');

const app = express();

// 启用 CORS 中间件
app.use(cors());


app.get('/', (req, res) => {
    const token = "yujianyifeng";
    const signature = req.query.signature;
    const nonce = req.query.nonce;
    const timestamp = req.query.timestamp;

    const str = [token, timestamp, nonce].sort().join('');
    const sha = sha1(str);

    if (sha === signature) {
        const echostr = req.query.echostr;
        res.send(echostr + "");
    } else {
        res.send("验证失败");
    }
});

// 获取天气信息
async function getWeatherData() {
    try {
        const response = await axios.get(`https://api.caiyunapp.com/v2.6/${token}/${location}/hourly?hourlysteps=1`);
        return response.data.result.hourly;
    } catch (error) {
        console.error('获取天气数据失败:', error);
        return null;
    }
}

// 获取 access_token
async function getAccessToken() {
    try {
        const response = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
            params: {
                grant_type: 'client_credential',
                appid, // AppID
                secret // AppSecret
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('获取 access_token 失败:', error);
        return null;
    }
}

// 发送消息到飞书和微信
async function sendMessages(weatherData) {
    const cloudRate = weatherData.cloudrate[0].value;
    const weatherCondition = cloudRate < 0.2 ? '晴朗' : 
                              cloudRate < 0.5 ? '少云' : 
                              cloudRate < 0.8 ? '多云' : '阴天';
    const precipitationProbability = weatherData.precipitation[0].probability;
    const apparentTemperature = weatherData.apparent_temperature[0].value;
    const windSpeed = weatherData.wind[0].speed;

    const currentTime = dayjs().format('MM-DD HH:mm:ss');
    const lunarDate = lunar.Lunar.fromDate(new Date()).toString();
    const weekDay = dayjs().format('dddd');

    // 微信模板消息
    const wechatMessageData = {
        touser: WECHAT_USER_ID,
        template_id: WECHAT_TEMPLATE_ID,
        url: 'http://chuankuan.com.cn',
        data: {
            first: {
                value: "遇见天气-佛山南海",
                color: "#173177"
            },
            currentTime: {
                value: currentTime,
                color: "#173177"
            },
            weather: {
                value: `天气状况: ${weatherCondition}`,
                color: "#173177"
            },
            precipitationProbability: {
                value: `降水概率: ${precipitationProbability}%`,
                color: "#173177"
            },
            apparentTemperature: {
                value: `体感温度: ${apparentTemperature}°C`,
                color: "#173177"
            },
            windSpeed: {
                value: `风速: ${windSpeed} m/s`,
                color: "#173177"
            },
            lunarDate: {
                value: lunarDate,
                color: "#173177"
            },
            weekDay: {
                value: weekDay,
                color: "#173177"
            },
            remark: {
                value: "感谢您的关注！",
                color: "#173177"
            }
        }
    };

    // 飞书消息
    const feishuMessage = {
        msg_type: "interactive",
        card: {
            header: {
                title: {
                    content: "遇见天气-佛山南海",
                    tag: "plain_text"
                }
            },
            elements: [
                {
                    tag: "div",
                    text: {
                        content: `**😀更新时间**: ${currentTime}\n**🥰天气状况**: ${weatherCondition}\n**😛降水概率**: ${precipitationProbability}%\n**🤪体感温度**: ${apparentTemperature}°C\n**🤠风速**: ${windSpeed} m/s\n\n**🥳农历日期**: ${lunarDate}\n**👋星期**: ${weekDay}\n`,
                        tag: "lark_md"
                    }
                },
                {
                    tag: "action",
                    actions: [
                        {
                            tag: "button",
                            text: {
                                content: "😀😀🍞😀😃",
                                tag: "lark_md"
                            },
                            url: "http://chuankuan.com.cn",
                            type: "default",
                            value: {}
                        }
                    ]
                }
            ]
        }
    };

    // 发送微信模板消息
    const wechatPostUrl = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${await getAccessToken()}`;
    await axios.post(wechatPostUrl, wechatMessageData);

    // 发送飞书消息
    await axios.post(FEISHU_WEBHOOK_URL, feishuMessage);

    console.log('消息发送成功!');
}

// 定时任务设置（每天早上8点、晚上6点和凌晨0点各发一次）
cron.schedule('0 0,8,18 * * *', async () => {
    console.log('开始定时推送模板消息');
    const weatherData = await getWeatherData();
    if (weatherData) {
        await sendMessages(weatherData);
    }
}, {
    timezone: 'Asia/Shanghai'
});


// 代理的路由
app.get('/proxy', async (req, res) => {
    try {
        const locationToUse = req.query.myLocation || location; // 使用 myLocation 或 location
        console.log("locationToUse", locationToUse);

        const response = await axios.get(`https://api.caiyunapp.com/v2.6/${token}/${locationToUse}/hourly?hourlysteps=10`);
        
        // 仅发送一次响应
        res.json(response.data);
        console.log("Response data:", response.data); // 在此处打印响应数据，而不是再调用 res.json()
    } catch (error) {
        console.error("Error fetching data:", error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).send(error.message);
    }
});

// 位置查询的路由
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
    console.log(`http://localhost:${PORT}/proxy`);
});
