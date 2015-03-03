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
            x: Number,
            y: Number
            
        }
    ]
});

//Create Model and Expose
module.exports = mongoose.model('Dashboard', dashboardSchema);