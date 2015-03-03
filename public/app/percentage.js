

module.exports = function(cb){
    var GoogleSpreadsheet = require('google-spreadsheet');
    var apiKey = "AIzaSyCoo6vxC4Gq5-IPrJ2xWpv9RCtBfndy4Y4";
    var sheetkey = '1532cmmO7FYH69em2bzEvxaDOvpmgUEZGOgoAr6uPctQ';
    //return cb(null,'got it')
    
    var mysheet = new GoogleSpreadsheet('1532cmmO7FYH69em2bzEvxaDOvpmgUEZGOgoAr6uPctQ')
    mysheet.setAuth('adrian@indmusicnetwork.com','ImWithJessica',function(err){
        mysheet.getRows(1,function(e,data){
            //consoe.log('2')
            /*data.map(function(d,i){
                console.log(d)
                if(i == data.length - 1){
                    return cb(null,'got it')
                }
            })*/
            //console.log(data)
            return cb(null,data)
        })
    })
}