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

angular.module('impraying').constant('UserModel', supersonic.data.model('User'));
angular.module('impraying').constant('PrayerModel', supersonic.data.model('Prayer'));
angular.module('impraying').constant('CommentModel', supersonic.data.model('Comment'));
angular.module('impraying').constant('NotificationModel', supersonic.data.model('Notification'));

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

angular.module('impraying').directive('commentPreview', function() {
  return {
    restrict: 'E',
    scope: {
      comment: '=comment',
    },
    templateUrl: '_comment-preview.html',
    controller: function($scope, User, PrayerModel, UserModel) {
      $scope.loading = true;

      // Lookup the comment's author given its user id
      UserModel.find($scope.comment.author).then(function(author) {
        $scope.author = author;
        $scope.loading = false;
        $scope.$apply();
      });

      $scope.deleteComment = function() {
        $scope.comment.delete();
      };

      $scope.isCurrentUser = User.isCurrentUser;
    },
  };
});

angular.module('impraying').directive('notificationPreview', function() {
  return {
    restrict: 'E',
    scope: {
      notification: '=notification',
    },
    templateUrl: '_notification-preview.html',
    controller: function($scope, $q, User, UserModel, PrayerModel, CommentModel) {
      $scope.loading = true;

      // Lookup the comment associated with the notification
      CommentModel.find($scope.notification.commentId).then(function(comment) {
        $scope.comment = comment;

        // Lookup the prayer associated with the notification
        var prayerPromise = PrayerModel.find(comment.prayerId);
        prayerPromise.then(function(prayer) {
          $scope.prayer = prayer;
        });

        // Lookup the comment's author
        var authorPromise = UserModel.find(comment.author);
        authorPromise.then(function(author) {
          $scope.author = author;
        });

        // Update the view and unhide it when all data is finished loading
        $q.when(prayerPromise, authorPromise).then(function() {
          $scope.loading = false;
        });
      });

      $scope.deleteNotification = function() {
        $scope.notification.delete();
      };
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
    if (!$scope.user) {
      return;
    }

    var query = { author: { $in: $scope.user.friends } };
    PrayerModel.findAll({ query: JSON.stringify(query) }).then(function(prayers) {
      _this.feed = prayers;
      $scope.$apply();
    });
  };

  $scope.$watch('user', function(newValue, oldValue) {
    _this.refresh();
  });

  this.refresh();
});

angular.module('impraying').controller('PrayerCtrl', function($scope, User, UserModel, PrayerModel, CommentModel, NotificationModel) {
  this.loading = true;

  var _this = this;

  this.createComment = function() {
    var newComment = new CommentModel({
      prayerId: _this.prayer.id,
      author: $scope.user.id,
      content: this.comment,
      timestamp: new Date().toISOString(),
    });
    newComment.save().then(function() {
      _this.comments.push(newComment);
      $scope.$apply();

      // Notify the prayer's author when someone else comments on it
      if (newComment.author !== _this.prayer.author) {
        newNotification = new NotificationModel({
          userId: _this.prayer.author,
          commentId: newComment.id,
        });
        newNotification.save();
      }
    });

    this.comment = '';
  };

  this.isCurrentUser = User.isCurrentUser;

  this.deletePrayer = function() {
    this.prayer.delete();
    supersonic.ui.layers.pop();
  };

  this.refresh = function() {
    this.loading = true;
    this.prayer = null;
    this.author = null;
    $scope.$apply();

    // Lookup the prayer given its prayer id
    PrayerModel.find(this.prayerId).then(function(prayer) {
      _this.prayer = prayer;

      // Lookup the prayer's author given its user id
      UserModel.find(prayer.author).then(function(author) {
        _this.author = author;
        _this.loading = false;
        $scope.$apply();
      });
    });

    // Lookup the prayer's comments given its prayer id
    var query = { prayerId: this.prayerId };
    CommentModel.findAll({ query: JSON.stringify(query) }).then(function(comments) {
      _this.comments = comments;
      $scope.$apply();
    });
  };

  supersonic.ui.views.current.params.onValue(function(params) {
    _this.prayerId = params.id;
    if (_this.prayerId) {
      _this.refresh();
    }
  });
});

angular.module('impraying').controller('NotificationsCtrl', function($scope, NotificationModel) {
  var _this = this;

  this.feed = [];
  this.refresh = function() {
    if (!$scope.user) {
      return;
    }

    var query = { userId: $scope.user.id };
    NotificationModel.findAll({ query: JSON.stringify(query) }).then(function(notifications) {
      _this.notifications = notifications;
      $scope.$apply();
    });
  };

  $scope.$watch('user', function(newValue, oldValue) {
    _this.refresh();
  });

  this.refresh();
});
