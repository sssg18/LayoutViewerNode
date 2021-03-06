var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var winston = require('winston');
var expressWinston = require('express-winston');

var routes = require('./routes/index');
var api = require('./routes/api');
var cngClient = require('./lib/cngClient');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(expressWinston.logger({
    transports: [
        new winston.transports.File({
            json: true,
            colorize: true,
            filename: path.join(__dirname,'/logs/app.log')
        })
    ],
    exitOnError: false
}));

app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true,
            filename:path.join(__dirname, '/logs/err.log')
        })
    ],exitOnError: false
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(multer(
    {
        dest: './public/uploads/',
        rename: function (fieldname, filename) {
           return fieldname.replace('/ /g', ""); //CNG complains for space in source name.
        }
    }
))
;
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/api', api);
//exposing all the image uploads to redraw layouts using deviceId_channelId.ext as name.
app.use('/images', express.static(__dirname + '/public/uploads'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

cngClient.client.connect();

module.exports = app;
