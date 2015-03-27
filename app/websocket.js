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

            //An anderen Client der mit Account verbunden ist, disconnet senden
            socket.broadcast.to(userid).emit('disconnectUser',{});

            //Client jon Room Clients
            socket.join(userid);
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
                var json = dashboardManager.renderDashboardToJson(panels);

                //Dashboard nur bei den Angefragten Client akktualisieren
                socket.emit('updateDashboard', json);
            });
        });
        socket.on('addPanel', function(data){
            dashboardManager.addPanel(socket.dashboard, data.title, data.text, data.link, data.img, data.file , function(){
                dashboardManager.getPanels(socket.dashboard, function(panels){
                    var json = dashboardManager.renderDashboardToJson(panels);

                    //Nur bei den Clients das Dashboard Akktualisieren die auch in dem Dashboard sind
                    io.sockets.in(socket.dashboard).emit('updateDashboard', json);
                });
            });
        });
        socket.on('changePositionPanel', function(data){
            dashboardManager.changePanelPosition(socket.dashboard, data.serialize,function(){
                dashboardManager.getPanels(socket.dashboard, function(panels){
                    var json = dashboardManager.renderDashboardToJson(panels);

                    //An alle Clients die Änderung senden die im Dashboard sind, außer bei den Angefragten Client
                    socket.broadcast.to(socket.dashboard).emit('updateDashboard', json);
                });
            });
        });

        socket.on('changeValuePanel', function(data){
            dashboardManager.editPanel(socket.dashboard, data.panelId, data.title, data.text, data.link, data.img ,function(){
                dashboardManager.getPanels(socket.dashboard, function(panels){
                    var json = dashboardManager.renderDashboardToJson(panels);

                    //An alle Clients die Änderung senden die im Dashboard sind, außer bei den Angefragten Client
                    io.sockets.in(socket.dashboard).emit('updateDashboard', json);
                });
            });
        });
        socket.on('removePanel', function(data){
            dashboardManager.deletePanel(socket.dashboard, data.panelId, function(){
                dashboardManager.getPanels(socket.dashboard, function(panels){
                    var json = dashboardManager.renderDashboardToJson(panels);

                    //An alle Clients die Änderung senden die im Dashboard sind, außer bei den Angefragten Client
                    io.sockets.in(socket.dashboard).emit('updateDashboard', json);
                });
            });
        });
        socket.on('leaveDashboard', function(){
            userManager.leaveDashboard(socket.userid, socket.dashboard, function(){
                socket.leave(socket.dashboard);
                socket.dashboard = '';

                socket.emit('updateDashboard', {});
            });
        });
    });
}