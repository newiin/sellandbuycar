const flash=require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/User');
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function (email, password, done) {
  
  
  User.getUserByEmail(email, function (err, user) {
    if (!user) {
      return done(null, false, {
        message: 'Unknown User'
      });
      
    } else {
      
    
        User.comparePassword(password, user.password, function (err, isMatch) {
          if (isMatch) {
            return done(null, user);  
          } else {
            return done(null, false, {
              message: 'Invalid password! Try again'
            });
          }
        });
      
     
    }


  });

}));


passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
   
  });
})