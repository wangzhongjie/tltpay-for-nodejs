const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const axios = require('axios')


var sdpay = {
    /**
     * 从文件加载公钥和私钥
     * key实际上就是PEM编码的字符串
     * @param {string} file 文件路径
     * @return string
     */
    loadKey: function(file) {
        file = path.join(__dirname, file)
        return fs.readFileSync(file, 'utf8');
    },


    /**
     * 从远程加载公钥和私钥
     * @param {string} url 
     * @return string
     */
    loadKeyFromUrl: async function(url) {
        try {
            const res = await axios.get(url, { responseType: 'arraybuffer' })
            const data = res.data
            const plainText = Buffer.from(data, 'binary').toString()

            let priKey = plainText.split('-----BEGIN PRIVATE KEY-----')[1]
            priKey = '-----BEGIN PRIVATE KEY-----' + priKey

            return priKey
        } catch (e) {
            console.log('从远程加载公钥和私钥错误：' + e)
            throw new Error('从远程加载公钥和私钥错误：' + e)
        }

    },

    loadKeyTLT: async function(file) {
        try {
            file = path.join(__dirname, file)
            let plainText=fs.readFileSync(file, 'utf8');
            let priKey = plainText.split('-----BEGIN PRIVATE KEY-----')[1]
            priKey = '-----BEGIN PRIVATE KEY-----' + priKey

            return priKey
        } catch (e) {
            console.log('从远程加载公钥和私钥错误：' + e)
            throw new Error('从远程加载公钥和私钥错误：' + e)
        }

    },


    /**
     * 生成随机的AESKey
     * 8的倍数，默认16个128位
     * @param {number} size
     * @return string
     */
    aes_generate: function(size) {
        const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let arr = []
        for (let i = 0; i < size; i++) {
            arr.push(str[rnd(0, 61)])
        }
        return arr.join('')
    },

    /**
     * 公钥加密AESKey
     * @param {string} plainAESKey 明文aeskey
     * @param {string} pubKey 明文公钥
     * @return {string} base64密文aeskey
     */
    RSAEncryptByPub: function(plainAESKey, pubKey) {
        plainAESKey = Buffer.from(plainAESKey, 'utf8')
        pubKey = Buffer.from(pubKey, 'utf8')
        try {
            let encryptKey = crypto.publicEncrypt({ key: pubKey, padding: crypto.constants.RSA_PKCS1_PADDING }, plainAESKey);
            return encryptKey.toString('base64');
        } catch (e) {
            console.log('公钥加密AESKey错误：' + e)
            throw new Error('公钥加密AESKey错误：' + e)
        }
    },

    /**
     * 私钥解密AESKey
     * @param {string} cipherAESKey base64密文aeskey
     * @param {string} priKey 明文私钥
     * @return {string} 明文aeskey
     */
    RSADecryptByPri: function(cipherAESKey, priKey) {
        cipherAESKey = Buffer.from(cipherAESKey, 'base64')
        priKey = Buffer.from(priKey, 'utf8')

        try {
            let decryptAESKey = crypto.privateDecrypt({ key: priKey, padding: crypto.constants.RSA_PKCS1_PADDING }, cipherAESKey);
            return decryptAESKey
        } catch (e) {
            console.log('私钥解密AESKey错误：' + e)
            throw new Error('私钥解密AESKey错误：' + e)
        }
    },




    /**
     * AES加密
     * @param {string} data 明文报文
     * @param {string} AESkey 明文AESkey
     * @param {string} algorithm 算法
     * @param {null} iv 随机偏移量
     * @return {string} base64 加密报文
     */
    AESEncrypt: function(data, AESkey, algorithm, iv) {
        const cipherEncoding = 'base64';
        const clearEncoding = 'utf8';
        try {
            var cipher = crypto.createCipheriv(algorithm, AESkey, iv);
            return cipher.update(data, clearEncoding, cipherEncoding) + cipher.final(cipherEncoding);
        } catch (e) {
            console.log('aes加密错误：' + e)
            throw new Error('aes加密错误：' + e)
        }
    },

    /**
     * AES解密
     * @param {string} data base64 加密报文
     * @param {string} AESkey 明文AESkey
     * @param {string} algorithm 算法
     * @param {null} iv 随机偏移量
     * @returns {string}  明文报文
     */
    AESDecrypt: function(data, AESkey, algorithm, iv) {
        const cipherEncoding = 'base64';
        const clearEncoding = 'utf8';
        try {
            var cipher = crypto.createDecipheriv(algorithm, AESkey, iv);
            return cipher.update(data, cipherEncoding, clearEncoding) + cipher.final(clearEncoding);
        } catch (e) {
            console.log('aes解密错误：' + e)
            throw new Error('aes解密错误：' + e)
        }
    },

    /**
     * 私钥签名
     * @param {string} plainText 明文报文 
     * @param {string} priKey 私钥 
     * @param {string} signAlgorithm 签名算法 
     * @return {string} 已签名base64密文
     */
    sign: function(plainText, priKey, signAlgorithm) {
        priKey = Buffer.from(priKey, 'utf8')

        try {
            const sign = crypto.createSign(signAlgorithm);
            sign.write(plainText);
            sign.end();

            const sign_b64 = sign.sign(priKey, 'base64');
            return sign_b64
        } catch (e) {
            // console.log('私钥签名错误：' + e)
            throw new Error('私钥签名错误：' + e)
        }
    },

    /**
     * 公钥验签
     * @param {string} plainText  解密后的明文报文
     * @param {string} sign 签名 
     * @param {string} pubKey 公钥
     * @param {string} signAlgorithm 验签算法
     * @return {boolean} 
     */
    verify: function(plainText, sign, pubKey, signAlgorithm) {
        sign = Buffer.from(sign, 'base64')
        pubKey = Buffer.from(pubKey, 'utf8')

        try {
            const verify = crypto.createVerify(signAlgorithm);
            verify.write(plainText);
            verify.end();

            var isOk = verify.verify(pubKey, sign, 'base64');
            console.log(3334, isOk)
            if (!isOk) {
                return false
                // throw new Error('验签失败')
            }
            return true
        } catch (e) {
            console.log('公钥验签错误：' + e)
            throw new Error('公钥验签错误：' + e)
        }

    },

    /**
     * public method for url encoding
     * = php urlEncode
     */
    urlEncode: function(clearString) {
        var output = '';
        var x = 0;

        clearString = utf16to8(clearString.toString());
        var regex = /(^[a-zA-Z0-9-_.]*)/;

        while (x < clearString.length) {
            var match = regex.exec(clearString.substr(x));
            if (match != null && match.length > 1 && match[1] != '') {
                output += match[1];
                x += match[1].length;
            } else {
                if (clearString[x] == ' ')
                    output += '+';
                else {
                    var charCode = clearString.charCodeAt(x);
                    var hexVal = charCode.toString(16);
                    output += '%' + (hexVal.length < 2 ? '0' : '') + hexVal.toUpperCase();
                }
                x++;
            }
        }

        function utf16to8(str) {
            var out, i, len, c;

            out = "";
            len = str.length;
            for (i = 0; i < len; i++) {
                c = str.charCodeAt(i);
                if ((c >= 0x0001) && (c <= 0x007F)) {
                    out += str.charAt(i);
                } else if (c > 0x07FF) {
                    out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                    out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                    out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
                } else {
                    out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                    out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
                }
            }
            return out;
        }

        return output;
    },

    /** 
     * public method for url decoding
     * = php urlDecode
     */
    urlDecode: function(encodedString) {
        var output = encodedString;
        var binVal, thisString;
        var myregexp = /(%[^%]{2})/;

        function utf8to16(str) {
            var out, i, len, c;
            var char2, char3;

            out = "";
            len = str.length;
            i = 0;
            while (i < len) {
                c = str.charCodeAt(i++);
                switch (c >> 4) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        out += str.charAt(i - 1);
                        break;
                    case 12:
                    case 13:
                        char2 = str.charCodeAt(i++);
                        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                        break;
                    case 14:
                        char2 = str.charCodeAt(i++);
                        char3 = str.charCodeAt(i++);
                        out += String.fromCharCode(((c & 0x0F) << 12) |
                            ((char2 & 0x3F) << 6) |
                            ((char3 & 0x3F) << 0));
                        break;
                }
            }
            return out;
        }
        while ((match = myregexp.exec(output)) != null &&
            match.length > 1 &&
            match[1] != '') {
            binVal = parseInt(match[1].substr(1), 16);
            thisString = String.fromCharCode(binVal);
            output = output.replace(match[1], thisString);
        }

        //output = utf8to16(output);
        output = output.replace(/\\+/g, " ");
        output = utf8to16(output);
        return output;
    },


    // public method for url encoding
    urlEncode2: function(string) {
        return escape(this._utf8_encode(string));
    },

    // public method for url decoding
    urlDecode2: function(string) {
        return this._utf8_decode(unescape(string));
    },

    // private method for UTF-8 encoding
    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }
        return string;
    }




}

function rnd(m, n) {
    return parseInt(Math.random() * (m - n) + n)
}


module.exports = sdpay;