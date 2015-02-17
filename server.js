//------------------ Usings Modules ----------------
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server)
var mail = require('./server/mail.js');
var db = require('./server/dbAgent.js');
var conf = require('./config.json');

//------------------ Middleware ----------------
app.use(express.static(__dirname + '/public'));

//------------------ Routing ----------------
//Auf Index Html navigiren
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/page/login.html');
});


//Send Regstrie Mail
app.get('/sendRegistMail', function(req, rs){
    mail.sendRegistMail(req,rs);
});

//Send Forgot PW Mail
app.get('/sendForgotPWMail', function(req, rs){
    mail.sendForgotPWMail(req,rs);
});

//------------------ Websocket ----------------
io.sockets.on('connection', function (socket) {
    // der Client ist verbunden
    socket.emit('chat', { zeit: new Date(), text: 'Du bist nun mit dem Server verbunden!' });
    // wenn ein Benutzer einen Text senden
    socket.on('chat', function (data) {
        // so wird dieser Text an alle anderen Benutzer gesendet
        io.sockets.emit('chat', { zeit: new Date(), name: data.name || 'Anonym', text: data.text });
    });
});


//------------------ Starting Webserver ----------------
server.listen(conf.port, function(){
    console.log('Der Server läuft nun unter http://127.0.0.1:' + conf.port + '/');
});

