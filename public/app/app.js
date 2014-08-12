var app = angular.module('myapp', ['myapp.controllers', 'myapp.directives']);

app.config(['$routeProvider', function ($routeProvider) {
    
    $routeProvider.when('/', {
        templateUrl: 'partials/index',
        controller: 'IndexController'
    })
        .when('/another', {
            templateUrl: 'partials/index',
            controller: 'AnotherController'
        })
        .when('/report', {
            templateUrl: 'partials/report',
            controller: 'Reports'
        })
   /* .otherwise({
        redirectTo: '/'
    });*/
}]).config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
}]);
