'use strict';

const crypto = require('hex_hmac_sha1');
/**  options 
        productKey
        deviceName
        deviceSecret
*/
exports.getAliyunIotMqttClient = function(opts) {

    //是否传入三元组
    if (!opts || !opts.productKey || !opts.deviceName || !opts.deviceSecret) {
        throw new Error('options need productKey,deviceName,deviceSecret');
    }

    if (opts.protocol === 'mqtts' && !opts.ca) {
        throw new Error('mqtts need ca ');
    }
    //是否传入区域
    if (!opts.host && !opts.regionId) {
        throw new Error('options need host or regionId (aliyun regionId)');
    }

    const deviceSecret = opts.deviceSecret;
    delete opts.deviceSecret;

    let secureMode = (opts.protocol === 'mqtts') ? 3 : 2;

    var options = {
        productKey: opts.productKey,
        deviceName: opts.deviceName,
        timestamp: Date.now(),
        clientId: Math.random().toString(36).substr(2)
    }
    let keys = Object.keys(options).sort();
    // 按字典序排序
    keys = keys.sort();
    const list = [];
    keys.map((key) => {
        list.push(`${key}${options[key]}`);
    });
    const contentStr = list.join('');
    //加密算法生成 password
    opts.password = crypto.hex_hmac_sha1(deviceSecret, contentStr);
    opts.clientId = `${options.clientId}|securemode=${secureMode},signmethod=hmacsha1,timestamp=${options.timestamp}|`;
    opts.username = `${options.deviceName}&${options.productKey}`;

    opts.port = opts.port || 1883;
    //生成域名
    opts.host = opts.host || `${opts.productKey}.iot-as-mqtt.${opts.regionId}.aliyuncs.com`;
    
    return (opts);
}
