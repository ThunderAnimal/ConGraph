/**
 * Created by Martin on 17.02.2015.
 */
//Configuration SMTP
var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: 'Gmail',
    auth: {
        user: 'martinweber.9393@gmail.com',
        pass: 'muhkuh2149'
    }
});


exports.sendRegistMail = function(req, rs){
    var mailOption = {
        to: req.query.email,
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
        to: req.query.email,
        subject: "GonGraph - Passwort Vergessen",
        text: "neues Passwort ist folgendes: ..."
    };

    //TODO generate new PW
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
