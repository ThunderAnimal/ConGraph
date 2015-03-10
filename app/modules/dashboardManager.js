/**
 * Created by martin_w on 03.03.2015.
 */

var Dashboard   = require('../models/dashboard.js');
var User        = require('../models/user.js');
var Mail = require('../modules/mail.js');

exports.getDashboards = function(req, res){
    var session = req.session;
    var dashboardList = [];

    User.findById(session._id,function(err, user){
        Dashboard.find({_id:{$in: user.dashboards}}, function(err, dashboards){
            for(var i = 0; i < dashboards.length; i++){
                dashboardList.push({id: dashboards[i]._id, name: dashboards[i].name});
            }
            res.send(dashboardList);
        });
    });
};
exports.createDashboard = function(req, res){
    var session = req.session;
    
    var newDashboard = new Dashboard({
       name: req.body.name
    });
    newDashboard.save(function(err, dashboard){
        if(err)
            console.log(err);
        User.findById(session._id,function(err, user){
            user.dashboards.push(dashboard._id);
            user.save(function(err, user){
                res.send('success');
            });

        });
    });
};
exports.addUser = function(req, res){
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
exports.getPanels = function(dashboardId,callback){
    Dashboard.findById(dashboardId, function(err, dashboard){
        callback(dashboard.panels);
    });
};