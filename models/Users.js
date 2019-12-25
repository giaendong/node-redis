const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
require('dotenv').config();

let UsersSchema = new Schema({
    username: {type: String, required: true, max: 100},
    passwordHash: {type: String, required: true},
    passwordSalt: {type: String, required: true},
    role: {type: String, required: true},
    favorites: {type: Array, required: false}
});

UsersSchema.methods.setPassword = function(password) {
  this.passwordSalt = crypto.randomBytes(16).toString('hex');
  this.passwordHash = crypto.pbkdf2Sync(password, this.passwordSalt, 10000, 512, 'sha512').toString('hex');
};

UsersSchema.methods.validatePassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.passwordSalt, 10000, 512, 'sha512').toString('hex');
  return this.passwordHash === hash;
};

UsersSchema.methods.generateJWT = function() {
  return jwt.sign({
    username: this.username,
    id: this._id,
    role: this.role,
  }, process.env.AUTH_SECRET, { expiresIn: '10h'});
}

UsersSchema.methods.toAuthJSON = function(withToken) {
  if (withToken) {
    const token = this.generateJWT();
    return {
      _id: this._id,
      username: this.username,
      token,
      role: this.role,
      favorites: this.favorites
    };
  }
  return {
    _id: this._id,
    username: this.username,
    role: this.role,
    favorites: this.favorites
  };
};

// Export the model
module.exports = mongoose.model('Users', UsersSchema);