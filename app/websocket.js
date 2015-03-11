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
        socket.on('chat', function (data) {
            // so wird dieser Text an alle anderen Benutzer gesendet
            userManager.getUserName(socket.userid, function(name){
                io.sockets.emit('chat', {zeit: new Date(), name: name , text: data.text});
            });
        });
        socket.on('joinDashboard', function(dashboardId){
            //Client joint Room
            socket.leave(socket.dashboard);
            socket.join(dashboardId);
            socket.dashboard = dashboardId;

            dashboardManager.getPanels(dashboardId, function(panels){
                var html = dashboardManager.renderDashboardToHtml(panels);

                //Dashboard nur bei den Angefragten Client akktualisieren
                socket.emit('updateDashboard', html);
            });
        });
        socket.on('addPanel', function(data){
            dashboardManager.addPanel(socket.dashboard, data.title, data.text, function(){
                dashboardManager.getPanels(socket.dashboard, function(panels){
                    var html = dashboardManager.renderDashboardToHtml(panels);

                    //Nur bei den Clients das Dashboard Akktualisieren die auch in dem Dashboard sind
                    io.sockets.in(socket.dashboard).emit('updateDashboard', html);
                });
            });
        });
        socket.on('changePositionPanel', function(data){
            dashboardManager.changePanelPosition(socket.dashboard, data.panelId, data.x,data.y,function(){
                dashboardManager.getPanels(socket.dashboard, function(panels){
                    var html = dashboardManager.renderDashboardToHtml(panels);

                    //An alle Clients die Änderung senden die im Dashboard sind, außer bei den Angefragten Client
                    socket.broadcast.to(socket.dashboard).emit('updateDashboard', html);
                });
            });
        });

        socket.on('changeValuePanel', function(data){
           //TODO Panel speichern

            dashboardManager.getPanels(socket.dashboard, function(panels){
                var html = dashboardManager.renderDashboardToHtml(panels);

                //An alle Clients die Änderung senden die im Dashboard sind, außer bei den Angefragten Client
                socket.broadcast.to(socket.dashboard).emit('updateDashboard', html);
            });
        });
        socket.on('leaveDashboard', function(){
            socket.leave(socket.dashboard);
            socket.dashboard = '';

            socket.emit('updateDashboard', {});
        });
    });
}