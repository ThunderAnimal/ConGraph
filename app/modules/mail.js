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
        subject: "ConGraph - Registrierung",
        text: text
    };

    sendMail(mailOption);
};
exports.sendForgotPWMail = function(user){
    var mailOption = {
        to: user.email,
        subject: "GonGraph - Passwort Vergessen",
        text: "Das Passwort ist:" + user.pw
    };

    sendMail(mailOption);
};

exports.sendInvitationDashboard = function(user){
    var text = "Du wurdest zu einen Dashboard eingeladen! \n" +
        "Schau dir einfach das Dashboard an: \n" +
        "http://congraph.de";
    var mailOption = {
        to: user.email,
        subject: "ConGraph - Neues Dashboard",
        text: text
    };

    sendMail(mailOption);
};

function sendMail(mailOption){
    smtpTransport.sendMail(mailOption, function(error, response){
        if(error){
            console.error.bind(console, 'Mail send error: ');
        }else{
            console.log("Message sent: " + response.message);
        }
    });
}
