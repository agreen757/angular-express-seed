var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var Server = require('mongodb').Server;
var exec = require('child_process').exec;
var async = require('async');
var fs = require('fs');
var child;
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
    
    function queryer(name,month,cb){
        var premUgc = {};
        db.collection('Reports-'+month).aggregate(
            {$match:{'customId':{"$regex":"^"+name+"$","$options":"i"}}},
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
                
                        //console.log(result);
                        result.map(function(element){
                            comb.name = element._id.customId;
                            if(element._id.contentType == "PREMIUM UGC"){
                                counter++
                                premUgc.ugcEarnings = element.earnings;
                                premUgc.ugcViews = element.views;
                                premUgc.ugcAdViews = element.adViews;
                                console.log(counter);
                                if(counter == result.length){
                                    if(premUgc.ugcAdViews){
                                        comb.ugcAdViews+=premUgc.ugcAdViews;
                                        comb.ugcEarnings+=premUgc.ugcEarnings;
                                        comb.ugcViews+=premUgc.ugcViews;
                                        console.log("sending data to page...");
                                        return cb(null,comb)   
                                    }
                                    else{
                                        console.log("sending data to page...");
                                        return cb(null,comb)
                                    }
                                }
                            }
                            else if(element._id.contentType == "UGC"){
                                counter++
                                comb.ugcEarnings = element.earnings;
                                comb.ugcViews = element.views;
                                comb.ugcAdViews = element.adViews;
                                console.log(counter);
                                if(counter == result.length){
                                    if(premUgc.ugcAdViews){
                                        comb.ugcAdViews+=premUgc.ugcAdViews;
                                        comb.ugcEarnings+=premUgc.ugcEarnings;
                                        comb.ugcViews+=premUgc.ugcViews;
                                        console.log("sending data to page...");
                                        return cb(null,comb)   
                                    }
                                    else{
                                        console.log("sending data to page...");
                                        return cb(null,comb)
                                    }
                                }
                            }
                            else if(element._id.contentType == "PARTNER-PROVIDED"){
                                counter++
                                comb.partEarnings = element.earnings;
                                comb.partViews = element.views;
                                comb.partAdViews = element.adViews;
                                if(counter == result.length){
                                    if(premUgc.ugcAdViews){
                                        comb.ugcAdViews+=premUgc.ugcAdViews;
                                        comb.ugcEarnings+=premUgc.ugcEarnings;
                                        comb.ugcViews+=premUgc.ugcViews;
                                        console.log("sending data to page...");
                                        return cb(null,comb)   
                                    }
                                    else{
                                        console.log("sending data to page...");
                                        return cb(null,comb)
                                    }
                                }
                            }
                            else{
                                counter++;
                                if(counter == result.length){
                                    if(premUgc.ugcAdViews){
                                        comb.ugcAdViews+=premUgc.ugcAdViews;
                                        comb.ugcEarnings+=premUgc.ugcEarnings;
                                        comb.ugcViews+=premUgc.ugcViews;
                                        console.log("sending data to page...");
                                        return cb(null,comb)   
                                    }
                                    else{
                                        console.log("sending data to page...");
                                        return cb(null,comb)
                                    }
                                }
                            }
                            
                        })
                
                    }
        )
    }
    
    function writer(silo,cb){
        
        
        if(silo.partViews == null){
            var partViews = 0;
            var partRev = 0;
            var partAdViews = 0;
            var partnerCPM = "N/A"
        }
        else{
            var partViews = silo.partViews;
            var partRev = silo.partEarnings;
            var partAdViews = silo.partAdViews;
            var partTAViews = partAdViews / 1000;
            var partnerCPM = partRev / partTAViews;
        }
        
        var ugcPercentage = .1
        var partNAdViews = partViews - partAdViews;
        
        //var partnerCPM = partRev / partTAViews;
        if(partnerCPM > 5){
           var partPercentage = 2 * partnerCPM / 100;
            }
        else{
           var partPercentage = .1;
        }
        if(silo.ugcViews == null){
            var ugcViews = 0;
            var ugcRev = 0;
            var ugcAdViews = 0;

        }
        else{
            var ugcViews = silo.ugcViews;
            var ugcRev = silo.ugcEarnings;
            var ugcAdViews = silo.ugcAdViews;
        }
        var partIndFee = partPercentage * partRev;
        var partEarnings = partRev-partIndFee;
        var ugcIndFee = ugcPercentage*ugcRev;
        var ugcEarnings = ugcRev-ugcIndFee;
        var payout = partEarnings+ugcEarnings;
        
        
        fs.writeFile(silo.name+'.csv', "INDMusic Channel Report"+"\n"+silo.month+" 2014"+"\n"+silo.name+"\n"
                                  +"\n"
                                  +"Partner Views are: "+partViews+"\n"
                                  +"Non-Ad Requested Views: "+partNAdViews+"\n"
                                  +"Partner Revenue is: "+partRev+"\n"
                                  +"Partner Ad Enabled Views are: "+partAdViews+"\n"
                                  +"Partner Thousands of Ad Enabled Views: "+partTAViews+"\n"
                                  +"CPM: "+partnerCPM+"\n"
                                  +"INDMusic Percentage: "+partPercentage+"\n"
                                  +"Partner InDMusic Fee is: "+partIndFee+"\n"
                                  +"Total Partner Earnings: "+partEarnings+"\n"
                                  +"\n"
                                  +"UGC Views are: "+ugcViews+"\n"
                                  +"UGC Revenue is: "+ugcRev+"\n"
                                  +"UGC Ad Enabled Views are: "+ugcAdViews+"\n"
                                  +"UGC Thousands of Ad Enabled Views: "+ugcAdViews / 1000+"\n"
                                  +"INDMusic Percentags: "+ugcPercentage+"\n"
                                  +"UGC InDMusic Fee is: "+ugcIndFee+"\n"
                                  +"Total UGC Earnings: "+ugcEarnings+"\n"
                                  +"\n"
                                  +"Total Channel Partner Payout: "+payout+"\n"
                                  +"\n", function(err){
            if(err){console.log(err)}
                                      console.log('done in writer')
            return cb(null,"finished");
        }
                                  
                                  
        )
        
        /*var ugcPercentage = .1;
        fs.appendFile(silo.name+'.csv', "INDMusic Channel Report"+"\n"+silo.month+" 2014"+"\n"+silo.name+"\n");
        fs.appendFile(silo.name+'.csv', "\n");
        fs.appendFile(silo.name+'.csv', "Partner Views are: "+silo.partViews+"\n");
        var partNAdViews = silo.partViews - silo.partAdViews;
        fs.appendFile(silo.name+'.csv', "Non-Ad Requested Views: "+partNAdViews+"\n");
        fs.appendFile(silo.name+'.csv', "Partner Revenue is: "+silo.partEarnings+"\n");
        fs.appendFile(silo.name+'.csv', "Partner Ad Enabled Views are: "+silo.partAdViews+"\n");
        var partTAViews = silo.partAdViews / 1000;
        fs.appendFile(silo.name+'.csv', "Partner Thousands of Ad Enabled Views: "+partTAViews+"\n");
        var partnerCPM = silo.partEarnings / partTAViews;
        fs.appendFile(silo.name+'.csv',"CPM: "+partnerCPM+"\n");
        if(partnerCPM > 5){
           var partPercentage = 2 * partnerCPM / 100;
            }
        else{
           var partPercentage = .1;
        }
        if(silo.ugcViews == null){
            var ugcViews = 0;
            var ugcRev = 0;
            var ugcAdViews = 0;

        }
        else{
            var ugcViews = silo.ugcViews;
            var ugcRev = silo.ugcEarnings;
            var ugcAdViews = silo.ugcAdViews;
        }
        fs.appendFile(silo.name+'.csv',"INDMusic Percentage: "+partPercentage+"\n");
        var partIndFee = partPercentage * silo.partEarnings;
        fs.appendFile(silo.name+'.csv', "Partner InDMusic Fee is: "+partIndFee+"\n");
        var partEarnings = silo.partEarnings-partIndFee;
        fs.appendFile(silo.name+'.csv', "Total Partner Earnings: "+partEarnings+"\n");
        fs.appendFile(silo.name+'.csv',"\n");
        fs.appendFile(silo.name+'.csv',"UGC Views are: "+ugcViews+"\n");
        fs.appendFile(silo.name+'.csv',"UGC Revenue is: "+ugcRev+"\n");    
        fs.appendFile(silo.name+'.csv',"UGC Ad Enabled Views are: "+ugcAdViews+"\n");
        fs.appendFile(silo.name+'.csv',"UGC Thousands of Ad Enabled Views: "+ugcAdViews / 1000+"\n");
        fs.appendFile(silo.name+'.csv',"INDMusic Percentags: "+ugcPercentage+"\n");
        var ugcIndFee = ugcPercentage*ugcRev;
        fs.appendFile(silo.name+'.csv',"UGC InDMusic Fee is: "+ugcIndFee+"\n");
        var ugcEarnings = ugcRev-ugcIndFee;
        fs.appendFile(silo.name+'.csv', "Total UGC Earnings: "+ugcEarnings+"\n");
        fs.appendFile(silo.name+'.csv',"\n");
        var payout = partEarnings+ugcEarnings;
        fs.appendFile(silo.name+'.csv', "Total Channel Partner Payout: "+payout+"\n");
        fs.appendFile(silo.name+'.csv',"\n");
        //fs.appendFile(silo.name+'.csv',"Video ID,Claim Type,Claim Origin,Asset Title,Content Type,Asset Type,Artist,Album,ISRC,Custom ID,Total Views,Ad Enabled Views,Total Earnings"+"\n"); 
        return cb(null,"finished");*/
    }
    
    function exporter(silo,cb){
        var outstring = "mongoexport --host candidate.19.mongolayer.com --port 10190 -u indmusic -p 247MCNetwork -db INDMUSIC -c Reports-"+silo.month+" -q '{customId:\""+silo.name+"\"}' --csv --fields videoId,claimType,claimOrigin,assetTitle,contentType,assetType,artist,album,isrc,customId,writer,channel,tViews,adViews,tEarnings >>  "+silo.name+".csv";
        
        child = exec(outstring, function(error,stdout,stderr){
            console.log('doing something')
            console.log("stdout: "+stdout);
            return cb(null, stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        })
    }
    
    exports.auth = function(email,cb){
        //console.log(id)
        //var k = function(){
            db.collection('users').findOne({email:email}, function(err,docs){
                //console.log(docs);
                if(docs){
                    if(docs.approved){
                        //console.log(docs);
                        return cb(null,true);
                    }
                    else if(!docs.approved){
                        return cb(null,false);
                    }   
                }
                else{
                    return cb(null,false);
                }
            })   
        //}
        
    }
    
    exports.signup = function(email,cb){
        db.collection('users').update({email:email},{$set:{email:email}},{upsert:true}, function(err,res){
                return cb(null,"updated");
            })
    }
    
    exports.dl = function(request,month,cb){
        silo = {};
        
        
        console.log("in the export");
        async.series([
            function(callback){
                queryer(request,month,function(err,data){
                    console.log(data);
                    silo.name = data.name;
                    silo.partEarnings = data.partEarnings;
                    silo.partAdViews = data.partAdViews;
                    silo.partViews = data.partViews;
                    silo.ugcViews = data.ugcViews;
                    silo.ugcAdViews = data.ugcAdViews;
                    silo.ugcEarnings = data.ugcEarnings;
                    silo.month = data.month;
                    callback();
                })
            },
            function(callback){
                writer(silo, function(err,resp){
                    console.log(resp);
                    callback();
                })
            },
            function(callback){
                exporter(silo, function(err,resp){
                    return cb(null,resp);
                    callback();
                })
            }
        ])
        
        /*
        var outstring = "mongoexport --host candidate.19.mongolayer.com --port 10190 -u indmusic -p 247MCNetwork -db INDMUSIC -c Reports-"+month+" -q '{customId:\""+request+"\"}' --csv --fields videoId,claimType,claimOrigin,assetTitle,contentType,assetType,artist,album,isrc,customId,writer,channel,tViews,adViews,tEarnings >>  "+request+".csv";
        
        child = exec(outstring, function(error,stdout,stderr){
            console.log('doing something')
            console.log("stdout: "+stdout);
            return cb(null, stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        })*/
        
        
    }
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
        var premUgc = {}; 
        //INSERT THE AGGREGATOR
        db.collection('Reports-'+month).aggregate(
            {$match:{'customId':{"$regex":"^"+request+"$","$options":"i"}}},
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
                            if(element._id.contentType == "PREMIUM UGC"){
                                counter++
                                premUgc.ugcEarnings = element.earnings;
                                premUgc.ugcViews = element.views;
                                premUgc.ugcAdViews = element.adViews;
                                console.log(counter);
                                if(counter == result.length){
                                    if(premUgc.ugcAdViews){
                                        comb.ugcAdViews+=premUgc.ugcAdViews;
                                        comb.ugcEarnings+=premUgc.ugcEarnings;
                                        comb.ugcViews+=premUgc.ugcViews;
                                        console.log("sending data to page...");
                                        return cb(null,comb)   
                                    }
                                    else{
                                        console.log("sending data to page...");
                                        return cb(null,comb)
                                    }
                                }
                            }
                            else if(element._id.contentType == "UGC"){
                                counter++
                                comb.ugcEarnings = element.earnings;
                                comb.ugcViews = element.views;
                                comb.ugcAdViews = element.adViews;
                                console.log(counter);
                                if(counter == result.length){
                                    if(premUgc.ugcAdViews){
                                        comb.ugcAdViews+=premUgc.ugcAdViews;
                                        comb.ugcEarnings+=premUgc.ugcEarnings;
                                        comb.ugcViews+=premUgc.ugcViews;
                                        console.log("sending data to page...");
                                        return cb(null,comb)   
                                    }
                                    else{
                                        console.log("sending data to page...");
                                        return cb(null,comb)
                                    }
                                }
                            }
                            else if(element._id.contentType == "PARTNER-PROVIDED"){
                                counter++
                                comb.partEarnings = element.earnings;
                                comb.partViews = element.views;
                                comb.partAdViews = element.adViews;
                                if(counter == result.length){
                                    if(premUgc.ugcAdViews){
                                        comb.ugcAdViews+=premUgc.ugcAdViews;
                                        comb.ugcEarnings+=premUgc.ugcEarnings;
                                        comb.ugcViews+=premUgc.ugcViews;
                                        console.log("sending data to page...");
                                        return cb(null,comb)   
                                    }
                                    else{
                                        console.log("sending data to page...");
                                        return cb(null,comb)
                                    }
                                }
                            }
                            else{
                                counter++;
                                if(counter == result.length){
                                    if(premUgc.ugcAdViews){
                                        comb.ugcAdViews+=premUgc.ugcAdViews;
                                        comb.ugcEarnings+=premUgc.ugcEarnings;
                                        comb.ugcViews+=premUgc.ugcViews;
                                        console.log("sending data to page...");
                                        return cb(null,comb)   
                                    }
                                    else{
                                        console.log("sending data to page...");
                                        return cb(null,comb)
                                    }
                                }
                            }
                            
                        })
                
                    }
        )
    }
})