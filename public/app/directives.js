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
        template: '<h1>Partner <em style="color:white">Dashboard</em></h1>'
    }   
})
directives.directive('mail', function(){
    return {
        restrict: 'E',
        template: '<img src="images/email-icon.png" height="80" width="80" hspace="0" style="position:absolute;"></img>'
    }
})

directives.directive('performance', function(){
    return {
        
        restrict: 'E',
        template: '<h2>Your <em style="color:white">best</em> performing video</h2>'
    }
})
