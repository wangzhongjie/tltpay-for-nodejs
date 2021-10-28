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
    APPID: '00214926',
    CUSID: '56158804816MGLB',
    APIURL: "https://vsp.allinpay.com/apiweb/unitorder", //生产环境
    APIVERSION: '11',
    PRIKEY: 'MIIEowIBAAKCAQEA4AE8fSHV+3crTqx3ihrLuKeoHsiQT2/ZC97b2CXELi/c8JlPUNVa+19CC0zh7wT9Sg6/CT/P7RtTO0KImnOpPHQKFvEIAWdKXbTcF/InA82RiivBCMdr2qL5/McIo0tIW9oM2hVfNTq3fDwdvWn5zb/f8ExwyLvuanK5Ki1bVlg6CwDQp76dhBOag3uxpgh599Ysc2uBJi/rnWX25SlG/U3G9qUK0DjFWlfP8vFKmdGuFUVx13DXLv07krBM/RH2DpbKOTW/p46US/5alwlJLcCt735pTdW72EwJBTAqOLNc/HcBh/oUTy0hxENsaJTlem3ilLkOYNP8/SHiy55xYwIDAQABAoIBAADvUGLPTNbPUQFzi84qPXZoULXMLXn/Y/7+L5mv0qlErt3cLe4O7eHFrH9ik0DNmwb/l8GAoCwDpK3HIc3PNMIZU99zow5qcW+BrTd2Xb5Q0c4rT5NrTaJscrGg3QLdchBcERip5StSMujUUWV0d0PqDJOypffYfO65ytcHuG1cT+WlXodbNHe61C16lTY+NDMrGC0nFChxHfiQ2n1dZUMAMPNC7BHYg2u5/Eebsk8v4Rj1lDmwLMi9NSSp8Lx7SdpHeui0l4cf4yLNYrcC2Mg8uClUOAcn8a8uDBqTggZb6fLdRkPH6SdjyOT/ygbosgfn20cPJKIKJimb1SpnL6UCgYEA+NIYbgxTUV70cx8s5iOkfaw4i+Z0RKuUgULhV2sNJCv2kIqJJNlhZ/7EOF6XvANVDTp2gzAL/YwkVxPaj/l8GpRXOPT9ST0yRitzH0lorx4lMJ2kIe/yRMETXNPDDQqDZQaDIm1hsMf3OquDyjUyE8jMVAFc9F56YXdBBC8rR4UCgYEA5nfW58cxbecRM0WkutL3dhjLoyCeBiu5cxMTx/1CZOdhjfvoG4jII5F8L5gdurCEyUEjADAlOiBH66LLEVQPOfOeZZFw34O2YwKSPFX+ZZDGpB574A3irbtGcoM5EhKh39T7tO5wM4KWg50Fz2l3d73nliSEK59WJGhl/q7XRccCgYAPmLvHSiZ+10DjZnTeCCXrarwwqMVo+IhageK2JBOyzL6r2MM3+BhO+H08O1Gvi1XteliraHuX7QzqGGh+1didoebFvzWRPbDFDTwuHd/d+jnCjl8XcX7yKFgaXXvAeYQ69OmLYufYuPAaUV31ctgsvU1xhpRZDQMG0P7WUE6aMQKBgEJI211kM/o5CABoGl3FSXkE3qS3P9vkfXz0Uq8lTxA4YB13AyXQLEfWkxIZPQuxsy8y9b8bGcni+OxzsNX2CD8Rq0/pCb6vYiiN18NUtEs/3XHcdqJVPAndoABVb3ecNkRrPE2oekrGV0XZRo+F9N9SliXfsMffFuZ3xEYAwVeHAoGBAKusp+W4k+SG9Rr1lfTSSqPF8Cxd62/NG+Jeq2cXfKwQyjLkvDB6GG6m0ebct0c/AznBARAcr1Zy7niImT0t9CORNZZl9oz6pMfVnHBC9v5gnVJ41zRPyD0eME1WXk0ii/LX7cy5thfhinPKNgeEyc3CAB5tIeTuEBFS/TAox/kU',
    PUBKEY: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4AE8fSHV+3crTqx3ihrLuKeoHsiQT2/ZC97b2CXELi/c8JlPUNVa+19CC0zh7wT9Sg6/CT/P7RtTO0KImnOpPHQKFvEIAWdKXbTcF/InA82RiivBCMdr2qL5/McIo0tIW9oM2hVfNTq3fDwdvWn5zb/f8ExwyLvuanK5Ki1bVlg6CwDQp76dhBOag3uxpgh599Ysc2uBJi/rnWX25SlG/U3G9qUK0DjFWlfP8vFKmdGuFUVx13DXLv07krBM/RH2DpbKOTW/p46US/5alwlJLcCt735pTdW72EwJBTAqOLNc/HcBh/oUTy0hxENsaJTlem3ilLkOYNP8/SHiy55xYwIDAQAB',
}
// test
AppConfig = {
    APPID: '00000051',
    CUSID: '990581007426001',
    APIURL: "https://test.allinpaygd.com/apiweb/unitorder",
    APIVERSION: '11',
    PRIKEY: 'MIICdQIBADANBgkqhkiG9w0BAQEFAASCAl8wggJbAgEAAoGBAJgHMGYsspghvP+yCbjLG43CkZuQ3YJyDcmEKxvmgblITfmiTPx2b9Y2iwDT9gnLGExTDm1BL2A8VzMobjaHfiCmTbDctu680MLmpDDkVXmJOqdlXh0tcLjhN4+iDA2KkRqiHxsDpiaKT6MMBuecXQbJtPlVc1XjVhoUlzUgPCrvAgMBAAECgYAV9saYTGbfsdLOF5kYo0dve1JxaO7dFMCcgkV+z2ujKtNmeHtU54DlhZXJiytQY5Dhc10cjb6xfFDrftuFcfKCaLiy6h5ETR8jyv5He6KH/+X6qkcGTkJBYG1XvyyFO3PxoszQAs0mrLCqq0UItlCDn0G72MR9/NuvdYabGHSzEQJBAMXB1/DUvBTHHH4LiKDiaREruBb3QtP72JQS1ATVXA2v6xJzGPMWMBGQDvRfPvuCPVmbHENX+lRxMLp39OvIn6kCQQDEzYpPcuHW/7h3TYHYc+T0O6z1VKQT2Mxv92Lj35g1XqV4Oi9xrTj2DtMeV1lMx6n/3icobkCQtuvTI+AcqfTXAkB6bCz9NwUUK8sUsJktV9xJN/JnrTxetOr3h8xfDaJGCuCQdFY+rj6lsLPBTnFUC+Vk4mQVwJIE0mmjFf22NWW5AkAmsVaRGkAmui41Xoq52MdZ8WWm8lY0BLrlBJlvveU6EPqtcZskWW9KiU2euIO5IcRdpvrB6zNMgHpLD9GfMRcPAkBUWOV/dH13v8V2Y/Fzuag/y5k3/oXi/WQnIxdYbltad2xjmofJ7DbB7MJqiZZD8jlr8PCZPwRNzc5ntDStc959',
    PUBKEY: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDYXfu4b7xgDSmEGQpQ8Sn3RzFgl5CE4gL4TbYrND4FtCYOrvbgLijkdFgIrVVWi2hUW4K0PwBsmlYhXcbR+JSmqv9zviVXZiym0lK3glJGVCN86r9EPvNTusZZPm40TOEKMVENSYaUjCxZ7JzeZDfQ4WCeQQr2xirqn6LdJjpZ5wIDAQAB'
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