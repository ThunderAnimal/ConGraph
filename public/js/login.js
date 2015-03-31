/**
 * Created by Martin on 17.02.2015.
 */
$(document).ready(function(){
    $('#sendPWForgotMail').click(function(){
        var to = $('#inputPWForgotMail').val();
        $.post('../sendForgotPWMail', {email: to}, function(data){
            if(data == 'sent'){
                alert('Mail send');
                $('#modalPWForgot').modal('hide');
            }
            else{
                alert(data);
            }
        });
    });
    $('#sendRegister').click(function(){
        $.post('../newUser', {email: $('#inputRegisterMail').val(), name: $('#inputRegisterName').val(), pw: $('#inputRegisterPW').val()}, function(data){
            if(data == 'success'){
                alert('User added');
                $('#modalRegister').modal('hide');
            }
            else{
                alert(data);
            }
        });
    });
    $('#btnSignIn').click(checkLogin);
    $('#flnUser').keypress(function (e) {
        if (e.which == 13) {
            checkLogin();
        }
    });
    $('#flnPass').keypress(function (e) {
        if (e.which == 13) {
            checkLogin();
        }
    });
});

//---------- Function ------------------

//Login überprüfen
function checkLogin(){
    var name = $('#flnUser').val();
    var pw = $('#flnPass').val();
    $.post('../login', {name: name, pw: pw}, function(data){
        if(data !== 'success'){
            alert('Wrong Username or Password');
        }
        else{
            window.location.href='../home';
        }
    });
}