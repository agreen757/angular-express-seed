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
        .when('/dashboard', {
            templateUrl: 'partials/reportView',
            controller: 'dashboard'
        })
        .when('/ddex', {
            templateUrl: 'partials/ddex',
            controller: 'ddex'
        })
        .when('/report', {
            templateUrl: 'partials/report',
            controller: 'Reports'
        })
        .when('/signup', {
            templateUrl: 'partials/signup',
            controller: 'Signup'
        })
        .when('/map', {
            templateUrl: 'partials/map',
            controller: 'map'
        })
        .when('/login', {
            templateUrl: 'partials/login',
            controller: 'login'
        })
    .otherwise({
        redirectTo: '/'
    });
}]).config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
}]);
