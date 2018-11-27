const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema= new Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  usersRequest: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  proofChallenged: [{ type: mongoose.Schema.ObjectId, ref: 'Proof' }],
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