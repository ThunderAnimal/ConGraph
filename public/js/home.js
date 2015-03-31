/**
 * Created by martin_w on 03.03.2015.
 */

var globalPanelId = null;
var globalDashBoardId = null;
var gridster;
var globalIcon;

$(document).ready(function() {
    //---------- Function on Start------------------

    //### Anzeige
    $('#progressAddPanel').hide();
    //Disable Buttons
    disableControllButtons();


    //### Gridster
    gridster = $(".gridster ul").gridster({
        widget_margins: [10, 10],
        widget_base_dimensions: [200, 200],
        min_cols:4,
        max_cols:4,
        serialize_params: function($w, wdg){
            return{
                id: $w.attr('id'),
                col: $w.attr('data-col'),
                row: $w.attr('data-row'),
                size_x: $w.attr('data-sizex'),
                size_y: $w.attr('data-sizey')
            }
        },
        draggable:{
            stop: function(e, ui, $widget){
                var s = gridster.serialize_changed();
                s = JSON.stringify(s);
                io.connect().emit('changePositionPanel', { serialize: s});
            }
        },
        resize:{
            enabled: true,
            axes: ['both'],
            max_size:[2,2],
            stop: function(e, ui, $widget){
                var id = $widget.attr('id');
                if($widget.height() < 400){
                    $('#image' + id).removeClass('box-image-big').addClass('box-image-small');
                }
                else{
                    $('#image' + id).removeClass('box-image-small').addClass('box-image-big');
                }
                //Austausch der TextArea-Styles
                if($widget.height() == 200 && $widget.width() == 420){
                    $('#text' + id).removeClass('ta-big ta-big-wide ta-small').addClass('ta-small-wide');
                }
                if($widget.height() ==200 && $widget.width() == 200){
                    $('#text' + id).removeClass('ta-big ta-small-wide ta-big-wide').addClass('ta-small');
                }
                if($widget.height() == 420 && $widget.width() == 420){
                    $('#text' + id).removeClass('ta-big ta-small-wide ta-small').addClass('ta-big-wide');
                }
                if($widget.height() == 420 && $widget.width() == 200){
                    $('#text' + id).removeClass('ta-big-wide ta-small ta-small-wide').addClass('ta-big');
                }

                var s = gridster.serialize_changed();
                s = JSON.stringify(s);
                io.connect().emit('changePositionPanel', { serialize: s});
            }
        }
    }).data('gridster');

    //### Load Icons

    //Icons laden
    $.get('../icons',{},function(data){
        var functionText = "";
        if (data == "error")
            console.log(data);
        else {
            for (var i=0; i< data.length;i++) {
                var functionText = "getImg('"+ data[i].source +"')";
                $('#setImages').append(
                    $('<a> <img src="' + data[i].source + '" width="40px" height="40px"  onclick="'+ functionText +'"></a>')
                );
            }
            for (var i=0; i< data.length;i++) {
                var functionText = "getImg('"+ data[i].source +"')";
                $('#setEditImages').append(
                    $('<a> <img src="' + data[i].source + '" width="40px" height="40px"  onclick="'+ functionText +'"></a>')
                );
            }
        }
    });

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
                $('#modalNewDashboard').modal('hide');
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
        var dashboardId = globalDashBoardId;
        if(dashboardId === undefined || dashboardId === null){
            alert("In keinem Dashboard!");
            return;
        }
        $.post('../addUserToDashboard',{dashboardId: dashboardId, userMail:userMail}, function(data){
            if(data !== 'success'){
                alert(data);
            }else{
                alert("User successfully added!");
                $('#modalAddUserToDashboard').modal('hide');
            }
        });
    });
    $('#btnLeaveDashboard').click(function(){
        if(confirm("Do you want to leave the dashborad?")) {
            disableControllButtons();
            globalDashBoardId = "";
            io.connect().emit('leaveDashboard', {});
            $('#headerDashboard').text("No Dashbaord selected!");
        }
    });

    $('#btnAddPanel').click(function(){
        var file = $('#inputPanelFile').get(0).files[0];
        $('#progressAddPanel').show();

        if(file !== undefined){
            $('#uploadFileForm').submit();
        }else{
            addPanelWebSocket('');
            clearAddPanelModal();
        }
    });
    $('#btnDeletePanel').click(function(){
        if(confirm("Do you want to delete the panel?")){
            deletePanel(globalPanelId);
        }
    });
    $('#btnEditPanel').click(function(){
        var title = $('#editPanelTitle').val();
        var desc = $('#editPanelDescription').val();
        var link = $('#editPanelLink').val();
        var icon = globalIcon;
        io.connect().emit('changeValuePanel', { panelId: globalPanelId, title: title, text: desc, link: link, img: icon});
        $('#modalEditPanel').modal('hide');
    });


    $('#senden').click(senden);

    $('#text').keypress(function (e) {
        if (e.which == 13) {
            senden();
        }
    });

    //Logout
    $('#btnLogout').click(function(){
        logout();
    });
    $('#uploadFileForm').submit(function() {
        $(this).ajaxSubmit({
             success: function (response) {
                 addPanelWebSocket(response);
                 clearAddPanelModal();
            }
        });
        return false;
    });

    //---------- Websocket notification------------------

    //Server Meldet Dashboard hat sich verändert
    io.connect().on('updateDashboard', function (data) {
        var serialization = data;
        serialization = Gridster.sort_by_row_and_col_asc(serialization);
        gridster.remove_all_widgets();
        $.each(serialization, function() {
            gridster.add_widget(this.content, this.size_x, this.size_y, this.col, this.row);
        });
        gridster.$changed = $([]);
    });
    io.connect().on('disconnectUser', function(){
        alert("session is over");
        logout();
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
        $('.chatList').scrollTop($('.chatList')[0].scrollHeight);
    });
});

//---------- Function ------------------
function logout(){
    $.post('../logout',{},function(){
        window.location.href = '../login';
    });
}


// Nachricht senden
function senden(){
    // Eingabefelder auslesen
    var name = $('#name').val();
    var text = $('#text').val();
    // Socket senden
    if (text.length > 0)
        io.connect().emit('chat', { text: text });
    // Text-Eingabe leeren
    $('#text').val('');
}

function loadDashboard(dashboardID, dashboardName){

    enableControllButtons();
    globalDashBoardId = dashboardID;

    io.connect().emit('joinDashboard', dashboardID);
    $('#headerDashboard').text(dashboardName);
}

function editPanel(globalPanelId){
    $('#modalViewPanel').modal('hide');
    var text = $('#text'+globalPanelId);
    var title = $('#header'+globalPanelId);
    var link = $('#link'+globalPanelId);
    getImg(globalIcon);
    $('#editPanelTitle').val(title.text());
    $('#editPanelDescription').val(text.html());
    $('#editPanelLink').val(link.html());
    $('#modalEditPanel').modal('show');
}

function deletePanel(panelId) {
    io.connect().emit('removePanel', {panelId: panelId});
    $('#modalViewPanel').modal('hide');
}

function showPanel(panelID){
    var text = $('#text'+panelID);
    var title = $('#header'+panelID);
    var icon = $('#image'+panelID);
    var file = $('#file'+panelID);
    var link = $('#link'+panelID);

    $('#showFile').empty();
    if(file.text() !== 'undefined'){
        $('#showFile').append(
            $('<a target="_blank" href="' + file.text() + '" > <img src="' + file.attr('data-icon') + '" class="img-rounded img-responsive center-block"></a>')
        );
    }
    if(icon.attr('src') === undefined || icon.attr('src') === null){
        $('#setViewIcon').hide();
    }

    else{
        $('#setViewIcon').show();
        getImg(icon.attr('src'));
    }
    if(link.html()=== undefined || link.html() === null){
        $('#viewPanelLink').hide();
    }else{
        $('#viewPanelLink').empty();
        $('#viewPanelLink').append(
            $('<a target="_blank" href="' + link.html() + '">' + link.html() + '</a>')
        )
    }
    $('#viewPanelLabel').text(title.text());
    $('#viewPanelDescription').text(text.html());
    globalPanelId = panelID;

    $('#modalViewPanel').modal('show');
}
function enableControllButtons(){
    //Enable Buttons
    $('#btnNewPanel').attr("disabled", false);
    $('#btnAddUserToDashboardModal').attr("disabled", false);
    $('#btnLeaveDashboard').attr('disabled', false);
}
function disableControllButtons(){
    $('#btnNewPanel').attr("disabled", true);
    $('#btnAddUserToDashboardModal').attr("disabled", true);
    $('#btnLeaveDashboard').attr('disabled', true);
}

function getImg(img){
    globalIcon = img;
    $('#setIcon').empty();
    $('#setEditIcon').empty();
    $('#setViewIcon').empty();
    $('#setIcon').append(
        $('<a><img src="'+globalIcon+'"width="40px" height="40px"></a>')
    )
    $('#setEditIcon').append(
        $('<a><img src="'+globalIcon+'"width="40px" height="40px"></a>')
    )
    $('#setViewIcon').append(
        $('<a><img src="'+globalIcon+'"width="40px" height="40px"></a>')
    )
}

function loadUserToDashboard(){
    $.get('../getUserToDashboard',{dashbaordId: globalDashBoardId},function(data){
        if (data == "error")
            console.log(data);
        else {
            $('#loadUserToDashboard').empty();
            $('#loadUserToDashboard').append(
                $('<li class="list-group-item active" style="background-color: #28697d;"> Dashboard User</li>')
            );
            for (var i=0; i< data.length;i++){
                $('#loadUserToDashboard').append(
                    $('<li class="list-group-item"><h4 class="list-group-item-heading">' + data[i].name +'</h4><p class="list-group-item-text">' + data[i].email +'</p></li>')
                );
            }
        }

    });
}
function clearAddPanelModal(){
    $('#inputPanelTitle').val('');
    $('#inputPanelDescription').val('');
    $('#inputPanelLink').val('');
    $('#inputPanelImg').val('');
    $('#inputPanelFile').val('');

    $('#progressAddPanel').hide();
    $('#modalNewPanel').modal('hide');
}
function addPanelWebSocket(file){
    var title = $('#inputPanelTitle').val();
    var desc = $('#inputPanelDescription').val();
    var link = $('#inputPanelLink').val();
    var icon = globalIcon;
    io.connect().emit('addPanel', { title: title, text: desc, link: link, img: icon, file: file});
}