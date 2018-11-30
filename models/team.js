const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const proofSchema = new Schema ({
  url: { type: String, default: '' },
  id: { type: String, default: '' },
  challenged: { type: Boolean, default: false }
})

const teamSchema = new Schema ({
  a: {
    team: [{ 
      id: { type: mongoose.Schema.ObjectId, ref: 'User'},
      firstName: String,
      lastName: String,
      profilePic: {
        url: String,
        id: String
      },
      about: String
     }],
    proofs: {
      type: [proofSchema],
      validate: {
        validator: v => (v.length === 5),
        message: () => ('must have 5 proofs')
      }
    },
    score: { type: Number, default: 0}
  },
  b: {
    team: [{ 
      id: { type: mongoose.Schema.ObjectId, ref: 'user'},
      firstName: String,
      lastName: String,
      profilePic: {
        url: String,
        id: String
      },
      about: String
     }],
    proofs: {
      type: [proofSchema],
      validate: {
        validator: v => (v.length === 5),
        message: () => ('must have 5 proofs')
      }
    },
    score: { type: Number, default: 0}
  }
});

teamSchema.methods = {
  serialize() {
    return {
      id: this._id,
      teamA: this.a,
      teamB: this.b
    }
  }
}

proofSchema.methods = {
  serialize() {
    return {
      id: this._id,
      url: this.url,
      challenged: this.challenged
    }
  }
}

const Team = mongoose.model('Team', teamSchema);
const Proof = mongoose.model('Proof', proofSchema);

module.exports = { Team, Proof }