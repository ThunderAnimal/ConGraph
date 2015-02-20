/**
 * Created by martin_w on 18.02.2015.
 */
var mail = require('../app//modules/mail.js');
var login = require('../app/modules/login.js');
var session;
// app/routes.js
module.exports = function(app){

    // =====================================
    // Start ===============================
    // =====================================
    app.get('/', isLoggedIn , function(req, res){
        //direct to page
        res.render('home');
    });

    // =====================================
    // Login  ==============================
    // =====================================
    app.get('/login', function(req, res){
        res.render('login');
    });
    app.post('/login', function(req, res){
       login.checkLogin(req,res,session);
    });

    //Send Regstrie Mail
    app.post('/sendRegistMail', function(req, rs){
        mail.sendRegistMail(req,rs);
    });

    //Send Forgot PW Mail
    app.post('/sendForgotPWMail', function(req, rs){
        mail.sendForgotPWMail(req,rs);
    });

    //New User
    app.post('/newUser', function(req, rs){
        user.addUser(req,rs);
    });

    // =====================================
    // HOME= ===============================
    // =====================================
    app.get('/home', isLoggedIn, function(req, res){
        //direct to page
        res.render('home');
    });

    app.post('/logout', isLoggedIn)


};
function isLoggedIn(req, res, next){
    session = req.session;
    //check if user is authenticated in session
    if(session.login)
        return next();

    //If not login --> redirect to home page
    res.redirect('/login');
}