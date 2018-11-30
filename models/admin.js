const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema= new Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  usersRequest: [{ 
    id: { type: mongoose.Schema.ObjectId, ref: 'User'},
    firstName: String,
    lastName: String,
    profilePic: {
      url: String,
      id: String
    },
    about: String
   }],
  proofChallenged: [{
    id: { type: mongoose.Schema.ObjectId, ref: 'Proof'},
    url: String,
    challenged: Boolean
   }],
});

adminSchema.methods = {
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

module.exports = { Admin };