/**
 * Created by Martin on 17.02.2015.
 */
$(document).ready(function(){
    $('#sendPWForgotMail').click(function(){
        var to = $('#inputPWForgotMail').val();
        $.get('http://localhost:80/sendForgotPWMail', {email: to}, function(data){
            if(data == 'sent'){
                alert('Mail versendet');
            }
            else{
                alert('error');
            }
        });
    });
});