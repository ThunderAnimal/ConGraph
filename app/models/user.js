/**
 * Created by martin_w on 18.02.2015.
 */

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

//--- Schema
var userSchema = mongoose.Schema({
    email: String,
    name: String,
    pw: String,
    aktiv: Boolean
});

//--- Methods
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};


//--- Create Model and Expose
module.exports = mongoose.model('User', userSchema);

//exports.addUser = function(req, rs){

//    });
//}