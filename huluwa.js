/**
 葫芦娃预约 v1.06

 cron: 30 8 * * *
 const $ = new Env("葫芦娃预约");

 自行抓包把token(一般在请求头里)填到变量中, 多账号用换行隔开（可自定义）

 环境变量 XLTH_COOKIE 新联惠购
 环境变量 GLYP_COOKIE 贵旅优品
 环境变量 KGLG_COOKIE 空港乐购
 环境变量 HLQG_COOKIE 航旅黔购
 环境变量 ZHCS_COOKIE 遵行出山
 环境变量 GYQP_COOKIE 贵盐黔品
 环境变量 LLSC_COOKIE 乐旅商城
 环境变量 YLQX_COOKIE 驿路黔寻
 */

const SPLIT = ";"; // 分割符（可自定义）

require('dotenv').config();  // 添加环境变量

const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');

const XLTH_APPID = 'wxded2e7e6d60ac09d'; // 新联惠购
const GLYP_APPID = 'wx61549642d715f361'; // 贵旅优品
const KGLG_APPID = 'wx613ba8ea6a002aa8'; // 空港乐购
const HLQG_APPID = 'wx936aa5357931e226'; // 航旅黔购
const ZHCS_APPID = 'wx624149b74233c99a'; // 遵航出山
const GYQP_APPID = 'wx5508e31ffe9366b8'; // 贵盐黔品
const LLSC_APPID = 'wx821fb4d8604ed4d6'; // 乐旅商城
const YLQX_APPID = 'wxee0ce83ab4b26f9c'; // 驿路黔寻

const PUSHDEER_KEY = process.env.PUSHDEER_KEY; // PUSHDEER_KEY
const PUSHDEER_URL = process.env.PUSHDEER_URL; // PUSHDEER_URL

const HOST = 'https://gw.huiqunchina.com';
const AK = '00670fb03584fbf44dd6b136e534f495';
const SK = '0d65f24dbe2bc1ede3c3ceeb96ef71bb';

let sendMessage = [];

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// 发送消息
function pushDeerNotify(text, desp) {

    const url = PUSHDEER_URL || `https://api2.pushdeer.com/message/push`;
    const method = 'post';
    const data = {
        pushkey: PUSHDEER_KEY,
        text: text,
        desp: desp,
        type: 'markdown'
    };
    const headers = {
          'Content-Type': 'application/x-www-form-urlencoded',
        };

    axios(url, {method: method, data: data, headers: headers})
        .then(res => {
            if (res.status != '200') {
                console.log(`PushDeer发送通知消息异常\n${JSON.stringify(data)}`);
            } else {
                console.log('PushDeer发送通知消息成功������\n');
            }
        })
        .catch(err => {
            console.log('发送通知调用API失败！！\n');
            console.log(err);
        });
}

// 计算签名算法
function calculateDigest(body, sk) {
    const hmac = crypto.createHmac('sha256', sk);
    hmac.update(body);
    const signature = hmac.digest('base64');
    return signature;
}

// 计算签名算法
function calculateSignature(method, url, ak, sk, date) {
    const strToSign = `${method.toUpperCase()}\n${url}\n\n${ak}\n${date}\n`;
    const hmac = crypto.createHmac('sha256', sk);
    hmac.update(strToSign);
    const signature = hmac.digest('base64');
    return signature;
}

// 构建请求头
function buildHeader(method, url, body) {
    const date = moment().utc().format('ddd, DD MMM YYYY HH:mm:ss [GMT]');
    const signature = calculateSignature(method, url, AK, SK, date);
    const digest = calculateDigest(body, SK);
    const headers = {
        'Content-Type': 'application/json',
        'X-HMAC-SIGNATURE': signature,
        'X-HMAC-ACCESS-KEY': AK,
        'X-HMAC-ALGORITHM': 'hmac-sha256',
        'X-HMAC-DIGEST': digest,
        'X-HMAC-Date': date,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF XWEB/6945'
    };
    return headers;
}

// 获取用户信息
async function getUserInfo(appId, token) {
    const url = '/front-manager/api/customer/queryById/token';
    const method = 'post';
    const data = {appId};
    const headers = buildHeader(method, url, JSON.stringify(data));
    headers['X-access-token'] = token;

    let resData;
    await axios(HOST + url, {method: method, data: data, headers: headers})
        .then(res => {
            resData = res.data;
        })
        .catch(err => {
            resData = err.response.data;
        });
    return resData;
}

// 获取活动信息
async function getChannelActivity(id, token) {
    const url = '/front-manager/api/customer/promotion/channelActivity';
    const method = 'post';
    const data = {id};
    const headers = buildHeader(method, url, JSON.stringify(data));
    headers['X-access-token'] = token;

    let resData;
    await axios(HOST + url, {method: method, data: data, headers: headers})
        .then(res => {
            resData = res.data;
        })
        .catch(err => {
            resData = err.response.data;
        });
    return resData;
}

// 获取通道
async function getChannelInfoId(appId) {
    const url = '/front-manager/api/get/getChannelInfoId';
    const method = 'post';
    const data = {appId};
    const headers = buildHeader(method, url, JSON.stringify(data));
    headers['X-access-token'] = token;

    let resData;
    await axios(HOST + url, {method: method, data: data, headers: headers})
        .then(res => {
            resData = res.data;
        })
        .catch(err => {
            resData = err.response.data;
        });
    return resData;
}

async function appoint(activityId, channelId, token) {
    const url = '/front-manager/api/customer/promotion/appoint';
    const method = 'post';
    const data = {activityId, channelId};
    const headers = buildHeader(method, url, JSON.stringify(data));
    headers['X-access-token'] = token;

    let resData;
    await axios(HOST + url, {method: method, data: data, headers: headers})
        .then(res => {
            resData = res.data;
        })
        .catch(err => {
            resData = err.response.data;
        });
    return resData;
}

async function checkCustomerInQianggou(activityId, channelId, token) {
    const url = '/front-manager/api/customer/promotion/checkCustomerInQianggou';
    const method = 'post';
    const data = {activityId, channelId};
    const headers = buildHeader(method, url, JSON.stringify(data));
    headers['X-access-token'] = token;

    let resData;
    await axios(HOST + url, {method: method, data: data, headers: headers})
        .then(res => {
            resData = res.data;
        })
        .catch(err => {
            resData = err.response.data;
        });
    return resData;
}

// 获取中奖记录
async function getWinningRecord(appId, token) {
    const url = '/front-manager/api/customer/promotion/queryLotteryRecord';
    const method = 'post';
    const data = {appId};
    const headers = buildHeader(method, url, JSON.stringify(data));
    headers['X-access-token'] = token;

    let resData;
    await axios(HOST + url, {method: method, data: data, headers: headers})
        .then(res => {
            resData = res.data;
        })
        .catch(err => {
            resData = err.response.data;
        });
    return resData;
}

async function autoSubmit(appId, token) {
    let channelId = '';
    let channelName = '';
    if (appId === XLTH_APPID) {
        channelId = '8';
        channelName = '新联惠购';
    }
    if (appId === GLYP_APPID) {
        channelId = '7';
        channelName = '贵旅优品';
    }
    if (appId === KGLG_APPID) {
        channelId = '2';
        channelName = '空港乐购';
    }
    if (appId === HLQG_APPID) {
        channelId = '6';
        channelName = '航旅黔购';
    }
    if (appId === ZHCS_APPID) {
        channelId = '5';
        channelName = '遵行出山';
    }
    if (appId === GYQP_APPID) {
        channelId = '3';
        channelName = '贵盐黔品';
    }
    if (appId === LLSC_APPID) {
        channelId = '1';
        channelName = '乐旅商城';
    }
    if (appId === YLQX_APPID) {
        channelId = '9';
        channelName = '驿路黔寻';
    }

    try {
        const res1 = await getUserInfo(appId, token);
        if (res1.code != '10000') {
            console.log(res1.message);
            sendMessage.push(res1.message);
            return;
        }
        const realName = res1.data.realName;
        const phone = res1.data.phone;
        console.log(`当前用户[${phone}]`);
        sendMessage.push(`当前用户: ${phone}`);

        const res2 = await getChannelActivity(channelId, token);
        if (res2.code != '10000') {
            console.log(res2.message);
            sendMessage.push(res2.message);
            return;
        }
        const activityId = res2.data.id;
        const activityName = res2.data.name;
        console.log(`活动名称[${activityName}]`);
        sendMessage.push(`活动名称: ${activityName}`);

        const res3 = await checkCustomerInQianggou(activityId, channelId, token);
        if (res3.code != '10000') {
            console.log(res3.message);
            sendMessage.push(res3.message);
            return;
        }
        const data = res3.data;

        let message = '用户已经预约成功';
        if (data == false) {
            const res4 = await appoint(activityId, channelId, token);
            this.sendMessage = res4.message;
        }
        console.log(`预约结果[${message}]`);
        sendMessage.push(`预约结果: ${message}`);
        
        // 中奖记录
        const res4 = await getWinningRecord(appId, token);
        if (res4.success) {
            const record = res4.data.list.length >= 0 ? res4.data.list : '未中奖';
            console.log('中奖记录: ' + record);
            sendMessage.push('中奖记录: ' + record);
        }
        
    } catch (err) {
        console.log(`运行异常[${err.message}]`);
        sendMessage.push(`运行异常[${err.message}]`);
    }
}

async function main() {
    const XLTH_COOKIE_ARR = process.env.XLTH_COOKIE; // 新联惠购
    const GLYP_COOKIE_ARR = process.env.GLYP_COOKIE; // 贵旅优品
    const KGLG_COOKIE_ARR = process.env.KGLG_COOKIE; // 空港乐购
    const HLQG_COOKIE_ARR = process.env.HLQG_COOKIE; // 航旅黔购
    const ZHCS_COOKIE_ARR = process.env.ZHCS_COOKIE; // 遵行出山
    const GYQP_COOKIE_ARR = process.env.GYQP_COOKIE; // 贵盐黔品
    const LLSC_COOKIE_ARR = process.env.LLSC_COOKIE; // 乐旅商城
    const YLQX_COOKIE_ARR = process.env.YLQX_COOKIE; // 驿路黔寻
    
    // 获取当前时间
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    if (XLTH_COOKIE_ARR) {
        console.log('新联惠购预约开始');
        sendMessage.push('新联惠购预约开始');
        for (let [index, item] of XLTH_COOKIE_ARR.split(SPLIT).entries()) {
            console.log(`----第${index + 1}个号----`);
            sendMessage.push(`----第${index + 1}个号----`);
            await autoSubmit(XLTH_APPID, item);
            await delay(1000);
        }
        console.log('新联惠购预约结束\n');
        sendMessage.push('新联惠购预约结束\n');
    }

    if (GLYP_COOKIE_ARR) {
        console.log('贵旅优品预约开始');
        sendMessage.push('贵旅优品预约开始');
        for (let [index, item] of GLYP_COOKIE_ARR.split(SPLIT).entries()) {
            console.log(`----第${index + 1}个号----`);
            sendMessage.push(`----第${index + 1}个号----`);
            await autoSubmit(GLYP_APPID, item);
            await delay(1000);
        }
        console.log('贵旅优品预约结束\n');
        sendMessage.push('贵旅优品预约结束\n');
    }

    if (KGLG_COOKIE_ARR) {
        console.log('空港乐购预约开始');
        sendMessage.push('空港乐购预约开始');
        for (let [index, item] of KGLG_COOKIE_ARR.split(SPLIT).entries()) {
            console.log(`----第${index + 1}个号----`);
            sendMessage.push(`----第${index + 1}个号----`);
            await autoSubmit(KGLG_APPID, item);
            await delay(1000);
        }
        console.log('空港乐购预约结束\n');
        sendMessage.push('空港乐购预约结束\n');
    }

    if (HLQG_COOKIE_ARR) {
        console.log('航旅黔购预约开始');
        sendMessage.push('航旅黔购预约开始');
        for (let [index, item] of HLQG_COOKIE_ARR.split(SPLIT).entries()) {
            console.log(`----第${index + 1}个号----`);
            sendMessage.push(`----第${index + 1}个号----`);
            await autoSubmit(HLQG_APPID, item);
            await delay(1000);
        }
        console.log('航旅黔购预约结束\n');
        sendMessage.push('航旅黔购预约结束\n');
    }

    if (ZHCS_COOKIE_ARR) {
        console.log('遵行出山预约开始');
        sendMessage.push('遵行出山预约开始');
        for (let [index, item] of ZHCS_COOKIE_ARR.split(SPLIT).entries()) {
            console.log(`----第${index + 1}个号----`);
            sendMessage.push(`----第${index + 1}个号----`);
            await autoSubmit(ZHCS_APPID, item);
            await delay(1000);
        }
        console.log('遵行出山预约结束\n');
        sendMessage.push('遵行出山预约结束\n');
    }

    if (GYQP_COOKIE_ARR) {
        console.log('贵盐黔品预约开始');
        sendMessage.push('贵盐黔品预约开始');
        for (let [index, item] of GYQP_COOKIE_ARR.split(SPLIT).entries()) {
            console.log(`----第${index + 1}个号----`);
            sendMessage.push(`----第${index + 1}个号----`);
            await autoSubmit(GYQP_APPID, item);
            await delay(1000);
        }
        console.log('贵盐黔品预约结束\n');
        sendMessage.push('贵盐黔品预约结束\n');
    }

    if (LLSC_COOKIE_ARR) {
        console.log('乐旅商城预约开始');
        sendMessage.push('乐旅商城预约开始');
        for (let [index, item] of LLSC_COOKIE_ARR.split(SPLIT).entries()) {
            console.log(`----第${index + 1}个号----`);
            sendMessage.push(`----第${index + 1}个号----`);
            await autoSubmit(LLSC_APPID, item);
            await delay(1000);
        }
        console.log('乐旅商城预约结束\n');
        sendMessage.push('乐旅商城预约结束\n');
    }

    if (YLQX_COOKIE_ARR) {
        console.log('驿路黔寻预约开始');
        sendMessage.push('驿路黔寻预约开始');
        for (let [index, item] of YLQX_COOKIE_ARR.split(SPLIT).entries()) {
            console.log(`----第${index + 1}个号----`);
            sendMessage.push(`----第${index + 1}个号----`);
            await autoSubmit(YLQX_APPID, item);
            await delay(1000);
        }
        console.log('驿路黔寻预约结束\n');
        sendMessage.push('驿路黔寻预约结束\n');

    }
    
    console.log('当前时间: ' + currentTime)

    await pushDeerNotify(`葫芦娃预约`, sendMessage.join('\n'));
}

main();
