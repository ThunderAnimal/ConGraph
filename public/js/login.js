/**
 * Created by Martin on 17.02.2015.
 */
$(document).ready(function(){
    $('#sendPWForgotMail').click(function(){
        var to = $('#inputPWForgotMail').val();
        $.post('../sendForgotPWMail', {email: to}, function(data){
            if(data == 'sent'){
                alert('Mail versendet');
            }
            else{
                alert('error');
            }
        });
    });
    $('#btnKontoErstellen').click(function(){
        $.post('../newUser', {email: 'martinweber.93@outlook.com', name: 'ThunderAnimal', pw: '12345678'}, function(data){
            if(data == 'success'){
                alert('User angelegt');
            }
            else{
                alert('Fehler beim Anlegen beim User');
            }
        });
    });
    $('#btnSignIn').click(function(){
        var name = $('#flnUser').val();
        var pw = $('#flnPass').val();
        $.post('../login', {name: name, pw: pw}, function(data){
            if(data !== 'success'){
                alert('Benutzername oder Passwort Falsch');
            }
            else{
                window.location.href='../home';
            }
        });
    });
});