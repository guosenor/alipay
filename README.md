# alipay

    const alipay = new Alipay({
       ALIGETWAY: "https://openapi.alipaydev.com/gateway.do",
       APPID: '***********',
       UID: '************',
       RSA2_ALIPAY_PUBLIC_KEY: '-----BEGIN PUBLIC KEY-----\n*******\n-----END PUBLIC KEY-----',
       RSA2_MY_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\n*******\n-----END PRIVATE KEY-----',
       SIGN_TYPE: "RSA2",
       ASE: "********=="
     });

    alipay.pay(
        'page', // page 网页支付   wap H5 页面支付  app app支付
        {
            subject: 'xxxxxx', //  标题
            total_amount: 1, // 金额 单位 元
            out_trade_no: '2019062699999900000' // 商户唯一订单号
        }, {
            notify_url: 'http://xxx.com/api/pay/success', // 支付完成 Alipay服务器通知地址
            return_url: 'httP://xxx.com/incex.html' // 支付完成前端跳转地址
        })
    .then((url) => {
        res.redirect(url);
    })
    .catch((err) => {

    });
