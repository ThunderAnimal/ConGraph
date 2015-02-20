/**
 * Created by martin_w on 19.02.2015.
 */
var User = require('../models/user.js');

exports.checkLogin = function(req, res){
    var session = req.session;

    session.login = false;
    session.email = '';

    User.findOne({'name' : req.body.name}, function(err, user){
        if(err)
            res.end('error');
        //User vorhanden
        if(user){
            if(user.pw == req.body.pw){
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
}