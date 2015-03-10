/**
 * Created by Denny on 03.03.2015.
 */
$(document).ready(function(){
    // WebSocket
    var socket = io.connect();
    // neues Panel
    socket.on('panel', function () {

        $('#column1').append(
            $(' <div class="portlet ui-widget ui-widget-content ui-helper-clearfix ui-corner-all ">'+

                    '<div class="portlet-header ui-widget-header ui-corner-all " > ' +
                    '<span class="ui-icon ui-icon-minusthick portlet-toggle"></span>'+
                    'Links</div>'+
                    '<div class="portlet-content">Lorem ipsum dolor sit amet, consectetuer adipiscing elit</div>'+
            '</div>'));
    });

    // Panel hinzufügen
    function addPanel(){
        // Socket senden
        socket.emit('panel');
    }
    // bei einem Klick
    $('#newPanel').click(addPanel);


    $(function() {

    });



});