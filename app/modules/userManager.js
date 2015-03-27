/**
 * Created by martin_w on 19.02.2015.
 */
var User = require('../models/user.js');
var Mail = require('../modules/mail.js');

exports.checkLogin = function(req, res){
    var session = req.session;

    session.login = false;
    session._id = '';

    User.findOne({'name' : req.body.name}, function(err, user){
        if(err)
            res.end('error');
        //User vorhanden
        if(user){
            if(user.pw == req.body.pw && user.aktiv == true){
                session.login = true;
                session._id = user._id;
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
exports.connectUser = function(req, res){
    var session = req.session;
    
    res.send(String(session._id));
}

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
                    aktiv: false,
                    dashboards: []});
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
};
exports.getUserName = function(userId, callback){
        User.findById(userId, function(err, user){
            callback(user.name);
        });
};
exports.getUserToDashboard = function(req, res){
    var dashbaordId = req.query.dashbaordId;
    var userList = new Array();
    User.find()
        .exec(function(err, users){
            if(err){
                res.send('error');
            }else {
                for (var i = 0; i < users.length; i++) {
                    for (var j = 0; j < users[i].dashboards.length; j++) {
                        if (dashbaordId.toString() == users[i].dashboards[j].toString()) {
                            userList.push({name: users[i].name, email: users[i].email});
                            break;
                        }
                    }
                }
                res.send(userList);
            }
        });
};
exports.addDashboard = function(req, res){
    var dashboardId = req.body.dashboardId;
    var userMail = req.body.userMail;

    User.findOne({'email': userMail}, function(err, user){
        if(err) {
            res.send('Error');
        }
        if(user){
            user.dashboards.push(dashboardId);
            user.save(function(err,user){
                if(err){
                    res.send('Error');
                }else{
                    Mail.sendInvitationDashboard(user);
                    res.send('success');
                }
            });
        }else{
            res.send('Nutzer nicht Vorhanden');
        }
    });
};
exports.leaveDashboard = function(userId, daschboardId, callback){
    User.findById(userId, function(err, user){
        var i = user.dashboards.indexOf(daschboardId);
        user.dashboards.splice(i,1);

        //Save
        user.save(function(error, user) {
            if (error) {
                console.error.bind(console, 'DB save error:');
            }
            //Rückmeldung das Verarbeitung Fertig
            callback();
        });
    });
};

