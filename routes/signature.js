/**
 * Created by mamingjuan on 2017/3/4.
 * 生成signature
 */
var request = require('request'),
    sha1 = require('sha1'),
    config = require('../config/config.json');
    cache = require('memory-cache');

exports.sign = function (url,callback) {
    var noncestr = Math.random().toString(36).substr(2, 15),
        timestamp = Math.floor(Date.now()/1000), //精确到秒
        jsapi_ticket;
    if(cache.get('ticket')){
        jsapi_ticket = cache.get('ticket');
        console.log('1--》》--：：' + 'jsapi_ticket=' + jsapi_ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url='+ config.wechat.baseUrl + url + ":::end结束");
        callback({
            noncestr:noncestr,
            timestamp:timestamp,
            url:config.wechat.baseUrl + url,
            jsapi_ticket:jsapi_ticket,
            signature:sha1('jsapi_ticket=' + jsapi_ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url='+config.wechat.baseUrl + url)
        });
    }else{
        request(config.wechat.accessTokenUrl + '?grant_type=' + config.wechat.grant_type + '&appid=' + config.wechat.appID + '&secret=' + config.wechat.appSecret ,function(error, response, body){
            if (!error && response.statusCode == 200) {
                var tokenMap = JSON.parse(body);
                request(config.wechat.ticketUrl + '?access_token=' + tokenMap.access_token + '&type=jsapi', function(error, resp, json){
                    if (!error && response.statusCode == 200) {
                        var ticketMap = JSON.parse(json);
                        cache.put('ticket',ticketMap.ticket,config.wechat.cache_duration);  //加入缓存
                        console.log('jsapi_ticket=' + ticketMap.ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url='+config.wechat.baseUrl + url + ":::::结束");
                        callback({
                            noncestr:noncestr,
                            timestamp:timestamp,
                            url:config.wechat.baseUrl + url,
                            jsapi_ticket:ticketMap.ticket,
                            signature:sha1('jsapi_ticket=' + ticketMap.ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url)
                        });
                    }
                })
            }
        })
    }
}