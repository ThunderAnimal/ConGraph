/**
 * Created by martin_w on 03.03.2015.
 */
$(document).ready(function() {
    $.post('../connectUser', {}, function(data){
        io.connect().emit('connectUser', data);
    });
    $.get('../dashboards',{},function(data){
        console.log(data);
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
});