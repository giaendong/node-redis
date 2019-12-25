const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const Users = mongoose.model('Users');

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
}, (username, password, done) => {
  Users.findOne({ username })
    .then((user) => {
      if(!user || !user.validatePassword(password) || (user.role !== 'admin' && user.role !== 'user')) {
        return done(null, false, { errors: { 'message': 'invalid credentials' } });
      }

      return done(null, user);
    }).catch(done);
}));