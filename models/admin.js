const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema= new Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  usersRequest: [{ 
    id: { type: mongoose.Schema.ObjectId, ref: 'User' },
    firstName: String,
    lastName: String,
    profilePic: {
      url: String,
      id: String
    },
    about: String,
    group: { type: String, enum: ['a', 'b'] }
   }],
  proofChallenged: [{
    id: { type: mongoose.Schema.ObjectId, ref: 'Proof' },
    url: String,
    challenged: Boolean,
    reason: String,
    user: { 
      id: { type: mongoose.Schema.ObjectId, ref: 'User' },
      name: String
    }
   }],
});

adminSchema.methods = {
  sendRequest(user) {
    this.usersRequest.push(user);
    return this.save();
  },

  removeRequest(id) {
    this.usersRequest = this.usersRequest.filter(user => user.id.toString() !== id.toString());
    return this.save();
  },

  removeChallenged(id) {
    this.proofChallenged = this.proofChallenged.filter(proof => proof.id.toString() !== id.toString());
    return this.save();
  },

  pushChallenged(proof) {
    this.proofChallenged.push(proof);
    return this.save();
  },

  serialize() {
    return {
      id: this._id,
      user: this.user,
      usersRequest: this.usersRequest,
      proofChallenged: this.proofChallenged
    }
  }
}

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;