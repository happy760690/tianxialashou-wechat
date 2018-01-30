var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');

var signature = require('./signature');
var config = require('../config/config.json');
var request = require('request');

cache = require('memory-cache');

// middleware that is specific to this router
/*注意：如果把其放到最后一行的话。不会有任何输出*/
router.use(function timeLog(req, res, next) {
  console.log('Time-->>-->>:::::: ', Date.now());
  next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  console.dir("我是/中的req:");
  console.dir(req.weixin);
  console.log("---------------------------------------------------------------------------");
  const url = req.url.split('#')[0];
  signature.sign(url,function(signatureMap){
    //因为config接口需要appid,多加一个参数传入appid
    signatureMap.appId = config.wechat.appID;
    //发送给客户端
    // res.send(signatureMap);
    res.render('index', { title: '欢迎您的到来',weChatInfo:signatureMap});
  });
});

/*
* 此处公开，只为微信验证url用MP_verify_1AGqbDFtHZkDcVRO.txt
 */
router.get(/MP\_verify\_1AGqbDFtHZkDcVRO\.txt$/, function(req, res, next) {//读取某文件
  var options = {
    root: __dirname + '/../',
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };

  var fileName = './' + req.originalUrl.slice(1);
  res.sendFile(fileName, options, function (err) {/*以八位元流形式发送文件。*/
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });
});
/*微信底部菜单*/
router.get('/menubar',function(req,res,next){
  var menuBody = JSON.stringify({
    "button":[
      {
        "type":"click",
        "name":"我是歌曲",
        "key":"V1001_TODAY_MUSIC"
      },
      {
        "name":"菜单",
        "sub_button":[
          {
            "type":"view",
            "name":"搜索",
            "url":"http://www.soso.com/"
          },
          {
            "type":"view",
            "name":"视频",
            "url":"http://v.qq.com/"
          },
          {
            "type":"click",
            "name":"赞一下我们",
            "key":"V1001_GOOD"
          }]
      }]
  });
  if(cache.get('accessToken')){
    var accessToken = cache.get('accessToken');
    request({
      url: "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=" + accessToken,
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: menuBody,
    }, function(error, response, body) {
      console.dir(body);
      if (!error && response.statusCode == 200) {
        res.send('Got a ge5t request 哈哈哈');
      }
    });
    res.send('Got a ge5t request 嘿嘿');
  }else{
    request("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + config.wechat.appID + "&secret=" + config.wechat.appSecret ,function(error, response, body){
      var tokenMap = JSON.parse(body);
      cache.put('accessToken',tokenMap.access_token,config.wechat.cache_duration);
      request({
        url: "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=" + tokenMap.access_token,
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: menuBody,
      }, function(error, response, body) {
        console.dir(body);
        if (!error && response.statusCode == 200) {
          res.send('Got a ge5t request 哈哈哈');
        }
      });
    });
  }
});
/*router.get('/', function(req, res, next) {
  res.render('index', { title: 'a22222' });
});*/
router.get('/index', function(req, res, next) {
  res.render('index', { title: '欢迎来到马明娟简历' });
});
router.get('/assessmentreport',function(req,res,next){
  res.render('assessmentreport',{title:'评估报告'});
})
router.get('/assessmentquestion',function(req,res,next){
  res.render('assessmentquestion',{title:'评估测试'});
})
router.get('/user',function(req,res){
  res.send('Got a ge5t request 哈哈哈');
});
router.post('/abc',function(req,res){
  res.send('Got a POST request aaaaaaaa');
});
router.all('/secret', function (req, res, next) {
  console.log('Accessing the secret section ...');
  next(); // pass control to the next handler
});
router.get('/random.text', function (req, res) {
  res.send('random.text');
});

/*此路由路径将匹配 acd 和 abcd。？表示一个或者0个 */
/*router.get('/ab?cd', function(req, res) {
  res.send('ab?cd');
});*/
/*此路由路径将匹配 abcd、abbcd、abbbcd 等。+号表示一个或者多个 */
/*router.get('/ab+cd', function(req, res) {
  res.send('ab+cd');
});*/
/*此路由路径将匹配 abcd、abxcd、abRABDOMcd、ab123cd 等。 *表示0个或者多个任意字符*/
/*router.get('/ab*cd', function(req, res) {
  res.send('ab*cd');
});*/
/*此路由路径将匹配 /abe 和 /abcde。 ()?表示前方组合出现一次或者0次*/
/*router.get('/ab(cd)?e', function(req, res) {
  res.send('ab(cd)?e');
});*/
/*注意：
* 字符 ?、+、* 和 () 是其正则表达式同应项的子集。
* 基于字符串的路径按字面理解连字符 (-) 和点 (.)。
* */

/*此路由路径将匹配名称中具有“a”的所有路由。*/
/*router.get(/a/, function(req, res) {
  res.send('/a/');
});*/
/*此路由路径将匹配 butterfly 和 dragonfly，但是不匹配
 butterflyman、dragonfly man 等。
 . 除了换行符之外的任意字符,等价于[^\n]
 * 匹配前一项0次或多次.等价于{0,}
 $ 匹配一个输入或一行的结尾，/a$/匹配"An a"，而不匹配"an A"
 */
router.get(/.*fly$/, function(req, res) {
  res.send('/.*fly$/');
  // next(new Error('failed to load user'));
});
/*多个回调函数可以处理一个路由（确保您指定 next 对象）。例如：*/
router.get('/example/b', function (req, res, next) {
  console.log('the response will be sent by the next function ...');
  next();
}, function (req, res) {
  res.send('Hello from B!');
});

/*一组回调函数可以处理一个路由。例如：*/
var cb0 = function (req, res, next) {
  console.log('CB0');
  next();
}
var cb1 = function (req, res, next) {
  console.log('CB1');
  next();
}
var cb2 = function (req, res) {
  res.send('Hello from C!');
}
router.get('/example/c', [cb0, cb1, cb2]);

/*独立函数与一组函数的组合可以处理一个路由。例如：*/
var cb0 = function (req, res, next) {
  console.log('CB0');
  next();
}
var cb1 = function (req, res, next) {
  console.log('CB1');
  next();
}
router.get('/example/d', [cb0, cb1], function (req, res, next) {

 console.log('hengheng::-----------:',req.is('application/json'));
  console.log('the response will be sent by the next function ...');
  next();
}, function (req, res) {
  // res.send('Hello from D!');
/*  res.download('/statics/stylesheets/style.css', 'report.css', function(err){
    if (err) {
      // Handle error, but keep in mind the response may be partially-sent
      // so check res.headersSent
      console.log('err------------')
    } else {
      // decrement a download credit, etc.
      console.log('sss');
    }
  });*/
  // res.sendStatus(2000);
  res.redirect('/statics/stylesheets/style.css');
});

/*读取当前文件夹下的users.js*/
router.get('/file/:name', function (req, res, next) {

  var options = {
    root: __dirname + '/',
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };

  var fileName = req.params.name;
  res.sendFile(fileName, options, function (err) {/*以八位元流形式发送文件。*/
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });

});


/*您可以使用 app.route() 为路由路径创建可链接的路由处理程序。
因为在单一位置指定路径，所以可以减少冗余和输入错误*/
router.route('/book')
    .get(function(req, res) {
      res.send('Get a random book');
    })
    .post(function(req, res) {
      res.send('Add a book');
    })
    .put(function(req, res) {
      res.send('Update the book');
    });

/*//要装入中间件函数，请调用 app.use() 并指定中间件函数。 例如，以下代码在根路径 (/) 的路由之前装入 myLogger 中间件函数。[因为有next所以会继续执行下方代码]
var myLogger = function (req, res, next) {
  console.log('LOGGEDaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  next();
};
router.use(myLogger);
router.get('/', function (req, res) {
  res.send('Hello World!');
});*/


/*该应用程序使用 requestTime 中间件函数。此外，
根路径路由的回调函数使用由中间件函数添加到 req（请求对象）的属性。
* */
/*var requestTime = function (req, res, next) {
  req.requestTime = Date.now();
  next();
};
router.use(requestTime);
router.get('/', function (req, res) {
  var responseText = 'Hello World!';
  responseText += 'Requested at: ' + req.requestTime + '';
  res.send(responseText);
});*/

//-----------------------------------使用中间件-----------------------------
/*
 中间件函数能够访问请求对象 (req)、响应对象 (res) 以及应用程序的请求/响应循环中的下一个中间件函数。
 下一个中间件函数通常由名为 next 的变量来表示。

 中间件函数可以执行以下任务：
 1.执行任何代码。
 2.对请求和响应对象进行更改。
 3.结束请求/响应循环。
 4.调用堆栈中的下一个中间件函数。

 如果当前中间件函数没有结束请求/响应循环，那么它必须调用 next()，以将控制权传递给下一个中间件函数。
 否则，请求将保持挂起状态。
* */

/*
注意：next是当前路由其它部分 next('route')是跳过当前路由去下一个路由
要跳过路由器中间件堆栈中剩余的中间件函数，请调用 next('route') 将控制权传递给下一个路由。
 注：next('route') 仅在使用 app.METHOD() 或 router.METHOD() 函数装入的中间件函数中有效。
 此示例显示一个中间件子堆栈，用于处理针对 /user/:id 路径的 GET 请求。*/
/*router.get('/user/:id', function (req, res, next) {
  // if the user ID is 0, skip to the next route
  if (req.params.id == 0) next('route');
  // otherwise pass the control to the next middleware function in this stack
  else next(); //
}, function (req, res, next) {
  // render a regular page
  res.render('regular');
});
// handler for the /user/:id path, which renders a special page
router.get('/user/:id', function (req, res, next) {
  res.render('special');
});*/

/*
* 使用第三方中间件向 Express 应用程序添加功能。
 安装具有所需功能的 Node.js 模块，然后在应用层或路由器层的应用程序中将其加装入。
 以下示例演示如何安装和装入 cookie 解析中间件函数 cookie-parser。
* */
/*router.get('/', function (req, res) {
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies);

  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies);
  res.send('Got a adsfasdfasfasdf request 哈哈哈');
})*/



module.exports = router;
