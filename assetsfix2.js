var async = require('async');
var mongodb = require('mongodb');
var request = require('request');
var csv = require('ya-csv')
var MongoClient = mongodb.MongoClient;
var counter = 0;
var chancount;
var lastMonth = process.argv[2];
var silo = [];
var Server = require('mongodb').Server;
var tokenget = require('./servicekeybp/app.js')
var token;
var MONGOHQ_URL="mongodb://indmusic:247MCNetwork@candidate.19.mongolayer.com:10190,candidate.18.mongolayer.com:10190/INDMUSIC/?replicaSet=set-5373e23c687705ee6c001ef5";

var videos = [
"WbOcLYw4l8c",
"9Ft28msujLw",
"RzmDbD38t-w",
"XOqKrsGGPy0",
"XPsF6O8hlb4",
"oNdVx5lyr2Y",
"RzmDbD38t-w",
"E79KEMTK5bQ",
"9Ft28msujLw",
"oNdVx5lyr2Y",
"s0KKcNCHD1c"
]

MongoClient.connect(MONGOHQ_URL, function(err, db){
    
    //for(i in videos){
        //console.log(i)
        db.collection('Reports-December').update({contentType:"UGC",notes:"TUNECORE2"},{$set:{notes:"TUNECORE"}},{multi:true},function(err,res){
            
            console.log(err,res)
            
        })
    //}
    
    
    
})