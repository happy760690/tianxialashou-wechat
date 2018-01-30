/**
 * Created by mamingjuan on 2017/3/4.
 * 配置微信链接的。主要是服务器token
 */
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();
var config = require('../config/config.json');

var xml2js = require('xml2js');

/* GET users listing. */
router.get('/', function(req, res, next) {
    config = config || {};
    var q = req.query;
    var token = config.wechat.token;
    var signature = q.signature; //微信加密签名
    var nonce = q.nonce; //随机数
    var timestamp = q.timestamp; //时间戳
    var echostr = q.echostr; //随机字符串
    /*
     1）将token、timestamp、nonce三个参数进行字典序排序
     2）将三个参数字符串拼接成一个字符串进行sha1加密
     3）开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
     */
    var str = [token, timestamp, nonce].sort().join('');
    var sha = sha1(str);
    if (req.method == 'GET') {

        if (sha == signature) {
            res.send(echostr+'')
        }else{
            res.send('err');
        }
    }
    else if(req.method == 'POST'){
        if (sha != signature) {
            return;
        }
        next();
    }
});


router.post('/', function(req, res, next) {
    var data='';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
        data += chunk;
    });

    var infoData = "";
    req.on('end', function() {
        req.body = data;
        var parser = new xml2js.Parser();
        parser.parseString(data, function (err, result) {
            infoData = result.xml;
            console.dir(infoData)
        });
        var strSend = "<xml>\
            <ToUserName><![CDATA[" + infoData.FromUserName[0]  + "]]></ToUserName>\
            <FromUserName><![CDATA[" + infoData.ToUserName[0] +"]]></FromUserName>\
            <CreateTime>" + Math.floor(Date.now()/1000) + "</CreateTime>\
            <MsgType><![CDATA[text]]></MsgType>\
            <Content><![CDATA[对不起，我是真是不认识你！！！]]></Content>\
            </xml>";
        console.log('strSend:::',strSend)
        res.send(strSend);
    });
});

module.exports = router;