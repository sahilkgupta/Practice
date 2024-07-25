const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: {
    type: String,
    unique: true
  }
});
module.exports = mongoose.model('Login', userSchema);
