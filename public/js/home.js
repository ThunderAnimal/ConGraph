/**
 * Created by martin_w on 03.03.2015.
 */

$(document).ready(function() {



    $.post('../connectUser', {}, function(data){
        io.connect().emit('connectUser', data);
    });
    $('#btnAddDashboard').click(function(){
        $.post('../newDashboard', {name: "testDashboard"}, function(data){
            if(data === 'success'){
                $.get('../dashboards',{},function(data){
                    console.log(data);
                });
            }
        });
    });
    $('#btnLogout').click(function(){
        $.post('../logout',{},function(){
            window.location.href = '../login';
        });
    });
    $('#btnDashboardList').click(function(){
        $.get('../dashboards',{},function(data){
            var functionText = "";
            $('#dashboardList').empty();
            for (var i=0; i< data.length;i++) {
                functionText = "loadDashboard('"+ data[i].id +"')";
                $('#dashboardList').append(
                    $('<li onclick="' + functionText + '" role="presentation">' +
                        '<a role="menuitem" tabindex="-1" href="#">'+
                            data[i].name+
                         '</a>' +
                    '</li>')
                );
            }
        });

    });
    io.connect().on('updateDashboard', function (data) {
        console.log(data);
        $('#dashboard').html(data);
        $( ".column" ).sortable({
            connectWith: ".column",
            handle: ".portlet-header",
            cancel: ".portlet-toggle",
            placeholder: "portlet-placeholder ui-corner-all",
            stop: function(event, ui) {
                alert("New position: " + ui.item.index());
                console.log(ui);
                console.log(ui.item.parent().attr('id'));

            }
        });
    });
});

function loadDashboard(dashboardID){
    io.connect().emit('joinDashboard', dashboardID);

}
function renderDashboard(panels){

}