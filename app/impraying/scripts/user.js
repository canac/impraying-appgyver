angular.module('impraying').service('User', function(ngFB) {
  var User = {
    // Authenticate with Facebook
    login: function() {
      ngFB.login({ scope: 'public_profile,user_friends' }).then(function(response) {
        loadProfile();
      });
    },

    // Unauthenticate with Facebook
    logout: function() {
      ngFB.logout().then(function() {
        setUser(null);
      });
    },

    // Return an object representing the currently logged in user
    getUser: function() {
      return currentUser;
    },
  };

  // Represents the currently logged in user
  var currentUser = {
    // Determine whether or not the provided user is the currently logged in user
    isCurrentUser: function(userId) {
      return userId === currentUser.id;
    },
  };

  // Set the current user to the provided object which either contains properties for the user's id
  // and name or is null to represent an unlogged in
  var setUser = function(user) {
    if (user === null) {
      currentUser.facebookId = null;
      currentUser.name = null;
      currentUser.loggedIn = false;
    } else {
      currentUser.facebookId = user.id;
      currentUser.name = user.name;
      currentUser.loggedIn = true;
    }
  };

  // Load information about the current user from Facebook
  var loadProfile = function() {
    return ngFB.api({
      path: '/me',
      params: { fields: 'id,name,friends{id}' },
    }).then(function(user) {
      setUser(user);
      return user;
    });
  };

  // Start out as logged out, then try to load the user's profile, which will only succeed if they
  // are still logged in and their access token is still valid
  setUser(null);
  loadProfile();

  return User;
});
