var controllers = angular.module('myapp.controllers', []);

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
    
    //$scope.name = 'bob';
}]);

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
