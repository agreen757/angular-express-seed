
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    path = require('path'),
    reports = require('./public/app/mongo.js');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bodyParser());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

//PASSPORT INSERT BEGIN
var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GOOGLE_CLIENT_ID = "468772544188.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "LufQkK0YPcHbKetle54m8p2I";
var auth = require('./public/app/mongo.js');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...                                                                    
    process.nextTick(function (){

      // Changing this to return the accessToken instead of the profile information                                
        console.log(profile.displayName);                                                                        
        
      return done(null, [{token:accessToken,rToken:refreshToken,'profile':profile}]);
    });
  }
));
//PASSPORT INSERT BEGIN

// development only
/*if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}*/

app.get('/', routes.index);
app.put('/query', function(req,res){
    console.log(req.body)
    res.setHeader("Content-Type", "text/html");
    reports.query(req.body.name,req.body.month, function(err,response){
        //console.log(err,response);
        res.send({data:response});
    })
})
app.post('/download', function(req,res){
    console.log(req.body)
    //res.setHeader("Content-Type", "text/html");
    res.download(__dirname +'/'+ req.body.file+'.csv', function(err){
        if(err){console.log(err)}
    })
})
app.put('/queryNotes', function(req,res){
    console.log(req.body);
    res.setHeader("Content-Type", "text/html");
    reports.queryNotes(req.body.name,req.body.month, function(err,response){
        res.send({data:response});  
    })
})
app.put('/export', function(req,res){
    console.log(req.body);
    res.setHeader("Content-Type", "text/html");
    reports.dl(req.body.name,req.body.month, function(err,response){
        res.send({data:"got it"})
    })
})
app.get('/report', routes.reports);
app.get('/partials/:name', routes.partials);
app.get('*', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
