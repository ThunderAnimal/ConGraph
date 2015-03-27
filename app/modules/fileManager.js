/**
 * Created by martin_w on 24.03.2015.
 */
var fs = require('fs');

exports.getIconList = function(req, res){
    var iconList = new Array();
    var path = __dirname + "/public/img/icon"
    fs.realpath(path, function(err, path) {
        if (err) {
            console.log(err);
            res.send('error');
        }
        else{
            console.log('Path is : ' + path);
            fs.readdir(path, function(err, files) {
                if (err){
                    console.log(err);
                    res.send('error');
                }else {
                    files.forEach(function (f) {
                        iconList.push({name: f, source: "../img/icon/" + f});
                        console.log('Files: ' + f);
                    });
                    res.send(iconList);
                }
            });
        }
    });
};
exports.addFile = function(req, res){

};
