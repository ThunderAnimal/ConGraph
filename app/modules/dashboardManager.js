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
exports.editPanel = function(dashboardId, panelId, title, text, callback){
    Dashboard.findById(dashboardId, function(err, dashboard) {
        var panels = dashboard.panels;

        //Find Panel
        for(var i = 0; i < panels.length; i++){
            if(panelId.toString() == panels[i]._id.toString()){
                //Edit Panel
                dashboard.panels[i].name = title;
                dashboard.panels[i].beschreibung = text;
                break;
            }
        }
        dashboard.save(function(error, dashbaord){
            if(error){
                console.error.bind(console, 'DB save error: ');
            }
            callback();
        });
    });
};
exports.deletePanel = function(dashboardId, panelId, callback){
    Dashboard.findById(dashboardId, function(err, dashboard) {
        var panels = dashboard.panels;
        var column, row;

        //Find Panel
        for (var i = 0; i < panels.length; i++) {
            if (panelId.toString() == panels[i]._id.toString()) {
                column = panels[i].x;
                row = panels[i].y;

                //Remove panel
                panels.splice(i,1);
                break;
            }
        }
        //Change Position von panels
        panels = removePositionInColumn(panels,column, row);
        dashboard.panels = panels;

        //Save
        dashboard.save(function(error, dashboard){
            if(error){
                console.error.bind(console, 'DB save error:');
            }
            //Rückmeldung das Verarbeitung Fertig
            callback();
        });
    });
};
exports.changePanelPosition = function(dashboardId, panelId,  newX, newY, callback){
    Dashboard.findById(dashboardId, function(err, dashboard) {
        var oldX, oldY;
        var panels = dashboard.panels;

        //get Old Position of Panel
        for(var i = 0; i < panels.length; i++){
            if(panels[i]._id.toString() === panelId.toString()){
                oldX = panels[i].x;
                oldY = panels[i].y;
                break;
            }
        }

        //Positining all Panels

        //Veränderung alle Panels
        if(oldX === newX){
            panels = changePositionInColumn(panels,oldX,oldY,newY);
        }
        else{
            panels = removePositionInColumn(panels, oldX, oldY);
            panels = addPositionInColumn(panels, newX, newY);
        }

        //Veränderung des aktuellen Panels
        for(var i = 0; i < panels.length; i++){
            if(panels[i]._id.toString() === panelId.toString()){
                panels[i].x = newX;
                panels[i].y = newY;
                break;
            }
        }

        //Wegspeichern in DB
        dashboard.panels = panels;
        dashboard.save(function(error, dashboard){
            if(error){
                console.error.bind(console, 'DB save error:');
            }
            //Rückmeldung das Verarbeitung Fertig
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

    var column1 = '<div class="column col-xs-2 col-xs-offset-1" id="column1">';
    var column2 = '<div class="column col-xs-2" id="column2">';
    var column3 = '<div class="column col-xs-2" id="column3">';
    var column4 = '<div class="column col-xs-2" id="column4">';
    var column5 = '<div class="column col-xs-2" id="column5">';

    //Panels sortieren nach dem y-wert --> Richtige Reihenfolge für Ausgabe
    panels.sort(function(a,b){
       return parseInt(a.y) - parseInt(b.y)
    });

    //columns mit Panels füllen
    for(var i = 0; i < panels.length; i++){
        panelHtml = renderPanelToHtml(panels[i].name,panels[i].beschreibung, panels[i]._id);
        switch (panels[i].x){
            case 0: column1 += panelHtml;
                break;
            case 1: column2 += panelHtml;
                break;
            case 2: column3 += panelHtml;
                break;
            case 3: column4 += panelHtml;
                break;
            case 4: column5 += panelHtml;
                break;
        }
    }
    column1 += '</div>';
    column2 += '</div>';
    column3 += '</div>';
    column4 += '</div>';
    column5 += '</div>';



    dashboardHtml = column1 + column2 + column3 + column4 + column5;

    return dashboardHtml;
};

function renderPanelToHtml(title, content, id){
    //functionText = "editPanel('"+ id +"')";
    functionText = "showPanel('"+ id +"')";
    var html =  '<div class="portlet" id ="' + id +  '">' +
                '<div class="portlet-header" style="cursor: move;" id="header' + id +  '">' + title + ' </div> ' +
                '<div class="portlet-content" style="cursor: pointer;" onclick="'+functionText+'" id="text' + id +  '">' + content + '</div>' +
                '</div>';
    return html;
}
function changePositionInColumn(panels,column, oldY, newY){
    for(var i = 0; i < panels.length; i++){
        if(panels[i].x == column){
            if(panels[i].y > newY){
                if(panels[i].y < oldY)
                    panels[i].y += 1;
                else
                    panels[i].y -= 1;
            }
        }
    }
    return panels;
}
function removePositionInColumn(panels, column, row){
    for(var i = 0; i < panels.length; i++){
        if(panels[i].x == column){
            if(panels[i].y > row){
                panels[i].y -= 1;
            }
        }
    }
    return panels;
}
function addPositionInColumn(panels, column, row){
    for(var i = 0; i < panels.length; i++){
        if(panels[i].x == column){
            if(panels[i].y > row){
                panels[i].y += 1;
            }
        }
    }
    return panels;
}