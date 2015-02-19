//server.js

// set up ======================================================================
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var mongoose = require('mongoose');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var configDB = require('./config/database.js');
var configServer = require('./config/server.js');

// view ========================================================================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// DB Connection ===============================================================
mongoose.connect(configDB.url); //connect to database

mongoose.connection.on('error', console.error.bind(console, ' DB connection error:'));
mongoose.connection.once('open', function callback () {
    console.log("Connect DB");
});

// configuration ===============================================================
app.use(logger('dev')); //Log every request to the console
app.use(cookieParser()); //Read Cookies
app.use(bodyParser.json()); //get information from html forms
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));


// routes ======================================================================
require('./app/routes.js')(app);

// websocket ======================================================================
require('./app/websocket')(io);

// launch ======================================================================
app.listen(configServer.port);
console.log('The magic happens on port ' + configServer.port);



