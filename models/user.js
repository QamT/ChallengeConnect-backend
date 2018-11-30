const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { hashSync, compareSync } = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: { 
    type: String, 
    required: true,
    set: v => (v.charAt(0).toUpperCase() + v.slice(1))
  },
  lastName: { 
    type: String, 
    required: true,
    set: v => (v.charAt(0).toUpperCase() + v.slice(1))
  },
  profilePic: { 
    url: { type: String, default: ''},
    id: { type: String, default: '' }
  },
  age: Number,
  gender: { type: String || Boolean, enum: ['male', 'female', null], default: null },
  about: { type: String, default: '' },
  currentChallenge: { 
    id: { type: mongoose.Schema.ObjectId || Boolean, ref: 'Challenge', default: null }, // game complete
    challengeRequested: { 
      id: { type: mongoose.Schema.ObjectId || Boolean, ref: 'Challenge', default: null }, 
      team: { type: String || Boolean, enum: ['a', 'b', null], default: null} 
    } 
   },
  score: { type: Number, default: 0 },
  friends: {
    list: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    friendRequests: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    friendRequested: [{ type: mongoose.Schema.ObjectId, ref: 'User' }]
  } 
});

userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.password = this.hashPassword(this.password);
  }
  next();
})

userSchema.methods = {
  hashPassword(password) {
    return hashSync(password);
  },

  authenticateUser(password) {
    return compareSync(password, this.password);
  },

  createAuthToken() {
    return jwt.sign(
      {
        user: this.serialize()
      },
      process.env.JWT_SECRET,
      {
        subject: this.username,
        expiresIn: process.env.JWT_EXPIRY
      }
    )
  },

  serialize() {
    return {
      id: this._id,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName
    }
  },

  serializeDetails() {
    return {
      id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      profilePic: this.profilePic,
      age: this.age || 0,
      gender: this.gender,
      about: this.about,
      currentChallenge: this.currentChallenge,
      score: this.score,
      friends: this.friends 
    }
  },

  serializeUserDetails() {
    return {
      id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      profilePic: this.profilePic,
      about: this.about,
    }
  },

  serializeLeaderInfo() {
    return {
      id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      profilePic: this.profilePic,
      score: this.score
    }
  }
}

const User = mongoose.model('User', userSchema);

module.exports = { User };