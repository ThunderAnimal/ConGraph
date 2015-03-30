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
exports.addPanel = function(dashboardId, title, text, link, img, file, callback){
    Dashboard.findById(dashboardId, function(err, dashboard){
        //Add Panel
        dashboard.panels.push({name: title, beschreibung: text, img: img, link: link, file: file,  col: 1 , row: 1,  size_x: 1, size_y: 2});
        dashboard.save(function(err, dashboard){
            callback();
        });
    });
};
exports.editPanel = function(dashboardId, panelId, title, text,link, img, callback){
    Dashboard.findById(dashboardId, function(err, dashboard) {
        var panels = dashboard.panels;

        //Find Panel
        for(var i = 0; i < panels.length; i++){
            if(panelId.toString() == panels[i]._id.toString()){
                //Edit Panel
                dashboard.panels[i].name = title;
                dashboard.panels[i].beschreibung = text;
                dashboard.panels[i].link = link;
                dashboard.panels[i].img = img;
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

        //Find Panel
        for (var i = 0; i < panels.length; i++) {
            if (panelId.toString() == panels[i]._id.toString()) {
                //Remove panel
                panels.splice(i,1);
                break;
            }
        }
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
exports.changePanelPosition = function(dashboardId, serilization, callback){
    Dashboard.findById(dashboardId, function(err, dashboard) {
        var panels = dashboard.panels;
        var changePanels = JSON.parse(serilization);
        //Änderungen übernehmen
        for(var i = 0; i < changePanels.length; i++){
            for(var k = 0; k < panels.length; k++){
                if(panels[k]._id.toString() === changePanels[i].id.toString()){
                    panels[k].col = changePanels[i].col;
                    panels[k].row = changePanels[i].row;
                    panels[k].size_x = changePanels[i].size_x;
                    panels[k].size_y = changePanels[i].size_y;
                    break;
                }
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
exports.renderDashboardToJson = function(panels){
    var dashboardJson = new Array();
    var panelHtml;

    //columns mit Panels füllen
    for(var i = 0; i < panels.length; i++){
        panelHtml = renderPanelToHtml( panels[i]._id, panels[i].link, panels[i].img, panels[i].name, panels[i].beschreibung, panels[i].file, panels[i].size_y, panels[i].size_x);
        dashboardJson.push({content: panelHtml,
                            col: panels[i].col,
                            row: panels[i].row,
                            size_x: panels[i].size_x,
                            size_y: panels[i].size_y});
    }
    return dashboardJson;
};

function renderPanelToHtml(id, link, img, title, content, file, size_y, size_x){
    var imgSize;
    var divBoxImg;
    var textArea = null;
    var functionText = "showPanel('" + id +"')";
    if(size_y >= 2){
        imgSize = "box-image-big";
    }else{
        imgSize = "box-image-small";
    }
    //Überprüfung für TextArea-Style
    if(size_x == 1 && size_y == 1)
        textArea = "ta-small";
    if(size_x == 1 && size_y == 2)
        textArea = "ta-big";
    if(size_x == 2 && size_y == 1)
        textArea = "ta-small-wide";
    if(size_x == 2 && size_y == 2)
        textArea = "ta-big-wide";

    if(img == '' || img == undefined){
        divBoxImg = ""
    }
    else{
        divBoxImg = '<div class="box-image">' +
                        '<img id="image' + id + '" class="img-rounded img-responsive center-block ' + imgSize +'" src="' + img + '">' +
                    '</div>'
    }

    var html = '<li id="' + id +'" >' +
                    '<div class="box">' +
                        divBoxImg +
                        '<div class="box-header">' +
                            '<h3 id="header' + id + '">' + title + '</h3>' +
                        '</div>' +
                        '<div class="box-content" onclick=' + functionText + '>' +
                            '<textarea class=' + textArea+ ' readonly id="text'+ id + '">' +
                                content +
                            '</textarea>' +
                            '<div id="file'+ id + '" data-icon="' + file.icon +'" class="hidden">' +
                                 file.path +
                            '</div>' +
                            '<div id="link'+ id + '" class="hidden">' +
                                link +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</li>';
    return html;
}