/**
 * Created by Martin on 17.02.2015.
 */
//Configuration SMTP
var nodemailer = require('nodemailer');
var configMail = require('../../config/mail.js');
var smtpTransport = nodemailer.createTransport("SMTP",configMail);


exports.sendRegistMail = function(req, rs){
    var mailOption = {
        to: req.body.email,
        subject: "Registrierung ConGraph",
        text: "Erfolgreich bei ConGraph Registriert"
    };

    //TODO generet RegLink

    smtpTransport.sendMail(mailOption, function(error, response){
        if(error){
            console.log(error);
            rs.send("error");
        }else{
            console.log("Message sent: " + response.message);
            rs.send("sent");
        }
    });
};
exports.sendForgotPWMail = function(req, rs){
    var mailOption = {
        to: req.body.email,
        subject: "GonGraph - Passwort Vergessen",
        text: "neues Passwort ist folgendes: ..."
    };

    //TODO generate new PW

    smtpTransport.sendMail(mailOption, function(error, response){
        if(error){
            console.error.bind(console, 'Mail send error: ')
            rs.send("error");
        }else{
            console.log("Message sent: " + response.message);
            rs.send("sent");
        }
    });
};
