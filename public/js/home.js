/**
 * Created by martin_w on 03.03.2015.
 */
$(document).ready(function() {
    //---------- Function on Start------------------

    //Connect User bei Server und Websocket
    $.post('../connectUser', {}, function(data){
        io.connect().emit('connectUser', data);
    });


    //---------- Triggers------------------

    //Ertselle neues Dashboard
    $('#btnAddDashboard').click(function(){
        var name = $('#inputDashboardName').val();
        $.post('../newDashboard', {name: name}, function(data){
            if(data === 'success'){
                alert("Dashboard angelegt");
            }
            else{
                alert("Error");
            }
        });
    });

    //Generiere Dynamische die Dashboard Liste
    $('#btnDashboardList').click(function(){
        $.get('../dashboards',{},function(data){
            var functionText = "";
            $('#dashboardList').empty();
            for (var i=0; i< data.length;i++) {
                functionText = "loadDashboard('"+ data[i].id +"', '" + data[i].name + "' )";
                $('#dashboardList').append(
                    $('<li onclick="' + functionText + '" role="presentation">' +
                        '<a role="menuitem" tabindex="-1" href="#">'+
                            data[i].name +
                         '</a>' +
                    '</li>')
                );
            }
        });

    });
    $('#btnAddUserToDashboard').click(function(){
        var userMail = $('#inputUserMail').val();
        var dashboardId = sessionStorage.getItem("dashboardID");
        if(dashboardId === undefined || dashboardId === null){
            alert("In keinen Dashboard!");
            return;
        }
        $.post('../addUserToDashboard',{dashboardId: dashboardId, userMail:userMail}, function(data){
            if(data !== 'success'){
                alert(data);
            }else{
                alert("Nutzer Erfolgreich hinzugefügt!");
            }
        });
    });
    $('#btnNewPanel').click(function(){
        alert('hello');
        io.connect().emit('addPanel', { title: "TEST PANEL", text: "Hallo das ist ein TEST Panel, dass ist komplett statisch angelegt"});
    });


    $('#senden').click(senden);

    $('#text').keypress(function (e) {
        if (e.which == 13) {
            senden();
        }
    });

    //Logout
    $('#btnLogout').click(function(){
        $.post('../logout',{},function(){
            window.location.href = '../login';
        });
    });

    //---------- Websocket notification------------------

    //Server Meldet Dashboard hat sich verändert
    io.connect().on('updateDashboard', function (data) {
        $('#dashboard').html(data);
        renderFunctionSortable();
    });

    //Server meldet neue Chatnachricht
    io.connect().on('chat', function (data) {
        var zeit = new Date(data.zeit);
        $('#content').append(
            $('<p></p>').append(
                // Uhrzeit
                $('<span>').text('[' +
                    (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours())
                    + ':' +
                    (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes())
                    + '] '
                ),
                // Name
                $('<b>').text(typeof(data.name) != 'undefined' ? data.name + ': ' : ''),
                // Text
                $('<span>').text(data.text))
        );
        // nach unten scrollen
        //$('.chatList').scrollTop($('.chatList')[0].scrollHeight);
    });
});

//---------- Function ------------------

// Nachricht senden
function senden(){
    // Eingabefelder auslesen
    var name = $('#name').val();
    var text = $('#text').val();
    // Socket senden
    io.connect().emit('chat', { text: text });
    // Text-Eingabe leeren
    $('#text').val('');
}

function loadDashboard(dashboardID, dashboardName){
    sessionStorage.setItem("dashboardID",dashboardID);
    io.connect().emit('joinDashboard', dashboardID);
    $('#headerDashboard').text(dashboardName);
}
function renderFunctionSortable(){
    $( ".column" ).sortable({
        connectWith: ".column",
        handle: ".portlet-header",
        cancel: ".portlet-toggle",
        placeholder: "portlet-placeholder ui-corner-all",
        stop: function(event, ui) {
            //Function when move portlet

            var panelId = ui.item.attr('id');

            //New Position
            var y = ui.item.index();
            var x;
            var helpX = ui.item.parent().attr('id');

            if(helpX === "column1")
                x = 0;
            else if(helpX === "column2")
                x = 1;
            else
                x = 2;

            console.log("New Posotion: " + x + " " + y);

            //Send new Position to Websocket
            io.connect().emit('changePositionPanel', { panelId: panelId, x: x, y: y });
        }
    });
    $( ".portlet" )
        .addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" )
        .find( ".portlet-header" )
        .addClass( "ui-widget-header ui-corner-all" )
        .prepend( "<span class='ui-icon ui-icon-minusthick portlet-toggle'></span>");

    $( ".portlet-toggle" ).click(function() {
        var icon = $( this );
        icon.toggleClass( "ui-icon-minusthick ui-icon-plusthick" );
        icon.closest( ".portlet" ).find( ".portlet-content" ).toggle();
    });
}