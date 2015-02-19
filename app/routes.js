/**
 * Created by martin_w on 18.02.2015.
 */

// app/routes.js
module.exports = function(app){

    // =====================================
    // Start ===============================
    // =====================================
    app.get('/', function(req, res){
        //direct to page
        res.render('login', {title: 'ConGraph - Login'});
    });

    // =====================================
    // Login  ==============================
    // =====================================
    app.get('/login', function(req, res){
        res.render('login', {title: 'ConGraph - Login'});
    });

    //Send Regstrie Mail
    app.post('/sendRegistMail', function(req, rs){
        mail.sendRegistMail(req,rs);
    });

    //Send Forgot PW Mail
    app.post('/sendForgotPWMail', function(req, rs){
        mail.sendForgotPWMail(req,rs);
    });

    // =====================================
    // Start ===============================
    // =====================================
    app.get('/home', isLoggedIn, function(req, res){
        //direct to page
        res.sendFile(__dirname + '/public/page/home.html');
    });

    //New User
    app.post('/newUser', function(req, rs){
        user.addUser(req,rs);
    });
};
function isLoggedIn(req, res, next){

    //check if user is authenticated in session
    //if(req.isAuthenticated())
    //    return next():

    //If not login --> redirect to home page
    res.redirect('/');
}