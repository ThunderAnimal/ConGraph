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
app.use(express.static(path.join(__dirname, 'public')));


// routes ======================================================================
require('./app/routes.js')(app);

// websocket ===================================================================

//Der Client ist Verbunden
io.sockets.on('connection', function (socket) {

    // Chat -----------------------
    socket.emit('chat', { zeit: new Date(), text: 'Du bist nun mit dem Server verbunden!' });
    // wenn ein Benutzer einen Text senden
    socket.on('chat', function (data) {
        // so wird dieser Text an alle anderen Benutzer gesendet
        io.sockets.emit('chat', { zeit: new Date(), name: data.name || 'Anonym', text: data.text });
    });

    // NEW -----------------------
});

//require('./app/websocket')(io);

// launch ======================================================================
server.listen(configServer.port);
console.log('The magic happens on port ' + configServer.port);



