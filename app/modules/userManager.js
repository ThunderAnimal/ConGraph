/**
 * Created by martin_w on 19.02.2015.
 */
var User = require('../models/user.js');
var Mail = require('../modules/mail.js');

exports.checkLogin = function(req, res){
    var session = req.session;

    session.login = false;
    session.email = '';

    User.findOne({'name' : req.body.name}, function(err, user){
        if(err)
            res.end('error');
        //User vorhanden
        if(user){
            if(user.pw == req.body.pw && user.aktiv == true){
                session.login = true;
                session.email = user.email;
                res.end('success');
            }
            else {
                res.end('error');
            }
        }
        else{
            res.end('error');
        }
    });
};

exports.addUser = function(req, res){
    User.find()
        .or([{name: req.body.name},{email: req.body.email}])
        .exec(function (err, results) {
            if(results.length > 0) {
                res.end('Benutzer schon vorhanden!');
            }
            else{
                var newUser = new User({
                    email: req.body.email,
                    name: req.body.name,
                    pw: req.body.pw,
                    aktiv: false });
                newUser.save(function(err, user){
                    if(err){
                        res.send('error');
                    }else{
                        Mail.sendRegistMail(user);
                        res.send('success');
                    }
                });
            }
    });
};
exports.activateUser = function(req, res){
    var id = req.query.id;
    User.findOne({'_id': id}, function(err, user){
        if(err)
            res.send('error');
        if(user){
            user.aktiv = true;
            user.save(function(err, user){
               if(err){
                   res.send('error');
               }
                else{
                  var text =  'Benutzer erfolgreich aktiviert!'
                      + '<br>'
                      + 'Automatische Weiterleitung in 3 Sekunden...'
                      + '<br>'
                      + ' <a href="http://www.congraph.de/login"> congraph.de </a>'
                      + '<script>setTimeout(function(){window.location.href="../login"},3000);</script>';
                   res.send(text);
               }
            });
        }
    });
};
exports.forgetPass = function(req,res){
    User.findOne({'email' : req.body.email}, function(err, user){
        if(err)
            res.send('error');
        if (user){
            Mail.sendForgotPWMail(user);
            res.send('Passwort verschickt');
        } else {
            res.send('Email Adresse nicht vorhanden');
        }

    });
}

