angular.module('impraying').run(function($rootScope, ngFB, User) {
  Object.defineProperty($rootScope, 'user', { get: User.getUser });

  var baseUrl = window.location.href.slice(0, window.location.href.lastIndexOf('/'));

  // Initalize the Facebook authentication module using LocalStorage instead of the default
  // SessionStorage for the token store to persist logins across sessions
  ngFB.init({
    appId: 1641039379506767,
    tokenStore: window.localStorage,
    oauthRedirectURL: baseUrl + '/_oauthcallback.html',
    logoutRedirectURL: baseUrl + '/_logoutcallback.html',
  });
});

angular.module('impraying').constant('PrayerModel', supersonic.data.model('Prayer'));

angular.module('impraying').constant('UserModel', supersonic.data.model('User'));

angular.module('impraying').directive('prayerPreview', function() {
  return {
    restrict: 'E',
    scope: {
      prayerId: '=prayerId',
    },
    templateUrl: '_prayer-preview.html',
    controller: function($scope, PrayerModel, UserModel) {
      $scope.loading = true;

      // Lookup the prayer given its prayer id
      PrayerModel.find($scope.prayerId).then(function(prayer) {
        $scope.prayer = prayer;

        // Lookup the prayer's author given its user id
        UserModel.find(prayer.author).then(function(author) {
          $scope.author = author;
          $scope.loading = false;
          $scope.$apply();
        });
      });
    },
  };
});

angular.module('impraying').controller('LoginCtrl', function(User) {
  this.facebookLogin = User.login;
  this.facebookLogout = User.logout;

  this.continue = function() {
    supersonic.ui.initialView.dismiss();
  };
});

angular.module('impraying').controller('PrayersCtrl', function($scope, PrayerModel) {
  var _this = this;

  this.request = '';
  this.createPrayer = function() {
    var newPrayer = new PrayerModel({
      author: $scope.user.id,
      content: this.request,
      timestamp: new Date().toISOString(),
    });
    newPrayer.save().then(function() {
      _this.feed.push(newPrayer);
      $scope.$apply();
    });

    this.request = '';
  };

  this.feed = [];
  this.refresh = function() {
    PrayerModel.findAll().then(function(prayers) {
      _this.feed = prayers;
      $scope.$apply();
    });
  };

  this.refresh();
});

angular.module('impraying').controller('PrayerCtrl', function($scope, PrayerModel, UserModel, User) {
  this.loading = true;

  var _this = this;
  supersonic.ui.views.current.params.onValue(function(params) {
    var prayerId = params.id;
    if (!prayerId) {
      return;
    }

    _this.loading = true;
    _this.prayer = null;
    _this.author = null;
    $scope.$apply();

    // Lookup the prayer given its prayer id
    PrayerModel.find(prayerId).then(function(prayer) {
      _this.prayer = prayer;

      // Lookup the prayer's author given its user id
      UserModel.find(prayer.author).then(function(author) {
        _this.author = author;
        _this.loading = false;
        $scope.$apply();
      });
    });
  });

  this.isCurrentUser = User.isCurrentUser;

  this.deletePrayer = function() {
    this.prayer.delete();
    supersonic.ui.layers.pop();
  };
});
