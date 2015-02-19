/**
 * Created by martin_w on 19.02.2015.
 */

//app/websocket.js
module.exports = function(io){

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
}