var directives = angular.module('myapp.directives', []);
directives.directive('hello', function () {
    return {
        restrict: 'E',
        template: '<p>Hello from directive</p>'
    };
});

directives.directive('graph', function () {
    console.log('hi')
    return {
        restrict: 'E',
        template: '<p>Hello from directive</p>'
    };
});

directives.directive('user', function (){
    return {
        
        restrict: 'E',
        template: '<h1>This is your <em style="color:white">reports</em> dashboard</h1>'
    }   
})

directives.directive('performance', function(){
    return {
        
        restrict: 'E',
        template: '<h2>Your <em style="color:white">best</em> performing video</h2>'
    }
})
