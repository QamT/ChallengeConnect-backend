const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { hashSync, compareSync } = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');

const { AppError } = require('../utils');

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'username is required'],
    minlength: [6, 'username should contain at least 6 characters'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    minlength: [6, 'password should contain at least 6 characters'],
    trim: true
  },
  firstName: { 
    type: String, 
    required: [true, 'first name is required'],
    trim: true,
    set: v => (v.charAt(0).toUpperCase() + v.slice(1)),
  },
  lastName: { 
    type: String, 
    required: [true, 'last name is required'],
    trim: true,
    set: v => (v.charAt(0).toUpperCase() + v.slice(1))
  },
  profilePic: { 
    url: { type: String, default: ''},
    id: { type: String, default: '' }
  },
  birthDate: { type: String, default: '' },
  gender: { type: String || Boolean, enum: ['male', 'female', null], default: null },
  location: {
    city: { type: String, default: ''},
    state: { type: String, default: ''},
    country: { type: String, default: ''}
  },
  about: { type: String, default: '' },
  currentChallenge: { 
    id: { type: mongoose.Schema.ObjectId || Boolean, ref: 'Challenge', default: null }, 
  },
  challengeRequested: [{ type: mongoose.Schema.ObjectId, ref: 'Challenge' }], 
  challengeRequests: [{ 
    id: { type: mongoose.Schema.ObjectId, ref: 'Challenge' },
    user: { type: mongoose.Schema.ObjectId, ref: 'User' }
  }],
  friends: {
    list: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    friendRequests: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    friendRequested: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    challengeSent: [{ type: mongoose.Schema.ObjectId, ref: 'User' }]
  },
  score: { type: Number, default: 0 }
});

userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.password = this.hashPassword(this.password);
  }
  next();
});

userSchema.pre('findOne', function(next) {
  const userInfo = 'firstName lastName profilePic currentChallenge about';
  this.populate({ path: 'challengeRequests.id', match: { active: false }, select: 'title teams' })
    .populate('challengeRequests.user', userInfo)
    .populate('friends.list', userInfo)
    .populate('friends.friendRequests', userInfo)
    .populate('friends.friendRequested', userInfo);
      
  next();
});

userSchema.post('save', function(doc, next) {
  const userInfo = 'firstName lastName profilePic currentChallenge about';
  doc.populate({ path: 'challengeRequests.id', match: { active: false }, select: 'title teams' })
    .populate('challengeRequests.user', userInfo)
    .populate('friends.list', userInfo)
    .populate('friends.friendRequests', userInfo)
    .populate('friends.friendRequested', userInfo)
    .execPopulate()
    .then(() => next());
});

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

  registerDetails({ body, file }) {
    const optionalFields = ['birthDate', 'gender', 'location', 'about'];
    const details = body.user ? JSON.parse(body.user) : {};
    
    for (const detail in details) {
      if (detail === '0') break;
      if (!optionalFields.includes(detail)) throw new AppError(`Can't set value for invalid field`);
      this[detail] = details[detail];
    };
    if (file) {
      this.profilePic.url = file.url;
      this.profilePic.id = file.public_id.split('/')[1];
    }

    return this.save();
  },

  sendFriendRequest(id) {
    if (this.friends.friendRequested.indexOf(id) === -1) this.friends.friendRequests.push(id);
    return this.save();
  },

  pushFriendRequest(id) {
    if (this.friends.friendRequests.indexOf(id) === -1) this.friends.friendRequested.push(id);
    return this.save();
  },

  acceptFriendRequest(id) {
    this.friends.list.push(id);
    this.friends.friendRequests.remove(id);
    return this.save();
  },

  addFriendRequested(id) {
    this.friends.list.push(id);
    this.friends.friendRequested.remove(id);
    return this.save();
  },

  removeFriendRequests(id) {
    this.friends.friendRequests.remove(id);
    return this.save();
  },

  removeFriendRequested(id) {
    this.friends.friendRequested.remove(id);
    return this.save();
  },

  removeFriend(id) {
    this.friends.list.remove(id);
    this.friends.challengeSent.remove(id);
    this.challengeRequests = this.challengeRequests.filter(request => request.user._id.toString() !== id.toString());
    return this.save();
  },

  resetChallenge() {
    this.friends.challengeSent = [];
    this.currentChallenge.id = null;
    return this.save();
  },

  addChallenge(id) {
    this.currentChallenge.id = id;
    this.challengeRequested = [];
    this.challengeRequests = [];
    return this.save();
  },

  pushChallengeSent(id) {
    this.friends.challengeSent.push(id);
    return this.save();
  },

  sendChallenge(id, user) {
    this.challengeRequests.push({ id, user });
    return this.save();
  },

  requestChallenge(id) {
    this.challengeRequested.push(id);
    return this.save()
  },

  removeChallengeSent(id) {
    this.friends.challengeSent.remove(id);
    return this.save();
  },

  removeChallengeRequest(id) {
    this.challengeRequests = this.challengeRequests.filter(request => request.user._id.toString() !== id.toString());
    return this.save();
  },

  removeChallengeRequested(id) {
    this.challengeRequested.remove(id);
    return this.save();
  },

  clearChallengeSent() {
    this.friends.challengeSent = [];
    return this.save();
  },

  decreaseScore() {
    this.score -= 1;
    return this.save();
  },

  increaseScore() {
    this.score += 1;
    return this.save();
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
      birthDate: this.birthDate,
      gender: this.gender,
      location: this.location,
      about: this.about,
      currentChallenge: this.currentChallenge,
      challengeRequested: this.challengeRequested,
      challengeRequests: this.challengeRequests,
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
      currentChallenge: this.currentChallenge,
      about: this.about,
    }
  },

  serializeLeaders() {
    return {
      id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      profilePic: this.profilePic,
      about: this.about,
      currentChallenge: this.currentChallenge,
      score: this.score
    }
  }
}

userSchema.statics = {
  async createUser(user) {
    const { username } = user;
    const count = await mongoose.model('User').count({ username });
    if (count) throw new AppError('Username has been taken');
    return await mongoose.model('User').create(user);
  },

  updateWinnerScore(team) {
    return team.map(member => mongoose.model('User').findOneAndUpdate({ _id: member.id }, { $inc: { 'score': 1 } }));
  }
}

const User = mongoose.model('User', userSchema);

module.exports = User;


// const date = new month / new date / new year
const test = new Date();

