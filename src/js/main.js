'use strict';

angular.module('netshoes', []);

angular.module('netshoes').controller('mainController', function($scope, $q, $timeout, $filter, localStorage, mainService){

  $scope.cart = [];
  $scope.subTotal = [];
  $scope.error = false;
  $scope.success = false;
  var deferred = $q.defer();

  $scope.latestData = function() {
    $scope.cart = localStorage.getData();
  };

  mainService.getItems().success(function(data){
    $scope.loja = data;
  }).error(function(data){
    $scope.error = data;
  });

  $scope.showCart = function(){
    angular.element('.cart').animate({ right: '0' }, 200);
    angular.element('.btn-cart').hide();
  }

  $scope.hideCart = function(){
    angular.element('.cart').animate({ right: '-500px'}, 200);
    angular.element('.btn-cart').show();
  }

  $scope.addItemCart = function(item){
    $scope.cart.push(item);
    localStorage.setData(item);
    getTotalPrice();
  };

  $scope.delItemCart = function(item_id){
    angular.forEach($scope.cart, function(v, i){
      if(item_id === i){
        $scope.cart.splice(item_id, 1);
        rollBackItem(v);
      }
    });
  };

  var getTotalPrice = function(){
    $scope.subTotal.installments = 10;
    $timeout(function(){
      var sum = 0;
      angular.forEach($scope.cart, function(v, i){
        sum += v.price;
      });
      $scope.subTotal.totalPrice = sum;
      $scope.subTotal.installPrice = (sum / $scope.subTotal.installments);
    }, 10);
  };

  var rollBackItem = function(item){
    angular.forEach(item, function(v, i){
      if (i === 'price'){
        $scope.subTotal.totalPrice -= v;
        $scope.subTotal.installPrice = ($scope.subTotal.totalPrice / $scope.subTotal.installments);
      }
    })
  };

  $scope.checkout = function(cart){
    mainService.postItem(cart).success(function(data){
      $scope.success = true;
      $scope.postCart = data;
      deferred.resolve($scope.postCart);
      $scope.cart = [];
      $window.localStorage.removeItem('my-cart');
      $scope.hideCart();
    }).error(function(data){
      $scope.error = true;
    });
  }
});

angular.module('netshoes').service('mainService', function($http){
  return {
    getItems: function(){
      return $http.get('/public/data');
    },
    postItem: function(params){
      return $http.post('/public/cart/', {
        data: $.param(params)
      });
    }
  }
})

angular.module('netshoes').factory("localStorage", function($window, $rootScope) {
  return {
    setData: function(item) {
      $window.localStorage && $window.localStorage.setItem('my-cart', item);
      return this;
    },
    getData: function() {
      return $window.localStorage && $window.localStorage.getItem('my-cart');
    }
  };
});
