/**
 * Created by gaoxiang1 on 2015/5/11.
 */

var app = angular.module('myApp', [])

app.factory("Data", [function(){
    return {
        "message" : "hello, my name is",
        "name":"gaoxiang",
        "name2" : "panxiaojun"
    };
}]);
app.filter('reverse', function(){
    return function(text){
        return text.split("").reverse().join("");
    }
});


app.controller('firstCtrl', ["$scope","Data", function($scope, Data){
    $scope.Data = Data;
    console.log(Data);

}]).controller('secondCtrl',["$scope","Data", function($scope, Data){
$scope.Data = Data;
}]);