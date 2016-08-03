// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js


angular.module('messageQAPro', ['ionic', 'messageQAPro.controllers', 'messageQAPro.services', 'angularMoment'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  .state('therapists', {
    url: '/therapists',
    abstract: true,
    templateUrl: 'templates/therapists.html'
  })
  .state('therapistsdefault', {
    url: '/therapistsdefault',
    abstract: true,
    templateUrl: 'templates/therapistsdefault.html'
  })
  .state('therapists.login', {
  url: '/login',
  views: {
    'therapists-login': {
      templateUrl: 'templates/therapists-login.html',
      controller: 'TherapistsLoginCtrl'
    }
  }
})
.state('therapistsdefault.questions', {
url: '/questions',
views: {
  'therapistsdefault-questions': {
    templateUrl: 'templates/therapistsdefault-questions.html',
    controller: 'TherapistsDefaultQuestionsCtrl'
  }
}
});


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/therapists/login');

})
.directive('recordDirective', RecordDirective);

RecordDirective.$inject = [];

function RecordDirective() {
    var ddo = {
        scope: {},
        restrict: 'E',
        template: [
            '<button class="item item-icon-left assertive" href="#" style="width: 50%; margin-left: 25%;" on-touch="record()" on-release="stop()"><i class="icon ion-android-microphone"></i>Hold to talk</button>',
            '<h3 style="width: 50%; margin-left: 25%;">Preview</h3>',
            '<div style="width: 50%; margin-left: 25%;"><audio controls></audio></div>',
            ''
        ].join(''),
        link: function(scope, element, attributes) {
            var mediaRecorder;
            var mediaStream;
            var recordedBlobs = [];
            var audioElement = element.find('audio')[0];
            scope.record = function() {
                recordedBlobs = [];
                console.log('Record clicked');
                if (navigator.webkitGetUserMedia) {
                   navigator.webkitGetUserMedia (
                      {
                         audio: true,
                         video: false
                      },
                      function(stream) {
                          console.log('got Stream');
                          mediaStream = stream;
                          mediaRecorder = new MediaRecorder(stream, {
                              mimeType: 'audio/webm'
                          });
                          mediaRecorder.ondataavailable = function (event) {
                              console.log('data available');
                              recordedBlobs.push(event.data);
                          };
                          mediaRecorder.start(10);
                      },
                      function(err) {
                         console.log('The following gUM error occured: ' + err);
                      }
                   );
                } else {
                   console.log('getUserMedia not supported on your browser!');
                }
            };
            scope.stop = function() {
                console.log('Stop button clicked');
                mediaRecorder.stop();
                mediaStream.getTracks().forEach(function(track) {
                    console.log('stopping stream track');
                    track.stop();
                });
                var superAudioBuffer = new Blob(recordedBlobs, {
                    type: 'audio/webm'
                });
               var audioUrl = URL.createObjectURL(superAudioBuffer);
               audioElement.src = audioUrl;
            };
        }
    };
    return ddo;
}
