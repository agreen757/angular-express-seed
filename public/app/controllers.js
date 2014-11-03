var controllers = angular.module('myapp.controllers', ['googlechart','ui.bootstrap']);

controllers.controller('ddex', ['$scope','$http', function($scope,$http){
    $scope.message = "Yo son"
    
    var uploadFile = function(file) {
 
        var formData = new FormData();
        formData.append('file', file);

        $http({
            method: 'post',
            url: '/fileUpload',
            data: formData,
            headers: { 'Content-Type': undefined },
            transformRequest: function(data) { return data; }
        })
        .success(function(data){
            console.log(data);
        })
        .error(function(err){
            console.log(err);
        });
    }
    
}])

controllers.controller('IndexController', ['$scope', function($scope) {
    $scope.message = 'DDEX METADATA TEMPLATE';
    $scope.name = 'bob';
    $scope.info = [];
    $scope.save = function(file){
        if($scope.metadata.$valid){
            $scope.info.push({filename:$scope.metadata.filename.$modelValue,type:$scope.metadata.type.$modelValue,isrc:$scope.metadata.isrc.$modelValue});
            $scope.reset();
        }
    }
    
    $scope.reset = function() {
        $scope.metadata.filename.$modelValue = '';
        $scope.metadata.type.$modelValue = '';
        $scope.metadata.isrc.$modelValue = '';
    }
    
}]);
var globalname;
controllers.controller('AnotherController', ['$scope', function($scope) {
    $scope.message = 'Another Page';
    //$scope.name = 'bob';
}]);

controllers.controller('dashboard', ['$scope','$http', function($scope,$http) {
    
    $scope.message = 'dashboard';
    $scope.dashstyle = "none";
    $scope.downloadstyle = "none";
    $scope.loadingstyle = "true"
    $scope.display = 'none';
    $scope.genstyle = 'none';
    var counter = 0;
    console.log('hi from controller');
    var id;
    $http.get('/getId').success(function(data,status,headers){
        /*
        *************************************************************************
        CHANGE THIS BY DOING THE FOLLOWING:
        
        IN ORDER FOR US TO GET THE NEEDED IDENTIFICATION TO THE CONTROLLER - YOU NEED TO USE THIS PUT FUNCTION TO DO A REQUEST TO OUR DB.
        THE DB WILL RETURN THE CUSTOMID FOR THE USER.
        
        SO WE WILL NEED A COLLECTION WITH THE GOOGLE ID AND MATCHING CUSTOMID
        
        FROM THE APP.JS WE WILL DO A REQUEST TO THIS COLLECTION USING THE GOOGLE ID AND WE WILL STORE THE VARIABLE HERE
        THIS VARIABLE WILL BE SENT BACK WITH THE QUERY FUNCTION BELOW.
        
        MAY WANT TO PUT AN IF STATEMENT THAT WILL ONLY DO THE REQUEST IF WE HAVE A CUSTOM ID RETRIEVED
        *************************************************************************
        */
        
        
        console.log(data);
        id = data;
    })
    
    //MONTH ARRAY
    var month = new Array();
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";

    var d = new Date();
    var n = month[d.getMonth()]; 
    
    //THIS SHOULD ALWAYS RETRIEVE THE PAST THREE MONTHS
    
    var a = month[d.getMonth()-2]
    var b = month[d.getMonth()-3]
    var c = month[d.getMonth()-4]
    
    $scope.currentMonth = a
    
    var picks = [a,b,c]
    console.log(picks)
    
    //GRAPH CHUNK*************************************************
    $http.put('/getMonths',{months:picks}).success(function(data,status,headers){
        //use the data as graph info
        console.log(data)
        
        var chart1 = {};
        chart1.type = "BarChart";
        chart1.cssStyle = "height:20.5em; ;float:left;width:100%;";
        chart1.data = {"cols": [
            {id: "month", label: "Month", type: "string"},
            {id: "ugc", label: "Partner", type: "number"},
            {id: "partner", label: "UGC", type: "number"}/*,
            {id: "server-id", label: "Server", type: "number"},
            {id: "cost-id", label: "Shipping", type: "number"}*/
        ], "rows": [
            {c: [
                {v: c},
                {v: data.gdata[2].partEarnings},
                {v: data.gdata[2].ugcEarnings}/*,
                {v: 7, f: "7 servers"},
                {v: 4}*/
            ]},
            {c: [
                {v: b},
                {v: data.gdata[1].partEarnings},
                {v: data.gdata[1].ugcEarnings, f: "Some conditional message"}/*,
                {v: 12},
                {v: 2}*/
            ]},
            {c: [
                {v: a},
                {v: data.gdata[0].partEarnings},
                {v: data.gdata[0].ugcEarnings}/*,
                {v: 11},
                {v: 6}*/

            ]}
        ]};

        chart1.options = {
            "title": "Sample chart for 9LILG",
            "isStacked": "true",
            "fill": 20,
            "displayExactValues": true,
            "vAxis": {
                "title": "Month", "gridlines": {"count": 6}
            },
            "hAxis": {
                "title": "Revenue"
            }
        };

        chart1.formatters = {};

        $scope.chart = chart1;
        $scope.partRev = data.gdata[0].partEarnings.toFixed(2);
        $scope.ugcRev = data.gdata[0].ugcEarnings.toFixed(2);
        $scope.difference = data.gdata[0].partEarnings.toFixed(2) - data.gdata[1].partEarnings.toFixed(2);
        $scope.alert = 'Your difference from last month';
        $scope.dashstyle = "true";
        $scope.loadingstyle = "none";
        $scope.topVideoName = data.topdata[0].videoTitle;
        $scope.topVideoRev = data.topdata[0].tEarnings.toFixed(2);
        $scope.topUgcName = data.ugcdata[0].videoTitle;
        $scope.topUgcRev = data.ugcdata[0].tEarnings.toFixed(2);
        $scope.topPartName = data.partdata[0].videoTitle;
        $scope.topPartRev = data.partdata[0].tEarnings.toFixed(2);
        //$scope.myInterval = 5000;
        /*var slides = $scope.slides = [];
        $scope.myInterval = 5000;
        var slides = $scope.slides = [];
        $scope.addSlide = function() { 
            var newWidth = 600 + slides.length;
            slides.push({
              image: 'http://placekitten.com/' + newWidth + '/300',
              text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' ' +
                ['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
            });
          };
          for (var i=0; i<4; i++) {
            $scope.addSlide();
          } */
        
        //$scope.dashbackgroundurl = "";
        
        
    })
    //GRAPH CHUNK**************************************************
                       
                       
    $scope.query = function(request){
        console.log(request);
        $scope.genstyle = "true"
        //NEED TO STORE EVERYONE'S GOOGLE ID SO THAT WE CAN DO REQUESTS OFF THAT
        
        //MAKE REQUEST TO MONGODB
        //********MAKING AN EXAMPLE 9LILG REQUEST - CHANGE THIS LATER
        $http.put('/export', {name:"9LILG",month:request.month}).success(function(data,status,headers){
            console.log(status);
            $scope.download = "Download"
            $scope.downloadstyle = "true"
            $scope.genstyle = "none";
        })
    }
    
    $scope.getDownload = function(file){
        console.log(file)
        $('<form action="'+ "/download" +'" method="'+ ('post') +'">'+'<input type="hidden" name="file" value="'+"9LILG"+'"'+'/></form>')
            .appendTo('body').submit().remove();
            $scope.download = null
            /*$http.put('/download', {file:$scope.inputInfo.name.$modelValue+'.csv'}).success(function(data,status,headers){
                console.log(status);
                console.log(data);

            })*/
    }
    
    $http.put('/getvids',{month:"August"}).success(function(data,status,headers){
        console.log(data);
        $scope.videoList = data;
    })
    
    //******************************************SHOW/HIDE THE VIDEO MANAGER
    
    $scope.vidman = function(){
        $("#download").fadeOut('slow')
        $("#vidman").fadeIn('slow');
    }
    $scope.downloader = function(){
        $("#vidman").fadeOut('slow')
        $("#download").fadeIn('slow');
    }
    
    //$scope.name = 'bob';
}]);

//******************************************************************************************
//*********************************MAPS CONTROLLER******************************************
//******************************************************************************************

controllers.controller('map', ['$scope','$http', function($scope, $http){
    console.log('in the map control')
}])


controllers.controller('Signup', ['$scope','$http', function($scope, $http) {
    console.log('in the proper')
    $scope.register = function(user){
        console.log(user);
        //$scope.message = "Okay cool - you will be receiving an email shortly with an invite"
        $http.put('/register', {email:user.email,name:user.name}).success(function(data,status,headers){
            console.log(status)
            $scope.message = "Okay cool - you will be receiving an email shortly with an invite"
        })
    }
    
}])

controllers.controller('Reports', ['$scope','$http', function($scope, $http) {
    $scope.header = 'Reports'
    $scope.display = 'none'
    console.log('hi')
    $scope.getDownload = function(file){
        $('<form action="'+ "/download" +'" method="'+ ('post') +'">'+'<input type="hidden" name="file" value="'+$scope.inputInfo.name.$modelValue+'"'+'/></form>')
               .appendTo('body').submit().remove();
        $scope.download = null
        /*$http.put('/download', {file:$scope.inputInfo.name.$modelValue+'.csv'}).success(function(data,status,headers){
            console.log(status);
            console.log(data);
            
        })*/
    }
    $scope.export = function(file){
        $http.put('/export', {name:$scope.inputInfo.name.$modelValue, month:$scope.inputInfo.month.$modelValue}).success(function(data,status,headers){
            console.log(status);
            $scope.download = "Download"
            $scope.fileName = $scope.inputInfo.name.$modelValue+'.csv';
            $scope.generate = "Generate";
            globalname = $scope.fileName;
        })
    }
    $scope.queryNotes = function(file){
        $http.put('/queryNotes', {name:$scope.inputInfoNotes.name.$modelValue, month:$scope.inputInfoNotes.month.$modelValue}).success(function(data,status,headers){
            console.log(data);
            $scope.ugcAdViews = data.data.ugcAdViews;
            $scope.ugcViews = data.data.ugcViews;
            $scope.ugcEarnings = data.data.ugcEarnings;
            $scope.partEarnings = data.data.partEarnings;
            $scope.partViews = data.data.partViews;
            $scope.partAdViews = data.data.partAdViews;
            $scope.name = data.data.name;
            $scope.month = data.data.month;
            $scope.display = "inherit"
        })
    }
    $scope.query = function(file){
        //console.log($scope.inputInfo.month.$modelValue)
        $http.put('/query', {name:file.name, month:$scope.inputInfo.month.$modelValue}).success(function(data,status,headers){
            //console.log(data,status,headers);
            
            var gross = 0;
            var counter = 0;
            console.log(data);
            $scope.ugcAdViews = data.data.ugcAdViews;
            $scope.ugcViews = data.data.ugcViews;
            $scope.ugcEarnings = data.data.ugcEarnings;
            $scope.partEarnings = data.data.partEarnings;
            $scope.partViews = data.data.partViews;
            $scope.partAdViews = data.data.partAdViews;
            $scope.name = data.data.name;
            $scope.month = data.data.month;
            $scope.display = "inherit"
            
            /*data.data.map(function(element){
                console.log(element.tEarnings);
                counter++;
                gross += element.tEarnings;
                if(counter == data.data.length){
                    $scope.response = gross;
                }
            })*/
            
            /*for(i=0;i<=data.length;i++){
                console.log(data[i].tEarnings)
                gross += data[i].tEarnings;
                if(i == data.length){
                    $scope.response = gross;
                }
            }*/
            
        })
    }
}]);
