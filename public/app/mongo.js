var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var Server = require('mongodb').Server;
var spawn = require('child_process').spawn;
    /*mongoexport = spawn('mongoexport', [
        '--host candidate.19.mongolayer.com',
        '--port 10190', 
        '-u indmusic',
        '-p 247MCNetwork',
        '-db INDMUSIC',
        '-c Reports-July',
        '-q \'{notes:"TUNECORE"}\'',
        '--out output.csv',
        '--csv',
        '--fields videoId,claimType,claimOrigin,assetTitle,contentType,assetType,artist,album,isrc,customId,writer,channel,tViews,adViews,tEarnings'
    ])*/
var MONGOHQ_URL="mongodb://indmusic:247MCNetwork@candidate.19.mongolayer.com:10190,candidate.18.mongolayer.com:10190/INDMUSIC/?replicaSet=set-5373e23c687705ee6c001ef5";

MongoClient.connect(MONGOHQ_URL, function(err, db){
    
    //NEED TO WORK OUT THIS EXPORT UTILITY
    /*exports.dl = function(request,month,cb){
        console.log("in the dl")
        mongoexport.stdout.on('data', function(data){
            console.log(data);
        })
        mongoexport.stdout.on('end', function(){
            console.log("finished export")
            return cb(null,"done");
        })
    }*/
    exports.queryNotes= function(request,month,cb){
        console.log("executing notes search...");
        
        db.collection('Reports-'+month).aggregate(
            {$match:{'notes':{$in:[request]}}},
           // {$match:{'customId':{$in:[element.customId[0]]}}},
            {
                $group: {
                    //_id: "$notes",
                    _id: {notes:"$notes",contentType:"$contentType",month:"$month"},
                    earnings: {$sum: "$tEarnings"},
                    views: {$sum: "$tViews"},
                    adViews: {$sum: "$adViews"}
                }}, function(err,result){
                        var comb = {month:month};
                        var counter = 0;
                
                        console.log(result);
                        result.map(function(element){
                            comb.name = element._id.notes;
                            if(element._id.contentType == "UGC"){
                                counter++
                                comb.ugcEarnings = element.earnings;
                                comb.ugcViews = element.views;
                                comb.ugcAdViews = element.adViews;
                                console.log(counter);
                                if(counter == result.length){
                                    console.log("sending data to page...");
                                    return cb(null,comb)
                                }
                            }
                            else if(element._id.contentType == "PARTNER-PROVIDED"){
                                counter++
                                comb.partEarnings = element.earnings;
                                comb.partViews = element.views;
                                comb.partAdViews = element.adViews;
                                if(counter == result.length){
                                    console.log("sending data to page...");
                                    return cb(null,comb)
                                }
                            }
                            else{
                                counter++;
                                if(counter == result.length){
                                    console.log("sending data to page...");
                                    return cb(null,comb)
                                }
                            }
                            
                        })
                
                    }
        )
    }
    exports.query = function(request,month,cb){
        console.log("executing query...")
        
        //INSERT THE AGGREGATOR
        db.collection('Reports-'+month).aggregate(
            {$match:{'customId':{$in:[request]}}},
           // {$match:{'customId':{$in:[element.customId[0]]}}},
            {
                $group: {
                    //_id: "$notes",
                    _id: {customId:"$customId",contentType:"$contentType",month:"$month"},
                    earnings: {$sum: "$tEarnings"},
                    views: {$sum: "$tViews"},
                    adViews: {$sum: "$adViews"}
                }}, function(err,result){
                        var comb = {month:month};
                        var counter = 0;
                
                        console.log(result);
                        result.map(function(element){
                            comb.name = element._id.customId;
                            if(element._id.contentType == "UGC"){
                                counter++
                                comb.ugcEarnings = element.earnings;
                                comb.ugcViews = element.views;
                                comb.ugcAdViews = element.adViews;
                                console.log(counter);
                                if(counter == result.length){
                                    console.log("sending data to page...");
                                    return cb(null,comb)
                                }
                            }
                            else if(element._id.contentType == "PARTNER-PROVIDED"){
                                counter++
                                comb.partEarnings = element.earnings;
                                comb.partViews = element.views;
                                comb.partAdViews = element.adViews;
                                if(counter == result.length){
                                    console.log("sending data to page...");
                                    return cb(null,comb)
                                }
                            }
                            else{
                                counter++;
                                if(counter == result.length){
                                    console.log("sending data to page...");
                                    return cb(null,comb)
                                }
                            }
                            
                        })
                
                    }
        )
    }
})