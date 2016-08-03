angular.module('messageQAPro.controllers', ['messageQAPro.services'])

.controller('TherapistsLoginCtrl', function ($rootScope, $scope, API, $window) {
    // if the user is already logged in, take him to his bucketlist
    if ($rootScope.isTherapistSessionActive()) {
        $window.location.href = ('#/therapistsdefault/questions');
    }



    $scope.user = {
        email: "",
        password: ""
    };

    $scope.validateUser = function () {
        var email = this.user.email;
        var password = this.user.password;
        if(!email || !password) {
        	$rootScope.notify("Please enter valid credentials");
        	return false;
        }
        $rootScope.show('Please wait.. Authenticating');
        API.therapistsignin({
            email: email,
            password: password
        }).success(function (data) {
            $rootScope.setTherapistToken(email); // create a session kind of thing on the client side
            console.log("ID:", data.tid);
            $rootScope.setTherapistID(data.tid);
            $rootScope.hide();
            $window.location.href = ('#/therapistsdefault/questions');
            $rootScope.$broadcast('fetchAllTherapists');
        }).error(function (error) {
            $rootScope.hide();
        });
    }

})

.controller('TherapistsDefaultQuestionsCtrl', function ($rootScope, $scope, API, $timeout, $ionicModal, $window, $state) {
    console.log($rootScope.isTherapistSessionActive());
    if ($rootScope.isTherapistSessionActive() == false){
      // $window.location.href = ('#/therapists/login');
      // $state.go('therapists.login')
      $state.go('therapists.login', {});
    }
    $scope.logout = function() {
      console.log("Hi");
      $rootScope.logout();
    }
    $rootScope.$on('fetchAllTherapists', function(){
      if ($rootScope.getTherapistID()){
        API.getTherapistAll($rootScope.getTherapistID()).success(function (data, status, headers, config) {

            $rootScope.show("Please wait... Processing");
            $scope.list = [];

            for (var i = 0; i < data.length; i++) {
                if (data[i].responseData) {
                  data[i].hasAnswered = true;
                } else {
                  data[i].hasAnswered = false;
                }
                $scope.list.push(data[i]);
            };
            console.log($scope.list.length);
            if($scope.list.length == 0)
            {
                $scope.noData = true;
            }
            else
            {
                $scope.noData = false;
            }
            $scope.list.sort(function(a,b){
              // Turn your strings into dates, and then subtract them
              // to get a value that is either negative, positive, or zero.
              return b.created - a.created;
            });
            $ionicModal.fromTemplateUrl('templates/newItem.html', function (modal) {
                $scope.newTemplate = modal;
            });

            $scope.newQuestion = function () {
                $scope.newTemplate.show();
            };
            $rootScope.hide();
        }).error(function (data, status, headers, config) {
            $rootScope.hide();
            $rootScope.notify("Oops something went wrong!! Please try again later");
        });
      }

    });

    $rootScope.$broadcast('fetchAllTherapists');


    $scope.remove = function (id) {
        $rootScope.show("Please wait... Deleting from List");
        API.deleteItem(id, $rootScope.getToken())
            .success(function (data, status, headers, config) {
                $rootScope.hide();
                $rootScope.doRefresh(1);
            }).error(function (data, status, headers, config) {
                $rootScope.hide();
                $rootScope.notify("Oops something went wrong!! Please try again later");
            });
    };
    // $ionicModal.fromTemplateUrl('templates/question-detail.html', function(modal) {
    //   $scope.modalCtrl = modal;
    // }, {
    //   scope: $scope,  /// GIVE THE MODAL ACCESS TO PARENT SCOPE
    //   animation: 'slide-in-left'//'slide-left-right', 'slide-in-up', 'slide-right-left'
    // });

    $scope.gotoDetail=function(questionId){
      API.getOne(questionId, $rootScope.getTherapistToken())
      .success(function (data, status, headers, config) {
          $scope.question = data;
          $ionicModal.fromTemplateUrl('templates/question-detail.html', function (modal) {
            $scope.newDetailTemplate = modal;
            console.log("Showing");
            $scope.newDetailTemplate.show();
          },{
            scope: $scope
          });
      })
    }
    $scope.close = function(){
      $scope.newDetailTemplate.hide()
    }
})

.controller('QuestionDetailCtrl', function($scope, $rootScope, $element, $stateParams, API) {
  var audioElement = $element.find('audio')[0];
  var currentUniqID, currentFilePath, currentMedia;
  if ($scope.question[0].responseData){
    $scope.hasAnswered = true;
  } else {
    $scope.hasAnswered = false;
  }
  // $scope.question[0].responseData = my_media;
  // console.log(JSON.stringify($scope.question[0], null, 4));
  // $rootScope.show("Saving");
  // API.putItem($scope.question[0]._id, $scope.question[0], $rootScope.getTherapistToken())
  // .success(function (data, status, headers, config) {
  //     $rootScope.hide();
  //     $rootScope.doRefresh(1);
  // }).error(function (data, status, headers, config) {
  //     console.log("Failed");
  //     $rootScope.hide();
  //     $rootScope.notify("Oops something went wrong!! Please try again later");
  // });
  $scope.record = function (){
    console.log('helloworld');
    var uniq = 'id' + (new Date()).getTime();
    currentUniqID = uniq;
    window.plugins.BZRecorder.record(function(data){
      console.log(data);
    }, null, uniq)
  }
  $scope.stop = function (){
    window.plugins.BZRecorder.stop(function(data){
      currentFilePath = data;
      console.log(data);
    }, null);
    $scope.hasAnswered = true;
  }

  $scope.playback = function (){
    currentMedia = new Media(currentFilePath,
        // success callback
        function () { console.log("playAudio():Audio Success"); },
        // error callback
        function (err) { console.log("playAudio():Audio Error: " + err); }
    );
    currentMedia.play();
  }

  $scope.stopPlayback = function (){
    currentMedia.stop();
  }

//   var captureError = function(e) {
//     console.log('captureError' ,e);
// }
//
// var captureSuccess = function(e) {
//     console.log('captureSuccess');console.dir(e);
//     $scope.sound.file = e[0].localURL;
//     $scope.sound.filePath = e[0].fullPath;
// }
//
// $scope.record = function() {
//     navigator.device.capture.captureAudio(
//         captureSuccess,captureError,{duration:10});
// }

  $scope.save = function() {
    if (currentFilePath){
       var type = window.PERSISTENT;
       var size = 5*1024*1024;

       window.requestFileSystem(type, size, successCallback, errorCallback)

       function successCallback(fs) {
          fs.root.getFile(currentUniqID + ".caf", {create: false, exclusive: false}, function(fileEntry) {
            // var reader = new FileReader();
            // reader.onloadend = function(evt) {
            //     console.log("Read as data URL");
            //     console.log(evt.target.result);
            // };
            // reader.readAsDataURL(fileEntry);
            fileEntry.file(function (file) {
              var reader = new FileReader();

              reader.onloadend = function() {
                  console.log("Successful file read");
                  $scope.question[0].responseData = this.result;
                  console.log(JSON.stringify($scope.question[0], null, 4));
                  API.putItem($scope.question[0]._id, $scope.question[0], $rootScope.getTherapistToken())
                  .success(function (data, status, headers, config) {
                      $rootScope.notify("Saved");
                      $rootScope.doRefresh(1);
                  }).error(function (data, status, headers, config) {
                      console.log("Failed");
                      $rootScope.hide();
                      $rootScope.notify("Oops something went wrong!! Please try again later");
                  });
              };

              reader.readAsDataURL(file);

          }, errorCallback);
            console.log(JSON.stringify(fileEntry, null, 4));
          }, errorCallback);
       }

       function errorCallback(error) {
          alert("ERROR: " + error.code)
       }
    } else {
      $rootScope.notify("Please record before you save the answer.")
    }

  }

  function b64toBlob(dataURI) {

    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: '*/*' });
}
  // function b64toBlob(b64Data, contentType, sliceSize) {
  //   contentType = contentType || '';
  //   sliceSize = sliceSize || 512;
  //
  //   var byteCharacters = atob(b64Data);
  //   var byteArrays = [];
  //
  //   for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
  //     var slice = byteCharacters.slice(offset, offset + sliceSize);
  //
  //     var byteNumbers = new Array(slice.length);
  //     for (var i = 0; i < slice.length; i++) {
  //       byteNumbers[i] = slice.charCodeAt(i);
  //     }
  //
  //     var byteArray = new Uint8Array(byteNumbers);
  //
  //     byteArrays.push(byteArray);
  //   }
  //
  //   var blob = new Blob(byteArrays, {type: contentType});
  //   return blob;
  // }

})
