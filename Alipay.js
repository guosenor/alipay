var axios = require('axios').create();
var crypto = require('crypto');

class Alipay {

    constructor(config) {
        this.alipayConf = config;
    }

    /**
     * 订单支付
     * 
     * type type String  in ['app', 'page', 'wap']
     * 
     * url type Object
     * @key: return_url:   支付完成跳转地址
     * @key: notify_url:   支付完成 阿里服务器主动请求通知地址
     *
     * pay type Object
     * @key: out_trade_no	            String	是	64	 商户订单号，64个字符以内、可包含字母、数字、下划线；需保证在商户端不重复	20150320010101001
     * @key: product_code	            String	是	64	 销售产品码，与支付宝签约的产品码名称。 注：目前仅支持FAST_INSTANT_TRADE_PAY	FAST_INSTANT_TRADE_PAY
     * @key: total_amount	            Price	是	11	 订单总金额，单位为元，精确到小数点后两位，取值范围[0.01,100000000]	88.88
     * @key: subject	                String	是	256	 订单标题	Iphone6 16G
     * @key: body	                    String	否	128	 订单描述	Iphone6 16G
     * @key: goods_detail	            String	否	 	   订单包含的商品列表信息，Json格式，详见商品明细说明	{"show_url":"https://www.alipay.com"}
     * @key: passback_params	        String	否	512	 公用回传参数，如果请求时传递了该参数，则返回给商户时会回传该参数。支付宝只会在异步通知时将该参数原样返回。本参数必须进行UrlEncode之后才可以发送给支付宝	merchantBizType%3d3C%26merchantBizNo%3d2016010101111
     * @key: extend_params	          String	否	 	   业务扩展参数，详见业务扩展参数说明	{"sys_service_provider_id":"2088511833207846"}
     * @key: goods_type	              String	否	2	   商品主类型：0—虚拟类商品，1—实物类商品（默认）注：虚拟类商品不支持使用花呗渠道	0
     * @key: timeout_express	        String	否	6	   该笔订单允许的最晚付款时间，逾期将关闭交易。取值范围：1m～15d。m-分钟，h-小时，d-天，1c-当天（1c-当天的情况下，无论交易何时创建，都在0点关闭）。 该参数数值不接受小数点， 如 1.5h，可转换为 90m	90m
     * @key: enable_pay_channels	    String	否	128	 可用渠道，用户只能在指定渠道范围内支付当有多个渠道时用“,”分隔注：与disable_pay_channels互斥	pcredit,moneyFund,debitCardExpress
     * @key: disable_pay_channels	    String	否	128	 禁用渠道，用户不可用指定渠道支付当有多个渠道时用“,”分隔注：与enable_pay_channels互斥	pcredit,moneyFund,debitCardExpress
     * @key: auth_token	              String	否	40	 针对用户授权接口，获取用户相关数据时，用于标识用户授权关系	appopenBb64d181d0146481ab6a762c00714cC27
     * @key: qr_pay_mode	            String	否	2	   PC扫码支付的方式，支持前置模式和跳转模式。前置模式是将二维码前置到商户的订单确认页的模式。需要商户在自己的页面中以 iframe 方式请求支付宝页面。具体分为以下几种：0：订单码-简约前置模式，对应 iframe 宽度不能小于600px，高度不能小于300px；1：订单码-前置模式，对应iframe 宽度不能小于 300px，高度不能小于600px；3：订单码-迷你前置模式，对应 iframe 宽度不能小于 75px，高度不能小于75px；4：订单码-可定义宽度的嵌入式二维码，商户可根据需要设定二维码的大小。跳转模式下，用户的扫码界面是由支付宝生成的，不在商户的域名下。2：订单码-跳转模式	4
     * @key: qrcode_width	            String	否	4    商户自定义二维码宽度 注：qr_pay_mode=4时该参数生效
     * @key: sys_service_provider_id	String	否	64	 系统商编号，该参数作为系统商返佣数据提取的依据，请填写系统商签约协议的PID	2088511833207846商品明细说明
     * @key: show_url	                String	否	400	 商品的展示地址	http://www.alipay.com
     * **/
    pay(type, params, url) {
        let method = 'alipay.trade.page.pay';
        params.product_code = 'FAST_INSTANT_TRADE_PAY';

        if (type == 'wap') {
            method = 'alipay.trade.wap.pay';
            params.product_code = 'QUICK_WAP_WAY';
        }
        if (type == 'app') {
            method = 'alipay.trade.app.pay';
            params.product_code = 'QUICK_MSECURITY_PAY';
        }
        const options = {
            method: method,
            // return_url: url.return_url,
            biz_content: JSON.stringify(params)
        }
        if (url) {
            if (url.return_url) {
                options.return_url = url.return_url
            }
            if (url.notify_url != '') {
                options.notify_url = url.notify_url;
            }
        }
        return this.AlipaySubmitUrl(options);
    }

    /**
     * 已支付订单退款
     * trade type Object
     * key:out_trade_no    String	特殊可选	64	订单支付时传入的商户订单号,不能和 trade_no同时为空。
     * key:trade_no        String	特殊可选	64	支付宝交易号，和商户订单号不能同时为空
     * key:refund_amount   Price	必选	    9	需要退款的金额，该金额不能大于订单金额,单位为元，支持两位小数
     * key:refund_reason  	String	可选	    256	退款的原因说明	正常退款
     * key:out_request_no	String	可选	    64	标识一次退款请求，同一笔交易多次退款需要保证唯一，如需部分退款，则此参数必传。	HZ01RF001
     * key:operator_id	    String	可选	    30	商户的操作员编号	OP001
     * key:store_id	      String	可选	    32	商户的门店编号	NJ_S_001
     * key:terminal_id	    String	可选	    32	商户的终端编号	NJ_T_001
     * */
    refund(trade) {
        if (trade && trade.refund_amount && (trade.trade_no || trade.out_trade_no)) {
            var method = 'alipay.trade.refund';
            var options = {
                method: method,
                biz_content: JSON.stringify(trade)
            }
            return this.AlipaySubmit(options)
        } else {
            return Promise.reject({ message: 'trade.trade_no and trade.out_trade_no  is not found or refund_amount is not found' })
        }
    }

    /**
     * 转账到支付宝账户
     * transfer type Object
     * key: out_biz_no	     String	必选	64	商户转账唯一订单号。发起转账来源方定义的转账单据ID，用于将转账回执通知给来源方。不同来源方给出的ID可以重复，同一个来源方必须保证其ID的唯一性。只支持半角英文、数字，及“-”、“_”。	3142321423432
     * key: payee_type	     String	必选	20	收款方账户类型。可取值：1、ALIPAY_USERID：支付宝账号对应的支付宝唯一用户号。以2088开头的16位纯数字组成。2、ALIPAY_LOGONID：支付宝登录号，支持邮箱和手机号格式。	ALIPAY_LOGONID
     * key: payee_account	 String	必选	100	收款方账户。与payee_type配合使用。付款方和收款方不能是同一个账户。	abc@sina.com
     * key: amount	         String	必选	16	转账金额，单位：元。只支持2位小数，小数点前最大支持13位，金额必须大于等于0.1元。	12.23
     * key: payer_show_name  String	可选	100	付款方姓名（最长支持100个英文/50个汉字）。显示在收款方的账单详情页。如果该字段不传，则默认显示付款方的支付宝认证姓名或单位名称。	上海交通卡退款
     * key: payee_real_name  String	可选	100	收款方真实姓名（最长支持100个英文/50个汉字）。如果本参数不为空，则会校验该账户在支付宝登记的实名是否与收款方真实姓名一致。	张三
     * key: remark	         String	可选	200	转账备注（支持200个英文/100个汉字）。当付款方为企业账户，且转账金额达到（大于等于）50000元，remark不能为空。收款方可见，会展示在收款用户的收支详情中。	转账备注
     *
     * */
    fundToAccounTransfer(transfer) {
        if (transfer && transfer.out_biz_no && transfer.payee_type && transfer.payee_account && transfer.amount) {
            var method = 'alipay.fund.trans.toaccount.transfer'
            var options = {
                method: method,
                biz_content: JSON.stringify(transfer)
            }
            return this.AlipaySubmit(options)
        } else {
            return Promise.reject({ message: 'please make sure out_biz_no,payee_type,payee_account and amount is had' })
        }
    }

    AlipaySubmit(options) {
        /**
         * 添加通过参数
         * */
        options.app_id = this.alipayConf.APPID;
        options.charset = 'utf-8';
        options.version = '1.0',
            options.sign_type = "RSA2"
        options.timestamp = new Date().Format('yyyy-MM-dd hh:mm:ss')
        return axios.get(this.alipayConf.ALIGETWAY + '?' + this.getSecretSign(options))
    }



    AlipaySubmitUrl(options) {
        /**
         * 添加通过参数
         * */
        options.app_id = this.alipayConf.APPID;
        options.charset = 'utf-8';
        options.version = '1.0',
            options.sign_type = "RSA2"
        options.timestamp = new Date().Format('yyyy-MM-dd hh:mm:ss')
            //console.log(this.alipayConf.ALIGETWAY + '?' + getSecretSign(options))
        return Promise.resolve(this.alipayConf.ALIGETWAY + '?' + this.getSecretSign(options))
    }

    /**
     * 验签
     * **/
    veriySign(unSignStr, sign) {
        var verify = crypto.createVerify('RSA-SHA256'); //RSA-SHA1
        //var verify = crypto.createVerify('RSA-SHA1');//RSA-SHA256
        verify.update(unSignStr);
        return verify.verify(this.alipayConf.RSA2_ALIPAY_PUBLIC_KEY, sign, 'base64')
    }

    // 异步验证签名
    signVerified(params) {
        console.log(params)
        if (params && params.sign) {
            var sign = params.sign;
            delete params.sign;
            delete params.sign_type;
            var unSignStr = this.getParams(params);
            if (this.veriySign(unSignStr, sign)) {
                return Promise.resolve('success');
            } else {
                return Promise.reject('error');
            }
        } else {
            return Promise.reject('error');
        }
    }

    // 同步验证签名
    signVerifiedSync(reData, sign) {
        console.log(reData)
        console.log(sign)
        var unVerif = (JSON.stringify(reData).replaceAll('/', '\\/'));
        return this.veriySign(unVerif, sign)
    }



    AlipaySubmitParams(options) {
        /**
         * 添加通过参数
         * */
        options.app_id = this.alipayConf.APPID;
        options.charset = 'utf-8';
        options.version = '1.0',
            options.sign_type = "RSA2"
        options.timestamp = new Date().Format('yyyy-MM-dd hh:mm:ss');
        var str = this.getSecretSign(options);
        return Promise.resolve(str);
    }

    getParams(params) {
        var sPara = [];
        if (!params) return null
        for (var key in params) {
            sPara.push([key, params[key]]);
        }
        sPara = sPara.sort();
        //console.log(JSON.stringify(sPara))
        var str = '';
        for (var n = 0; n < sPara.length; n++) {
            var obj = sPara[n]
            if (n == sPara.length - 1) {
                str = str + obj[0] + '=' + obj[1]
            } else {
                str = str + obj[0] + '=' + obj[1] + '&'
            }
        }
        //console.log(str)
        return str;
    }

    getEncodeParams(params) {
        var sPara = [];
        if (!params) return null
        for (var key in params) {
            sPara.push([key, params[key]]);
        }
        sPara = sPara.sort();
        //console.log(JSON.stringify(sPara))
        var str = '';
        for (var n = 0; n < sPara.length; n++) {
            var obj = sPara[n]
            if (n == sPara.length - 1) {
                str = str + obj[0] + '=' + encodeURIComponent(obj[1])
            } else {
                str = str + obj[0] + '=' + encodeURIComponent(obj[1]) + '&'
            }
        }
        //console.log(str)
        return str;
    }

    /**
     *
     * */
    getSecretSign(params) {
        var mySign = this.getSign(params);
        var myParams = this.getEncodeParams(params);
        return myParams + '&sign=' + mySign
    }

    /**
     * 签名
     * **/
    getSign(params) {
        try {
            var str = this.getParams(params);
            var sign = crypto.createSign('RSA-SHA256');
            sign.update(str)
            sign = sign.sign(this.alipayConf.RSA2_MY_PRIVATE_KEY, 'base64')
            return encodeURIComponent(sign);
        } catch (err) {
            //console.log('getSign Error:',err)
            return null
        }
    }
}

String.prototype.replaceAll = function(s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
}

module.exports = Alipay;
