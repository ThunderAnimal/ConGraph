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
exports.addPanel = function(dashboardId, title, text, callback){
    Dashboard.findById(dashboardId, function(err, dashboard){
        var panels = dashboard.panels;
        var maxNum = 0;

        //Nach größter Nummer in 1. Spalte suchen
        for(var i = 0; i < panels.length; i++){
            if(maxNum <= panels[i].y && panels[i].x == 0){
                maxNum = panels[i].y + 1;
            }
        }

        //Add Panel
        dashboard.panels.push({name: title, beschreibung: text, x: 0, y: maxNum});
        dashboard.save(function(err, dashboard){
            callback();
        });
    });
};
exports.getPanels = function(dashboardId,callback){
    Dashboard.findById(dashboardId, function(err, dashboard){
        callback(dashboard.panels);
    });
};
exports.renderDashboardToHtml = function(panels){
    var dashboardHtml;
    var panelHtml;

    var column1 = '<div class="column" id="column1">';
    var column2 = '<div class="column" id="column2">';
    var column3 = '<div class="column" id="column3">';

    //Panels sortieren nach dem y-wert --> Richtige Reihenfolge für Ausgabe
    panels.sort(function(a,b){
       return parseInt(a.y) - parseInt(b.y)
    });

    //columns mit Panels füllen
    for(var i = 0; i < panels.length; i++){
        panelHtml = renderPanelToHtml(panels[i].name,panels[i].beschreibung);
        switch (panels[i].x){
            case 0: column1 += panelHtml;
                break;
            case 1: column2 += panelHtml;
                break;
            case 2: column3 += panelHtml;
                break;
        }
    }
    column1 += '</div>';
    column2 += '</div>';
    column3 += '</div>';

    dashboardHtml = column1 + column2 + column3;

    return dashboardHtml;
};

function renderPanelToHtml(title, content){
    var html =  '<div class="portlet">' +
                '<div class="portlet-header">' + title + '</div> ' +
                '<div class="portlet-content">' + content + '</div>' +
                '</div>';
    return html;
}