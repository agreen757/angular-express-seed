
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
