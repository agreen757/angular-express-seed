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
                            var ugcType = element._id.contentType
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
                            if(element._id.contentType == "UGC"){
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
    
    function scwriter(silo,cb){
        
        var plays = silo.plays,
            rev = silo.revenue,
            name = silo.name,
            month = silo.month,
            cpm = rev / plays,
            indfee = rev * .2,
            finalrev = rev - indfee;
        
        fs.writeFile(silo.name+'.csv', "INDMusic SoundCloud Report"+"\n"+month+" 2014"+"\n"+name+"\n"
                                  +"\n"
                                  +"Total Plays are: "+plays+"\n"
                                  +"Total  Revenue is: "+rev+"\n"
                                  +"Per Stream Revenue: "+cpm+"\n"
                                  +"InDMusic Fee is: "+indfee+"\n"
                                  +"\n"
                                  +"Total Partner Payout: "+finalrev+"\n"
                                  +"\n", function(err){
            if(err){console.log(err)}
                                      console.log('done in writer')
            return cb(null,"finished");
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
    
    function scexporter(silo,cb){
        var outstring = "mongoexport --host candidate.19.mongolayer.com --port 10190 -u indmusic -p 247MCNetwork -db INDMUSIC -c sc"+silo.month+"14 -q '{accountName:\""+silo.name+"\"}' --csv --fields trackId,label,trackName,album,artist,isrc,plays,revenue >>  "+silo.name+".csv";
        
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
                    console.log(docs);
                    if(docs.approved == "yes"){
                        //console.log(docs);
                        return cb(null,true);
                    }
                    else if(docs.approved == "pending" || !docs.approved){
                        return cb(null,false);
                    }   
                }
                else{
                    return cb(null,false);
                }
            })   
        //}
        
    }
    
    exports.hotness = function(months,cb){
        console.log('in the months');
        //console.log(typeof months)
        var month = months.split(',');
        
        //*************GET CHANNEL CHANNEL PERFORMANCE INFO FOR THE PAST THREE MONTHS
        db.collection('Reports-Channel-Final').find({channel:"9LILG",month:{$in:[month[0],month[1],month[2]]}}).toArray(function(err,res){
            //console.log(res);
            var data = res;//**************GET THE HIGHEST PERFORMING VIDEO FOR THE CUSTOM ID
            db.collection('Reports-'+month[0]).find({customId:"9LILG"}).sort({tEarnings:-1}).limit(1).toArray(function(err,res2){
                if(err){
                    console.log(err)
                }
                db.collection('Reports-'+month[0]).find({customId:"9LILG",contentType:"UGC"}).sort({tEarnings:-1}).limit(1).toArray(function(err,res3){
                    if(err){console.log(err)}
                    
                    db.collection('Reports-'+month[0]).find({customId:"9LILG",contentType:"PARTNER-PROVIDED"}).sort({tEarnings:-1}).limit(1).toArray(function(err,res4){
                        if(err){console.log(err)}
                        
                        return cb(null,res,res2,res3,res4)
                    })
                })
                //********DO ANOTHER NESTED FIND TO GET THE TOP UGC
                //********DO ANOTHER NESTED FIND TO GET THE TOP PARTNER VIDEO
                //return cb(null,res,res2);
            })
        })
    }
    
    exports.finder = function(month,id,cb){
        console.log('in the finder');
        
        /*
        Need to fill out a database with all of the accepted client's google ids as well as their customId.
        Once we have this we can do queries just like we do on our dashboard
        */
        
        //async.series([
            //FIND THE USER BY ID 
            //function(callback){
                db.collection('users').findOne({userId:id}, function(err,docs){
                    if(!docs){
                        return cb(null,false)
                    }
                    else{
                        db.collection('Reports-'+month).aggregate(
                            {$match:{'customId':{"$regex":"^"+docs.channel+"$","$options":"i"}}},
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
            //}
        //])
    }
    
    exports.getvids = function(month,cb){
        db.collection('Reports-'+month).find({customId:"9LILG"}).toArray(function(err,docs){
            if(err){console.log(err)}
            
            return cb(null,docs)
        })
    }
    
    exports.signup = function(email,name,cb){
        console.log("in signup with "+name+" and "+email)
        db.collection('users').update({email:email},{$set:{email:email,displayName:name, approved:"pending"}},{upsert:true}, function(err,res){
                return cb(null,"updated");
            })
    }
    
    exports.scdl = function(account,month,cb){
        var newmonth = "sc"+month+"14";
        console.log('in scexport',account,month);
        var silo = {};
        async.series([
            function(callback){
                exports.scquery(account,month,function(err,data){
                    console.log(data)
                    silo.plays = data.plays;
                    silo.revenue = data.revenue;
                    silo.name = account;
                    silo.month = month;
                    callback()
                })
            },
            function(callback){
                scwriter(silo,function(err,resp){
                    if(err){console.log(err)}
                    console.log(resp)
                    callback();
                    
                })
            },
            function(callback){
                scexporter(silo,function(err,resp){
                    return cb(null,resp);
                    callback();
                })
            }
        ])
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
    exports.scquery = function(account,month,cb){
        console.log('in query',account,month);
        var newmonth = "sc"+month+"14";
        db.collection(newmonth).aggregate(
            {$match:{'accountName':{"$regex":"^"+account+"$","$options":"i"}}},
            {
                $group:{
                    _id: {account:"$accountName"},
                    revenue:{$sum: "$revenue"},
                    plays:{$sum: "$plays"}
                }}, function(err,result){
                    console.log('at end of aggr')
                    console.log(err,result);
                    return cb(null,{plays:result[0].plays,revenue:result[0].revenue})
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
                            if(element._id.contentType == "UGC"){
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