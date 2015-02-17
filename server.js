//------------------ Usings Modules ----------------
var express = require('express')
    ,   app = express()
    ,   server = require('http').createServer(app)
    ,   io = require('socket.io').listen(server)
    ,   conf = require('./config.json');



//------------------ Middleware ----------------
app.use(express.static(__dirname + '/public'));

//------------------ Routing ----------------
//Auf Index Html navigiren
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/public/page/login.html');
});


//Send Regstrie Mail
app.get('/sendRegistMail', function(req, res){

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

