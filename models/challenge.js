const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const challengeSchema = new Schema({
  admin: { type: mongoose.Schema.ObjectId, ref: 'Admin', required: true },
  title: { type: String, required: true },
  challenges: {
    type: [String],
    required: true,
    validate: {
      validator: v => (v.length === 5),
      message: () => ('must have 5 challenges')
    }
  }, 
  teams: { type: mongoose.Schema.ObjectId, ref: 'Team', required: true },
  active: { type: Boolean, default: false },
  completedTime: { type: Date || Boolean, default: null },
  winner: { type: String, default: '' }
});

challengeSchema.pre('findOneAndDelete', async function(next) {
  await mongoose.model('Admin').findByIdAndDelete(this.admin);
  next();
});

challengeSchema.methods = {
  activateChallenge() {
    this.active = true;
    return this.save();
  },

  setTime() {
    this.completedTime = Date.now() + (1000 * 60 * 10);
    return this.save();
  },

  clearTime() {
    this.completedTime = null;
    return this.save();
  },

  setWinner(winner) {
    this.winner = winner;
    return this.save();
  },

  serialize() {
    return {
      id: this._id,
      admin: this.admin,
      title: this.title,
      challenges: this.challenges,
      teams: this.teams,
      active: this.active,
      completedTime: this.completedTime,
      winner: this.winner
    }
  }
}

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge