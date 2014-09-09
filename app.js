
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
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
app.use(session({secret: '1234567890INDMUSIC'}));
app.use(express.static(path.join(__dirname, 'public')));


// development only
/*if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}*/


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

//http://localhost:3000/auth/callback

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://ec2-54-84-17-96.compute-1.amazonaws.com:3000/auth/callback"
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


app.get('/', routes.index);
app.get('/login', routes.login)
app.get('/dashboard', routes.dashboard)

//*************AUTH AND CALLBACK SECTION
app.get('/auth',
    passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/yt-analytics.readonly', 'https://www.googleapis.com/auth/yt-analytics-monetary.readonly', 'https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/youtubepartner', 'https://www.googleapis.com/auth/analytics', 'https://www.googleapis.com/auth/analytics.edit', 'https://www.googleapis.com/auth/analytics.readonly', 'https://www.googleapis.com/auth/plus.me', 'https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email','https://www.googleapis.com/auth/drive','https://www.googleapis.com/auth/drive.file','https://www.googleapis.com/auth/drive.readonly','https://www.googleapis.com/auth/drive.metadata.readonly','https://www.googleapis.com/auth/drive.appdata','https://www.googleapis.com/auth/drive.apps.readonly'],
                                     accessType:'offline', approvalPrompt:'force'})
);

app.get('/auth/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/report');
    }

);
//*************AUTH AND CALLBACK SECTION END

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

app.put('/register', function(req,res){
    console.log(req.body);
    res.setHeader("Content-Type", "text/html");
    reports.signup(req.body.email,req.body.name, function(err,response){
        if(err){console.log(err)}
        res.send({message:"Thank you, we will add your account shortly..."})
    })
    
})

app.get('/signup', signupAsk, routes.signup);

//****************INSERTED THE ENSUREAUTHENTICATION PIECE HERE IN FRONT OF THE REPORT VIEW - WORKS AS USUAL 
app.get('/report', ensureAuthenticated,ensureApproved,routes.reports);
app.get('/partials/:name', routes.partials);
app.get('*', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
      return next(); 
  
  }
  res.redirect('/login')
}

function ensureApproved(req, res, next){
    console.log('in ensure approved')
    //console.log(req.user[0].profile)
    auth.auth(req.user[0].profile._json.email,function(err,data){
          console.log(data)
          if(data === true){
              return next();
          }
          else{
              console.log('not approved');
              //res.cookie()
              res.redirect('/signup');
          }
      })
}

function signupAsk(req,res,next){
    console.log(req.user[0].profile.id)
    console.log('in the signup ask')
    return next();
}
