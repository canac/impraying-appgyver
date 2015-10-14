angular.module('impraying').run(function(ngFB) {
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

angular.module('impraying').controller('LoginCtrl', function(User) {
  this.user = User.getUser();
  this.facebookLogin = User.login;
  this.facebookLogout = User.logout;
  this.continue = function() {
    supersonic.ui.initialView.dismiss();
  };
});
