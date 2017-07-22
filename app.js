var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var index = require('./routes/index');
var usersApi = require('./routes/api/users');
var campaign = require('./routes/api/campaign');
var appsApi = require('./routes/api/apps');
var locationsApi = require('./routes/api/locations');
var devicesApi = require('./routes/api/devices');
var errorUtils = require('./error');

// test js
var errorTest = require('./routes/api/errortest');
var app = express();
// view test
var viewTest = require('./routes/viewtest');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

app.use('/', index);
app.use('/api/users', usersApi);
app.use('/api/campaigns', campaign);
app.use('/api/apps', appsApi);
app.use('/api/apps', locationsApi);
app.use('/api/apps', devicesApi);
app.use('/error/test', errorTest);
app.use('/view/test', viewTest);

// error -this must be the last position in file
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(new Error('NotFound'));
});
app.use(errorUtils.logErrors);
app.use(errorUtils.errorHandler);
// basic error handler
/*
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
*/

fs.mkdir("upload_images",function(e){
    if(!e || (e && e.code === 'EEXIST')){
        //do something with contents
    } else {
        //debug
        console.log(e);
    }
});

module.exports = app;
