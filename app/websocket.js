/**
 * Created by martin_w on 19.02.2015.
 */

//app/websocket.js
module.exports = function(io){
    
    //Liste zum Spiechern der Clients
    var clients = [];
    
    //Der Client ist Verbunden
    io.sockets.on('connection', function (socket) {
        //Store Client Information
        socket.on('connectUser', function (userid) {
            socket.userid = userid;
            socket.dashboard = '';
            console.log(socket);
            socket.emit('chat', { zeit: new Date(), text: 'Du bist nun mit dem Server verbunden!' });
        });
        // Chat -----------------------
        // wenn ein Benutzer einen Text senden
        socket.on('chat', function (data) {
            // so wird dieser Text an alle anderen Benutzer gesendet
            io.sockets.emit('chat', { zeit: new Date(), name: data.name || 'Anonym', text: data.text });
        });
        socket.on('joinDashboard', function(dashboardId){
            
            
        });
        // Panel -----------------------
        socket.on('panel', function () {
            // Panel wird an alle Nutzer gesendet
            io.sockets.emit('panel');
        });




        // NEW -----------------------
    });
}