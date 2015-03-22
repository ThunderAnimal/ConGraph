/**
 * Created by martin_w on 03.03.2015.
 */

var mongoose = require('mongoose');

//--- Schema
var dashboardSchema = mongoose.Schema({
    name: String,
    panels:[
        {
            name: String,
            beschreibung: String,
            attachment: Object,
            link: String,
            color: String,
            img: String,
            col: Number,
            row: Number,
            size_x: Number,
            size_y: Number
        }
    ]
});

//Create Model and Expose
module.exports = mongoose.model('Dashboard', dashboardSchema);