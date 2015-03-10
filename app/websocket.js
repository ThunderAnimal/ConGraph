/**
 * Created by martin_w on 19.02.2015.
 */
var userManager = require('../app/modules/userManager.js');
var dashboardManager = require('../app/modules/dashboardManager.js');

//app/websocket.js
module.exports = function(io){
    
    //Der Client ist Verbunden
    io.sockets.on('connection', function (socket) {
        //Store Client Information
        socket.on('connectUser', function (userid) {
            socket.userid = userid;
            socket.dashboard = '';
            socket.emit('chat', { zeit: new Date(), text: 'Du bist nun mit dem Server verbunden!' });
        });
        // Chat -----------------------
        // wenn ein Benutzer einen Text senden
        socket.on('chat', function (data) {
            // so wird dieser Text an alle anderen Benutzer gesendet
            userManager.getUserName(socket.userid, function(name){
                io.sockets.emit('chat', {zeit: new Date(), name: name , text: data.text});
            });
        });
        socket.on('joinDashboard', function(dashboardId){
            socket.leave(socket.dashboard);
            socket.join(dashboardId);
            socket.dashboardId = dashboardId;

            dashboardManager.getPanels(dashboardId, function(panels){
                var html = '<div class="column" id="column1">' +
                    '<div class="portlet ui-widget ui-widget-content ui-helper-clearfix ui-corner-all ">'+

                '<div class="portlet-header ui-widget-header ui-corner-all " > ' +
                '<span class="ui-icon ui-icon-minusthick portlet-toggle"></span>'+
                'Links</div>'+
                '<div class="portlet-content">Lorem ipsum dolor sit amet, consectetuer adipiscing elit</div>'+
                '</div></div>';
                socket.emit('updateDashboard', html);
            });


        });
        
        socket.on('leaveDashboard', function(){
            socket.leave(socket.dashboard);
            socket.dashboard = '';

            socket.emit('updateDashboard', {});
        });

        // Panel -----------------------
        socket.on('panel', function () {
            // Panel wird an alle Nutzer gesendet
            io.sockets.emit('panel');
        });




        // NEW -----------------------
    });
}