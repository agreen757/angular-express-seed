//Fix the assets in our DB

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

MongoClient.connect(MONGOHQ_URL, function(err, db){
    
    async.series([
        function(cb){
          tokenget.getToken(function(err,data){
            token = data;
            cb()
          })  
        },/*
        function(cb){
            eraser(cb)
        },*/
        function(cb){
            requester(cb)
        }
    ])
    
    function eraser(cb){
        console.log('in eraser, working...')
        db.collection('assets').update({notes:"TUNECORE"},{$set:{notes:""}},{multi:true},function(err,res){
            if(!err){
                console.log('done erasing')
                cb()
            }
            else{
                throw err
            }
        })
    }
    
    function pusher(cb){
        var reader = csv.createCsvFileReader('asexport.csv', {columnsFromHeader:true,'separator': ','});
        
        reader.addListener('data', function(i){
            db.collection('assets').update({assetId:i['Asset ID']}, {$set:{notes:"TUNECORE"}}, function(err,res){
                console.log('updated ',i['Asset ID'])
            })
        })
        reader.addListener('end', function(){
            cb()
        })
    }
    
    function requester(cb){
        var reader = csv.createCsvFileReader('asexport.csv', {columnsFromHeader:true,'separator': ','});
        
        reader.addListener('data', function(i){
            
            var url = 'https://www.googleapis.com/youtube/partner/v1/assets/'+i['Asset ID']+'?onBehalfOfContentOwner=indmusic&fetchMetadata=mine&access_token='+token;
            request.get(url, function(err,response,body){
                var parse = JSON.parse(body);
                //console.log(parse)
                
                if(parse.metadataMine && parse.metadataMine.notes){
                    //console.log(parse.metadataMine.notes,parse.id)  
                    var id = parse.id;
                    var notes = parse.metadataMine.notes;
                    db.collection('assets').update({assetId:id},{$set:{notes:notes}},{upsert:true}, function(err,res){
                        console.log('updated ',id,notes,' ',res);
                    })
                }
            })
            
        })
        
        
        
    }
    
})