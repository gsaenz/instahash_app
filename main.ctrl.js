

	var user = {};
	var accessToken = '';
	var user_id = '';

	
var app =angular.module('app', ['facebook']);
	app.config(function($httpProvider){

    		delete $httpProvider.defaults.headers.common['X-Requested-With'];
		});
  app.config([
	    'FacebookProvider',
	    function(FacebookProvider) {
	     var myAppId = '1082951008399846';
	     FacebookProvider.init(myAppId);
	    }
  ])
  
  app.controller('MainController', [
    '$scope',
    '$timeout',
    '$http',
    'Facebook',
    function($scope, $timeout, $http, Facebook) {
      
      // Define user empty data :/
      $scope.user = {};
      
      // Defining user logged status
      $scope.logged = false;
      
      // And some fancy flags to display messages upon user status change
      $scope.byebye = false;
      $scope.salutation = false;
      
      /**
       * Watch for Facebook to be ready.
       * There's also the event that could be used
       */
      $scope.$watch(
        function() {
          return Facebook.isReady();
        },
        function(newVal) {
          if (newVal)
            $scope.facebookReady = true;
        }
      );
      
      var userIsConnected = false;
      
      Facebook.getLoginStatus(function(response) {
        if (response.status == 'connected') {
          userIsConnected = true;
        }
      });
      
      /**
       * IntentLogin
       */
      $scope.IntentLogin = function() {
        if(!userIsConnected) {
          $scope.login();
        }
      };
      
      /**
       * Login
       */
       $scope.login = function() {
         Facebook.login(function(response) {
          if (response.status == 'connected') {
            $scope.logged = true;
            $scope.me();
          }
        },{scope: 'public_profile,email,user_photos'});
       };
       
       /**
        * me 
        */
        $scope.me = function() {
          Facebook.api('/me', function(response) {
            /**
             * Using $scope.$apply since this happens outside angular framework.
             */
            $scope.$apply(function() {
              $scope.user = response;
              user = response;
            });
            
          });
        };
      
      /**
       * Logout
       */
      $scope.logout = function() {
        Facebook.logout(function() {
          $scope.$apply(function() {
            $scope.user   = {};
            $scope.logged = false;  
          });
        });
      }

      $scope.gete = function(){
      	$http.get('http://rest-service.guides.spring.io/greeting').
        success(function(data) {
            console.log(data);
            $scope.min = data.content;
        });
      }

      $scope.getAlbums = function(){
      	$http.get('http://local.c9.io:3000/api/albums/?access_token='+accessToken+'&user_id='+user_id).
        success(function(data) {
            console.log(data);
           $scope.albums = data;
        });
      };

        $scope.getImages = function(album_id){
      	$http.get('http://local.c9.io:3000/api/photos/?album_id='+album_id+'&access_token='+accessToken).
        success(function(data) {
            console.log(data);
           $scope.photos = data;
        });
      };

        $scope.delete = function(photo_id,tag){

      	$http.delete('http://local.c9.io:3000/api/tags/?'+encodeURI('tag[photo_id]='+photo_id+'&tag[tag]='+tag)).
        success(function(data) {
            console.log(data);
           $('#'+tag+'_'+photo_id).remove();
        });
      };

      $scope.tagi = {};
       $scope.create = function(photo_id_1){
       		console.log(photo_id_1);
       		var tag = $scope.tagi.tag;
      	$http.post('http://local.c9.io:3000/api/tags/create?'+encodeURI('tag[photo_id]='+photo_id_1+'&tag[tag]='+tag)).
        success(function(data) {
            console.log(data);
           
        });
      };

      $scope.search = function(tag){
      	$scope.query = tag;
      }
      /**
       * Taking approach of Events :D
       */
      $scope.$on('Facebook:statusChange', function(ev, data) {
        console.log('Status: ', data);
        if(data.authResponse.accessToken){
        	accessToken = data.authResponse.accessToken;
        	user_id = data.authResponse.userID;
    	}
        if (data.status == 'connected') {
        	$scope.me();
        	$scope.getAlbums();
          $scope.$apply(function() {
            $scope.salutation = true;
            $scope.byebye     = false;  
            $scope.logged=true;  
          });
        } else {
          $scope.$apply(function() {
            $scope.salutation = false;
            $scope.byebye     = true;
            $scope.logged=false;
            // Dismiss byebye message after two seconds
            $timeout(function() {
              $scope.byebye = false;
            }, 2000)
          });
        }
        
        
      });
      
      
    }
  ]);
  
 


