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
var session = require('express-session');
var multer  = require('multer')

var configDB = require('./config/database.js');
var configServer = require('./config/server.js');

// view ========================================================================
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// DB Connection ===============================================================
mongoose.connect(configDB.url); //connect to database

mongoose.connection.on('error', function(){});
mongoose.connection.once('open', function callback () {
    console.log("Connect DB");
});

// configuration ===============================================================
app.use(logger('dev')); //Log every request to the console
app.use(session({
    secret: 'congrap15-TopSecret!',
    name: 'login',
    resave: true,
    saveUninitialized: true
}));
app.use(cookieParser()); //Read Cookies
app.use(bodyParser.json()); //get information from html forms
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({
    dest: './public/img/upload/',
    rename: function (fieldname, filename) {
        return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...')
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
    }
}));
app.use(express.static(path.join(__dirname, 'public')));


// routes ======================================================================
require('./app/routes.js')(app);

// websocket ===================================================================
require('./app/websocket')(io);

// launch ======================================================================
server.listen(configServer.port);
console.log('The magic happens on port ' + configServer.port);



