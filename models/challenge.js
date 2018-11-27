const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const challengeSchema = new Schema ({
  admin: { type: mongoose.Schema.ObjectId, ref: 'Admin', required: true },
  title: { type: String, required: true },
  challenges: {
    type: [{ type: String, required: true }],
    validate: {
      validator: v => (v.length === 5),
      message: () => ('must have 5 challenges')
    }
  }, 
  teams: { type: mongoose.Schema.ObjectId, ref: 'Team', required: true },
  active: { type: Boolean, default: false },
  completed: { type: Boolean, default: false }
});

challengeSchema.methods = {
  serialize() {
    return {
      id: this._id,
      admin: this.admin,
      title: this.title,
      challenges: this.challenges,
      teams: this.teams,
      active: this.active,
      completed: this.completed
    }
  }
}

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = { Challenge }