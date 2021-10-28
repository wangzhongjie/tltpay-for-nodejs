// default config
module.exports = {
    workers: 1,
    //替换成自己的商户号等参数
    tltPay: {
        ORGID: '',
        MCHNAME: '申请的正式商户名称',
        CUSID: '下发的正式商户号',
        APPID: '平台分配的APPID',
        APIVERSION: '11',
        MD5_APPKEY: 'xxxxxxxxxxxxx',
        APIURL: "生产环境api url", //生产环境
        SIGN_TYPE: 'MD5',
        RSACUSPRIKEY: 'xxxxxxxxxxxxx',
        RSAPUBKEY: 'xxxxxxxxxxxxx',
        SM2PPRIVATEKEY: 'xxxxxxxxxxxxx',
        SM2PUBKEY: 'xxxxxxxxxxxxx',

        WEIXINGONGZHENGHAOAPPID: 'xxxxxxxxxxxxx',
        XIAOCHENGXUAPPID: 'xxxxxxxxxxxxx',

        NOTIFYURL_TEST: 'xxxxxxxxxxxxx',
        NOTIFYURL_PRO: 'xxxxxxxxxxxxx',
    },
};