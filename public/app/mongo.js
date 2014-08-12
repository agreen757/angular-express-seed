var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var Server = require('mongodb').Server;
var MONGOHQ_URL="mongodb://indmusic:247MCNetwork@candidate.19.mongolayer.com:10190,candidate.18.mongolayer.com:10190/INDMUSIC/?replicaSet=set-5373e23c687705ee6c001ef5";

MongoClient.connect(MONGOHQ_URL, function(err, db){
    exports.query = function(request,cb){
        console.log("executing query...")
        
        //INSERT THE AGGREGATOR
        db.collection('Reports-July').aggregate(
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
                        var comb = {};
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
        
        /*db.collection('Reports-July').find({customId:request}).toArray(function(err,documents){
            console.log("sending data to page...");
            return cb(null,documents)
        })*/
    }
})