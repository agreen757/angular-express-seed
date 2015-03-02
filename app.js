
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
    request = require('request'),
    reports = require('./public/app/mongo.js'),
    csv = require('ya-csv'),
    async = require('async'),
    ddex = require('./public/app/ddex.js');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.bodyParser({limit: '5000mb'}));
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
//http://ec2-54-84-17-96.compute-1.amazonaws.com:3000

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    //callbackURL: "http://ec2-54-84-17-96.compute-1.amazonaws.com:3000/auth/callback"
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


app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/dashboard',routes.dashboard);
app.get('/getId', function(req,res){
    if(req.user){
       res.send(req.user[0].profile._json.id) 
    }
    
})

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

app.put('/getMonths', function(req,res){
    var months = req.body.months
    //var user = req.user[0].
    console.log(req.body.months+" in app.js")
    var b = 0;
    var c = setTimeout(function(){
        reports.hotness(months.toString(),function(err,gdata,topdata,ugcdata,partdata){
            //console.log(topdata)
            res.send({gdata:gdata,topdata:topdata,ugcdata:ugcdata,partdata:partdata})
    })  
    },b+=2000)
})

app.put('/getvids', function(req,res){
    var month = req.body.month
    console.log('in getvids with '+month)
    reports.getvids(month,function(err,data){
        //console.log(data)
        res.send(data);
    })
})

app.put('/query', function(req,res){
    console.log(req.body)
    res.setHeader("Content-Type", "text/html");
    reports.query(req.body.name,req.body.month, function(err,response){
        //console.log(err,response);
        res.send({data:response});
    })
})

app.put('/scquery', function(req,res){
    console.log(req.body);
    //res.send('in app');
    var account = req.body.account;
    var month = req.body.month;
    var year = req.body.year
    reports.scquery(account,month,year, function(err,response){
        res.send({data:response})
    })
})

app.put('/pubquery', function(req,res){
    var query = req.body;
    reports.pubquery(query, function(err,resp){
        res.send({err:err,resp:resp})
    })
})

app.post('/ddexdownload', function(req,res){
    console.log(req.body);
    if(req.body){
        var foo = req.body.file.split('.');
        var name = foo[0]
        console.log(name+'.xml')
        res.download(__dirname +'/'+ name+'.xml', function(err){
            if(err){console.log(err)}
        })   
    }
})

app.post('/download', function(req,res){
    console.log(req.body)
    //res.setHeader("Content-Type", "text/html");
    res.download(__dirname +'/'+ req.body.file+'.csv', function(err){
        if(err){console.log(err)}
    })
})
app.post('/metaParse', function(req,res){
    //console.log(req.files);
    var file = req.files.uploadmeta.name;
    var path = req.files.uploadmeta.ws.path
    res.send({name:file,path:path});
    
})
app.put('/makeddex', function(req,res){
    var reader = csv.createCsvFileReader(req.body.meta.path, {columnsFromHeader:true,'separator': ','});
    //************************************
    //SEND ALL OF THIS METADATA OVER TO THE DDEX GENERATION MODULE
    //**************************************
    
    
    ddex.soundcloud(req.body.meta,req.body.files,function(err,data){
        if(err){console.log(err)};
        
        console.log(data);
        res.send(data);
    })
    
    
    /*
    OKAY THIS MAY BE A BIT OF A THING
    
    WE NEED TO GET THE READ THE UPLOADED CSV FILE AND FOR EVERY 'FILENAME' WE ARE GOING TO HAVE TO SEARCH THE FILES ARRAY FOR THE PATH
    
    RIGHT HERE, WE WILL MOST LIKELY USE AN EXTERNAL MODULE BULT FROM OUR EXISTING SOUNDCLOUD_DDEX.JS FILE
    */
})
app.post('/fileUpload', function(req,res){
    
    //*******************************
    //********HOW WE ARE ROCKING THIS SHIT****************
    /*
    WE ARE GETTING THE FILES AND NAME DIRECLTY FROM THE FORM VIA RES.FILES
    
    THIS SURPRISINGLY WORKS AND IS PROBABLY ANOTHER REASON WHY WE CANT UPGRADE EXPRESS
    
    WE CAN GET THE FILES DIRECLTY FROM THE HTML USING THE new FormData() FUNCTION THATS ON THE HTML PRESENTLY
    
    THIS LET US GET AROUND USING SOCKET.IO OR ANOTHER ONE OF THOSE JANKY AS FUCK ANGULAR UPLOAD FUNCTIONS 
    
    SO THIS MAKES OUR NEW APP A HYBRID EVEN MORESO
    */
    //**********************************
    
    console.log(req.files);
    /*var file = req.files.uploadfile.name;
    var path = req.files.uploadfile.ws.path;*/
    
    //send the two variables to the page to be stored in client-side variables
    res.send({name:req.files})
    
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

app.put('/scexport', function(req,res){
    console.log(req.body);
    shim = req.body
    reports.scdl(shim.account,shim.month,shim.year, function(err,response){
        res.send({data:"got it"})
    })
})

app.put('/pubexport', function(req,res){
    var pub = req.body
    reports.pubexport(pub, function(err,resp){
        console.log('back in app from pub writer')
        
        if(!err){
            res.send('ready')
        }
        else{
            res.send('there was an error')
        }
    })
})

//*************************************************************************
//*************************MAP SECTION************************************

app.get('/map',ensureAuthenticated,ensureApproved,function(req,res){
    res.render('map')
})

app.put('/demographInfo',function(req,res){
    console.log(req.body);
    if(req.body.usa){
        console.log(req.body.id);
        request.get('https://www.googleapis.com/youtube/analytics/v1/reports?ids=contentOwner%3D%3DkrCThOPEJqqsS2LErhc1JQ&start-date=2014-05-01&end-date=2014-09-30&metrics=views&dimensions=province&filters=channel%3D%3D'+req.body.id+'%3Bcountry%3D%3DUS&access_token='+req._passport.session.user[0].token, function(err,response,body){
        console.log(body);
        var parsed = JSON.parse(body);
        res.send(parsed);
    })
    }
    else if(req.body.world){
        //******************************************FINISH THIS REQUEST FOR GLOBAL VIEWS
        request.get('https://www.googleapis.com/youtube/analytics/v1/reports?ids=contentOwner%3D%3DkrCThOPEJqqsS2LErhc1JQ&start-date=2014-05-01&end-date=2014-06-30&metrics=views%2CestimatedMinutesWatched%2CaverageViewDuration%2CaverageViewPercentage%2Cearnings%2CgrossRevenue&dimensions=country&filters=channel%3D%3D'+req.body.id+'&sort=-estimatedMinutesWatched&access_token='+req._passport.session.user[0].token, function(err,response,body){
            console.log(body);
            var parsed = JSON.parse(body);
            res.send(parsed)
        })
    }
    else{
    //res.send('something')
    //console.log('')
        request.get('https://www.googleapis.com/youtube/analytics/v1/reports?ids=contentOwner%3D%3DkrCThOPEJqqsS2LErhc1JQ&start-date=2014-05-01&end-date=2014-09-30&metrics=views&dimensions=province&filters=channel%3D%3DUC4cCjKsLJiYTZFnhROl7Ihg%3Bcountry%3D%3DUS&access_token='+req._passport.session.user[0].token, function(err,response,body){
            console.log(body);
            var parsed = JSON.parse(body);
            res.send(parsed);
        })
    }
})

//*************************************************************************
//*************************************************************************

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
//app.get('/report', routes.reports);
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
