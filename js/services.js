angular.module('messageQAPro.services', ['rmHoldButton', 'ng-mfb', 'angularAudioRecorder'])

.factory('API', function ($rootScope, $http, $ionicLoading, $window) {
       var base = "https://messageqaappserver.herokuapp.com";
       $rootScope.show = function (text) {
           $ionicLoading.show({
             template: text
           }).then(function(){
           });
       };
       $rootScope.showAlert = function(text) {
         var alertPopup = $ionicPopup.alert({
           title: 'Alert!',
           template: text
         });

         alertPopup.then(function(res) {
         });
       };

        $rootScope.hide = function () {
            $ionicLoading.hide();
        };

        $rootScope.logout = function () {
            $rootScope.setToken("");
            $rootScope.setTherapistToken("");
            $rootScope.setTherapistID("");
            $window.location.href = '#/therapists/login';
        };

        $rootScope.notify =function(text){
            $rootScope.show(text);
            $window.setTimeout(function () {
              $rootScope.hide();
            }, 1999);
        };

        $rootScope.doRefresh = function (tab) {
            if (tab == 1) {
                $rootScope.$broadcast('fetchAllTherapists');
            }
            $rootScope.$broadcast('scroll.refreshComplete');
        };

        $rootScope.setToken = function (token) {
            return $window.localStorage.token = token;
        }

        $rootScope.getToken = function () {
            return $window.localStorage.token;
        }

        $rootScope.isSessionActive = function () {
            return $window.localStorage.token ? true : false;
        }
        $rootScope.setTherapistToken = function (token) {
            return $window.localStorage.therapisttoken = token;
        }
        $rootScope.setTherapistID = function (token) {
            return $window.localStorage.therapistid = token;
        }
        $rootScope.getTherapistID = function () {
            return $window.localStorage.therapistid;
        }

        $rootScope.getTherapistToken = function () {
            return $window.localStorage.therapisttoken;
        }

        $rootScope.isTherapistSessionActive = function () {
            return $window.localStorage.therapisttoken ? true : false;
        }

        return {
            signin: function (form) {
                return $http.post(base+'/api/v1/messageqa/auth/login', form);
            },
            therapistsignin: function (form) {
                return $http.post(base+'/api/v1/messageqa/therapistauth/login', form);
            },
            signup: function (form) {
                return $http.post(base+'/api/v1/messageqa/auth/register', form);
            },
            getAll: function (email) {
                return $http.get(base+'/api/v1/messageqa/data/list', {
                    method: 'GET',
                    params: {
                        token: email
                    }
                });
            },
            getTherapistAll: function (id) {
                return $http.get(base+'/api/v1/messageqa/data/therapistquestionlist', {
                    method: 'GET',
                    params: {
                        token: id
                    }
                });
            },
            findAll: function (email) {
                return $http.get(base+'/api/v1/messageqa/data/listall', {
                    method: 'GET',
                    params: {
                        token: email
                    }
                });
            },
            getOne: function (id, email) {
                return $http.get(base+'/api/v1/messageqa/data/item/' + id, {
                    method: 'GET',
                    params: {
                        token: email
                    }
                });
            },
            saveItem: function (form, email) {
                return $http.post(base+'/api/v1/messageqa/data/item', form, {
                    method: 'POST',
                    params: {
                        token: email
                    }
                });
            },
            putItem: function (id, form, email) {
                return $http.put(base+'/api/v1/messageqa/data/item/' + id, form, {
                    method: 'PUT',
                    params: {
                        token: email
                    }
                });
            },
            deleteItem: function (id, email) {
                return $http.delete(base+'/api/v1/messageqa/data/item/' + id, {
                    method: 'DELETE',
                    params: {
                        token: email
                    }
                });
            },
            getUser: function (email) {
                return $http.get(base+'/api/v1/messageqa/auth', {
                    method: 'GET',
                    params: {
                        token: email
                    }
                });
            }
        }
    });
