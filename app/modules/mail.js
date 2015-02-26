/**
 * Created by Martin on 17.02.2015.
 */
//Configuration SMTP
var nodemailer = require('nodemailer');
var configMail = require('../../config/mail.js');
var smtpTransport = nodemailer.createTransport("SMTP",configMail);


exports.sendRegistMail = function(user){
    var text = "Erfolgreich bei ConGraph Registriert \n" +
            "Aktivierung über folgenden Link: \n" +
            "http://congraph.de/act?id=" + user._id
    var mailOption = {
        to: user.email,
        subject: "Registrierung ConGraph",
        text: text
    };

    //TODO generet RegLink

    smtpTransport.sendMail(mailOption, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
    });
};
exports.sendForgotPWMail = function(user){
    var mailOption = {
        to: user.email,
        subject: "GonGraph - Passwort Vergessen",
        text: "Das Passwort ist:" + user.pw
    };

    //TODO generate new PW

    smtpTransport.sendMail(mailOption, function(error, response){
        if(error){
            console.error.bind(console, 'Mail send error: ')
        }else{
            console.log("Message sent: " + response.message);
        }
    });
};
