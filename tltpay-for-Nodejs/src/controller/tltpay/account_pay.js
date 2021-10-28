/**
 * Created by aurum on 2018/3/14.
 */
const xml = require('./XML');
const config = require('./config');
const _ = require('lodash');
const request = require('request');
const crypto = require('crypto');
const iconv = require('iconv-lite');
const signAlgorithm = 'RSA-SHA1';

class AccountPay {

    constructor(merchantId, privateCert, certPassphrase, username, password, options = {}) {
        if (!merchantId || !privateCert || !certPassphrase) {
            throw new Error(`必须设置商户ID、私钥证书、证书密码`);
        }
        if (!username || !password) {
            throw new Error(`用户名、密码不能为空`);
        }

        this.merchantId = merchantId;
        this.privateCert = privateCert;
        this.certPassphrase = certPassphrase;
        this.username = username;
        this.password = password;

        _.defaults(this, options);
        this.isTest = !!options.isTest;
    }

    /**
     * 单笔实时代付
     * @param {Object} info 请求文档中的INFO部分
     * @param {Object} trans 请求文档中的TRANS部分
     */
    async pay(info, trans) {
        const jsonBody = {
            AIPG: {
                INFO: {
                    TRX_CODE: '100014',
                    VERSION: '04',
                    DATA_TYPE: 2,
                    LEVEL: 0,
                    USER_NAME: this.username,
                    USER_PASS: this.password,
                },
                TRANS: {
                    MERCHANT_ID: this.merchantId,
                }
            }
        };
        _.defaults(jsonBody.AIPG.INFO, info);
        _.defaults(jsonBody.AIPG.TRANS, trans);

        // console.log('============================请求报文============================')
        // console.dir(jsonBody, {depth:null})

        const signedXmlBodyBuffer = await this.getSignedGBKBody(jsonBody);
        return await this._request(signedXmlBodyBuffer);
    }

    /**
     * 批量实时代付
     * @param {Object} info 请求文档中的INFO部分
     * @param {Object} body 请求文档中的BODY部分
     */
    async batchpay(info, body) {
        let jsonBody = {
            AIPG: {
                INFO: {
                    TRX_CODE: '100002',
                    VERSION: '04',
                    DATA_TYPE: 2,
                    LEVEL: 5,
                    USER_NAME: this.username,
                    USER_PASS: this.password,
                },
                BODY: {
                    TRANS_SUM: {
                        MERCHANT_ID: this.merchantId,
                    }
                }
            }
        };
        _.defaults(jsonBody.AIPG.INFO, info);
        _.defaults(jsonBody.AIPG.BODY.TRANS_SUM, body.TRANS_SUM);
        _.defaults(jsonBody.AIPG.BODY, body);

        // console.log('============================请求报文============================')
        // console.dir(jsonBody, {depth:null})

        const signedXmlBodyBuffer = await this.getSignedGBKBody(jsonBody);
        return await this._request(signedXmlBodyBuffer);
    }

    /**
     * 交易结果查询
     * @param {Object} info 
     * @param {Object} qtransreq 
     */
    async queryResult(info, qtransreq) {
        if (!qtransreq.QUERY_SN) {
            throw new Error('订单号不能为空');
        }

        const jsonBody = {
            AIPG: {
                INFO: {
                    TRX_CODE: '200004',
                    VERSION: '04',
                    DATA_TYPE: 2,
                    USER_NAME: this.username,
                    USER_PASS: this.password,
                },
                QTRANSREQ: {
                    MERCHANT_ID: this.merchantId,
                }
            }
        };
        _.defaults(jsonBody.AIPG.INFO, info);
        _.defaults(jsonBody.AIPG.QTRANSREQ, qtransreq);

        // console.log('============================请求报文============================')
        // console.dir(jsonBody, {depth:null})

        const signedXmlBodyBuffer = this.getSignedGBKBody(jsonBody);
        return await this._request(signedXmlBodyBuffer);
    }


    /**
     * 帐户信息查询
     * @param {Object} info 
     * @param {Object} acqueryreq 
     */
    async queryBalance(info, acqueryreq) {

        const jsonBody = {
            AIPG: {
                INFO: {
                    TRX_CODE: '300000',
                    VERSION: '04',
                    DATA_TYPE: 2,
                    LEVEL: 5,
                    USER_NAME: this.username,
                    USER_PASS: this.password,
                },
                ACQUERYREQ: {
                    // ACCTNO: '',
                    ACCTNO: this.merchantId + '000',
                }
            }
        };
        _.defaults(jsonBody.AIPG.INFO, info);
        _.defaults(jsonBody.AIPG.ACQUERYREQ, acqueryreq);

        // console.log('============================请求报文============================')
        // console.dir(jsonBody, {depth:null})

        const signedXmlBodyBuffer = this.getSignedGBKBody(jsonBody);
        return await this._request(signedXmlBodyBuffer);
    }


    /**
     * 历史余额查询
     * @param {Object} info 
     * @param {Object} ahqueryreq
     */
    async histroyBalance(info, ahqueryreq) {
        if (!ahqueryreq.STARTDAY && (!ahqueryreq.ENDDAY)) {
            throw new Error('开始日期和结束日期不能为空');
        }
        const jsonBody = {
            AIPG: {
                INFO: {
                    TRX_CODE: '300001',
                    VERSION: '04',
                    DATA_TYPE: 2,
                    LEVEL: 5,
                    USER_NAME: this.username,
                    USER_PASS: this.password,
                },
                AHQUERYREQ: {
                    ACCTNO: this.merchantId + '000'
                }
            }
        };
        _.defaults(jsonBody.AIPG.INFO, info);
        _.defaults(jsonBody.AIPG.AHQUERYREQ, ahqueryreq);

        // console.log('============================请求报文============================')
        // console.dir(jsonBody, {depth:null})

        const signedXmlBodyBuffer = this.getSignedGBKBody(jsonBody);
        return await this._request(signedXmlBodyBuffer);
    }


    /**
     * 账户提现
     * @param {Object} info 
     * @param {Object} cashreq
     */
    async tixianBalance(info, cashreq) {
        if (!cashreq.BANKACCT && (!cashreq.AMOUNT)) {
            throw new Error('要提现到账的目标帐户号和金额不能为空');
        }
        const jsonBody = {
            AIPG: {
                INFO: {
                    TRX_CODE: '300003',
                    VERSION: '04',
                    DATA_TYPE: 2,
                    LEVEL: 5,
                    USER_NAME: this.username,
                    USER_PASS: this.password,
                },
                CASHREQ: {
                    ACCTNO: this.merchantId + '000'
                }
            }
        };
        _.defaults(jsonBody.AIPG.INFO, info);
        _.defaults(jsonBody.AIPG.CASHREQ, cashreq);

        // console.log('============================请求报文============================')
        // console.dir(jsonBody, {depth:null})

        const signedXmlBodyBuffer = this.getSignedGBKBody(jsonBody);
        return await this._request(signedXmlBodyBuffer);
    }


    /**
     * 帐务查询
     * @param {Object} info 
     * @param {Object} etqueryreq
     */
    async zhangwuQuery(info, etqueryreq) {
        // if (!etqueryreq.PGTAG) {
        //     throw new Error('页标识不能为空');
        // }
        if (!etqueryreq.STARTDAY && (!etqueryreq.ENDDAY)) {
            throw new Error('开始日期和结束日期不能为空');
        }

        const jsonBody = {
            AIPG: {
                INFO: {
                    TRX_CODE: '300004',
                    VERSION: '04',
                    DATA_TYPE: 2,
                    LEVEL: 5,
                    USER_NAME: this.username,
                    USER_PASS: this.password,
                },
                ETQUERYREQ: {
                    ACCTNO: this.merchantId + '000'
                }
            }
        };
        _.defaults(jsonBody.AIPG.INFO, info);
        _.defaults(jsonBody.AIPG.ETQUERYREQ, etqueryreq);

        // console.log('============================请求报文============================')
        // console.dir(jsonBody, {depth:null})

        const signedXmlBodyBuffer = this.getSignedGBKBody(jsonBody);
        return await this._request(signedXmlBodyBuffer);
    }



    /**
     * 对账单申请
     * @param {Object} info 
     * @param {Object} qtransreq
     */
    async getClearFileContent(info, qtransreq) {
        if (!qtransreq.STATUS && !qtransreq.TYPE) {
            throw new Error('状态和查询类型不能为空');
        }
        if (!qtransreq.START_DAY && (!qtransreq.END_DAY)) {
            throw new Error('开始日期和结束日期不能为空');
        }

        const jsonBody = {
            AIPG: {
                INFO: {
                    TRX_CODE: '200002',
                    VERSION: '04',
                    DATA_TYPE: 2,
                    LEVEL: 5,
                    USER_NAME: this.username,
                    USER_PASS: this.password,
                },
                QTRANSREQ: {
                    MERCHANT_ID: this.merchantId,
                }
            }
        };
        _.defaults(jsonBody.AIPG.INFO, info);
        _.defaults(jsonBody.AIPG.QTRANSREQ, qtransreq);

        // console.log('============================请求报文============================')
        // console.dir(jsonBody, {depth:null})

        const signedXmlBodyBuffer = this.getSignedGBKBody(jsonBody);
        return await this._request(signedXmlBodyBuffer);
    }


    /**
     * 卡bin查询
     * @param {Object} info 
     * @param {Object} qcardbinreq
     */
    async getCardBIN(info, qcardbinreq) {
        if (!qcardbinreq.ACCTNO) {
            throw new Error('卡号不能为空');
        }

        const jsonBody = {
            AIPG: {
                INFO: {
                    TRX_CODE: '200007',
                    VERSION: '04',
                    DATA_TYPE: 2,
                    LEVEL: 5,
                    USER_NAME: this.username,
                    USER_PASS: this.password,
                },
                QCARDBINREQ: {}
            }
        };
        _.defaults(jsonBody.AIPG.INFO, info);
        _.defaults(jsonBody.AIPG.QCARDBINREQ, qcardbinreq);

        // console.log('============================请求报文============================')
        // console.dir(jsonBody, {depth:null})

        const signedXmlBodyBuffer = this.getSignedGBKBody(jsonBody);
        return await this._request(signedXmlBodyBuffer);
    }


    /**
     * 支付行号下载
     * @param {Object} info 
     * @param {Object} netbankreq
     */
    async getBranchNumberDown(info, netbankreq) {
        if (!netbankreq.BANKCODE) {
            throw new Error('行别代码不能为空');
        }

        const jsonBody = {
            AIPG: {
                INFO: {
                    TRX_CODE: '200006',
                    VERSION: '04',
                    DATA_TYPE: 2,
                    LEVEL: 5,
                    USER_NAME: this.username,
                    USER_PASS: this.password,
                },
                NETBANKREQ: {}
            }
        };
        _.defaults(jsonBody.AIPG.INFO, info);
        _.defaults(jsonBody.AIPG.NETBANKREQ, netbankreq);

        // console.log('============================请求报文============================')
        // console.dir(jsonBody, {depth:null})

        const signedXmlBodyBuffer = this.getSignedGBKBody(jsonBody);
        return await this._request(signedXmlBodyBuffer);
    }





    getSignedGBKBody(jsonBody) {
        jsonBody.AIPG.INFO.SIGNED_MSG = this.getSignature(jsonBody);
        let signedXml = xml.builder.buildObject(jsonBody);

        // console.log('============================请求报文xml============================')
        // console.dir(signedXml, { depth: null })
        return iconv.encode(signedXml, 'gbk');
    }

    getSignature(jsonBody) {
        const originStr = xml.builder.buildObject(jsonBody);
        const originStrBuffer = iconv.encode(originStr, 'gbk');

        // sign
        return crypto.createSign(signAlgorithm)
            .update(originStrBuffer)
            .sign({ key: this.privateCert, passphrase: this.certPassphrase }, 'hex');
    }

    async _request(body) {
        const resStr = await new Promise((resolve, reject) => {
            const resStream = request.post({
                uri: (this.isTest ? config.TEST_URL : config.PRODUCT_URL).accountPay,
                headers: {
                    'Content-Type': 'application/xml'
                },
                body,
                rejectUnauthorized: false
            });
            const decodeStream = iconv.decodeStream('gbk');
            resStream.pipe(decodeStream);

            let decodedStr = '';
            decodeStream.on('data', function(data) {
                decodedStr += data;
            });

            decodeStream.on('end', function() {
                resolve(decodedStr);
            });
        });
        // console.log('============================响应报文xml============================')
        // console.dir(resStr, { depth: null });
        const res = await xml.parser.parseStringAsync(resStr);
        return res;
    }
}

module.exports = AccountPay;