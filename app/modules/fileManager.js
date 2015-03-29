/**
 * Created by martin_w on 24.03.2015.
 */
var fs = require('fs');

exports.getIconList = function(req, res){
    var iconList = new Array();

    var path = __dirname + "/../../public/img/icon";

    fs.realpath(path, function(err, path) {
        if (err) {
            console.log(err);
            res.send('error');
        }
        else{
            fs.readdir(path, function(err, files) {
                if (err){
                    console.log(err);
                    res.send('error');
                }else {
                    files.forEach(function (f) {
                        iconList.push({name: f, source: "../img/icon/" + f});
                    });
                    res.send(iconList);
                }
            });
        }
    });
};
exports.addFile = function(req, res){
    var filePath = "../upload/" + req.files.userFile.name;
    if(req.files.userFile.mimetype === 'application/pdf'){
        var fileIcon = "../img/pdf.png";
    }
    else if(req.files.userFile.mimetype.indexOf('image') > -1){
        var fileIcon = filePath;
    }
    else{
        var fileIcon = "../img/file.png";
    }
    res.send({path: filePath, icon: fileIcon});
    res.end(200);
};
