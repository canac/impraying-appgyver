angular.module('impraying').service('User', function(ngFB, UserModel, $q) {
  var User = {
    // Authenticate with Facebook
    login: function() {
      return ngFB.login({ scope: 'public_profile,user_friends' }).then(function(response) {
        return loadProfile();
      });
    },

    // Unauthenticate with Facebook
    logout: function() {
      return ngFB.logout().then(function() {
        return setUser(null);
      });
    },

    // Return an object representing the currently logged in user
    getUser: function() {
      return currentUser;
    },

    // Determine whether or not the provided user is the currently logged in user
    isCurrentUser: function(userId) {
      return currentUser && userId === currentUser.id;
    },
  };

  // The User model representing the logged in user, or null if the user is logged out
  var currentUser;

  // Set the current user to the provided object which either contains properties for the user's id
  // and name or is null to represent an unlogged in
  var setUser = function(user) {
    if (user === null) {
      currentUser = null;
      return $q.when(currentUser);
    } else {
      // Try to find an existing user with this Facebook id
      var query = { facebookId: user.id };
      return UserModel.findAll({ query: JSON.stringify(query) }).then(function(users) {
        // If no users were not found, create a new one
        currentUser = users.length > 0 ? users[0] : new UserModel({ facebookId: user.id });
        currentUser.name = user.name;
        currentUser.friends = user.friends.data.map(function(friend) {
          return friend.id;
        });

        return currentUser.save();
      });
    }
  };

  // Load information about the current user from Facebook
  var loadProfile = function() {
    return ngFB.api({
      path: '/me',
      params: { fields: 'id,name,friends{id}' },
    }).then(function(user) {
      return setUser(user);
    });
  };

  // Start out as logged out, then try to load the user's profile, which will only succeed if they
  // are still logged in and their access token is still valid
  setUser(null).then(function() {
    return loadProfile();
  });

  return User;
});
