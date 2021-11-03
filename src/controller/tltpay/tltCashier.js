const Base = require('../base.js')
const moment = require('moment')
const axios = require('axios')
const qs = require('qs')
const querystring = require('querystring')
const utils = require('../sdUtils')
const hostname = require('os').hostname()
const crypto = require('crypto');
var Validator = require('jsonschema').Validator;


// 说明文档： https://aipboss.allinpay.com/know/devhelp/main.php?pid=15#mid=88
// 常量配置
let AppConfig = {
    APPID: 'xxxxxxxxxxxx',
    CUSID: 'xxxxxxxxxxxx',
    APIURL: "https://vsp.allinpay.com/apiweb/unitorder", //生产环境
    APIVERSION: '11',
    PRIKEY: 'xxxxxxxxxxxx',
    PUBKEY: 'xxxxxxxxxxxx',
}
// test
AppConfig = {
    APPID: 'xxxxxxxxxxxx',
    CUSID: 'xxxxxxxxxxxx',
    APIURL: "https://test.allinpaygd.com/apiweb/unitorder",
    APIVERSION: 'xxxxxxxxxxxx',
    PRIKEY: 'xxxxxxxxxxxx',
    PUBKEY: 'xxxxxxxxxxxx',
}


module.exports = class extends Base {
    constructor(ctx) {
        super(ctx)
    }

    randomString(e) {
        e = e || 32;
        var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
            a = t.length,
            n = "";
        for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
        return n
    }

    split(item, num) {
        if (item.length <= 0) {
            return item;
        }

        // let groupSize = Math.ceil(item.length / num);
        // console.log(123, groupSize)
        return this.chunk(item, num);
    }
    chunk(item, size) {
        if (item.length <= 0 || size <= 0) {
            return item;
        }

        let chunks = [];

        for (let i = 0; i < item.length; i = i + size) {
            chunks.push(item.slice(i, i + size));
        }

        return chunks
    }

    jsonSort(jsonObj) {
        let arr = [];
        for (var key in jsonObj) {
            arr.push(key)
        }
        arr.sort();
        let str = '';
        for (var i in arr) {
            str += arr[i] + "=" + jsonObj[arr[i]] + "&"
        }
        return str.substr(0, str.length - 1)
    }

    async doReceiptAction() {
        if (!this.isMethod('POST')) return this.fail('请用POST发送请求')
        // let params = this.post()
        // console.log('input', params)

        let order_create_time = moment().format('YYYYMMDDHHmmss')
        let orderId = order_create_time + this.rnd(10000, 99999)

        let data = {
            appid: AppConfig.APPID,
            cusid: AppConfig.CUSID,
            version: AppConfig.APIVERSION,
            trxamt: '10',
            reqsn: orderId,
            paytype: 'W01',
            randomstr: this.randomString(),
            signtype: 'RSA',
        }
        // data = {
        //     appid: AppConfig.APPID,
        //     cusid: AppConfig.CUSID,
        //     randomstr: '82712208',
        //     signtype: 'RSA',
        //     trxid: '112094120001088317',
        //     version: '11',
        // }
        // notify_url: this.config('tltPay').notifyUrl,

        let priKey = AppConfig.PRIKEY

        priKey = this.split(priKey, 64)
        priKey = priKey.join('\n')
        // priKey = "-----BEGIN RSA PRIVATE KEY-----\n" + priKey + "\n-----END RSA PRIVATE KEY-----";
        priKey = "-----BEGIN PRIVATE KEY-----\n" + priKey + "\n-----END PRIVATE KEY-----";
        // console.log(priKey)

        // step2: 私钥签名
        let _data = this.jsonSort(data)
        console.log('排序且键值格式的字符串', _data)
        let sign = utils.sign(_data, priKey, 'RSA-SHA1');
        sign = utils.urlEncode(sign)
        console.log('字符串签名后的', sign)


        // let pubKey = AppConfig.PUBKEY
        // pubKey = this.split(pubKey, 64)
        // pubKey = pubKey.join('\n')
        // pubKey = "-----BEGIN PUBLIC KEY-----\n" + pubKey + "\n-----END PUBLIC KEY-----";
        // console.log('公钥', pubKey)

        // const signRes = utils.verify(_data, sign, pubKey, 'RSA-SHA1')
        // console.log('签名验签结果', signRes)
        // return

        data = { ...data, sign }
        // console.log(333, data)

        data = qs.stringify(data)
        console.log(444, data)

        const url = AppConfig.APIURL + '/pay'

        const response = await axios({
            'url': url,
            'method': 'post',
            'headers': { 'Content-Type': 'application/x-www-form-urlencoded', 'charset': 'UTF-8' },
            'data': data
        })
        // console.log('back', response)
        const responseData = response.data
        console.log('back2', responseData)

        // let pubKey = AppConfig.PUBKEY
        // pubKey = this.split(pubKey, 64)
        // pubKey=pubKey.join('\n')
        // pubKey = "-----BEGIN PUBLIC KEY-----\n" + pubKey + "\n-----END PUBLIC KEY-----";

        // // step9: 使用公钥验签报文
        // const signRes = utils.verify(qs.stringify(responseData), responseData['sign'], pubKey, 'RSA-SHA1')
        // console.log('签名验签结果', signRes)

    }


    /**
     * 监听支付成功或失败的回调
     */
    async callbackAction() {
        const back = this.post()

        console.log('cb', back)
    }

}
