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

controllers.controller('AnotherController', ['$scope', function($scope) {
    $scope.message = 'Another Page';
    //$scope.name = 'bob';
}]);

controllers.controller('Reports', ['$scope','$http', function($scope, $http) {
    $scope.header = 'Reports'
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
