var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var utils = require('./routes/utils');//用于微信认证

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
// app.use(bodyParser.json()); //默认 Content-Type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/statics',express.static(path.join(__dirname, 'public')));/*http://localhost:3008/statics/stylesheets/style.css*/
/*向 express.static 函数提供的路径相对于您在其中启动 node 进程的目录。
如果从另一个目录运行 Express 应用程序，那么对于提供资源的目录使用绝对路径会更安全：(上面可以把/statics 去掉也是对的。)*/

app.use('/', index);
app.use('/users', users);
app.use('/wechat',utils);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

