const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cloudinary = require('cloudinary');

const { proofStorage } = require('../fileMiddleware');

const proofSchema = new Schema({
  url: { type: String, default: '' },
  id: { type: String, default: '' },
  challenged: { type: Boolean, default: false },
  user: { 
    id: { type: mongoose.Schema.ObjectId || Boolean, ref: 'User', default: null },
    name: { type: String, default: '' }
  },
  reason: { type: String, default: '' }
});

const teamSchema = new Schema({
  a: {
    team: {
      type:  [
        { 
          id: { type: mongoose.Schema.ObjectId, ref: 'User' },
          firstName: String,
          lastName: String,
          profilePic: {
            url: String,
            id: String
          },
          about: String
        }
      ],
      validate: {
        validator: v => (v.length <= 5),
        message: () => ('must have 5 or less members')
      }
    },
    proofs: {
      type: [{ type: mongoose.Schema.ObjectId, ref: 'Proof' }],
      validate: {
        validator: v => (v.length === 5),
        message: () => ('must have 5 proofs')
      }
    },
    score: { type: Number, default: 0 }
  },
  b: {
    team: {
      type: [
        { 
          id: { type: mongoose.Schema.ObjectId, ref: 'User'},
          firstName: String,
          lastName: String,
          profilePic: {
            url: String,
            id: String
          },
          about: String
        }
      ],
      validate: {
        validator: v => (v.length <= 5),
        message: () => ('must have 5 or less members')
      }
    },
    proofs: {
      type: [{ type: mongoose.Schema.ObjectId, ref: 'Proof' }],
      validate: {
        validator: v => (v.length === 5),
        message: () => ('must have 5 proofs')
      }
    },
    score: { type: Number, default: 0 }
  }
});

teamSchema.pre('findOne', function(next) {
  this.populate('a.proofs', 'url challenged user reason')
    .populate('b.proofs', 'url challenged user reason');
  next();
}); 

teamSchema.pre('findOneAndDelete', async function(next) {
  await Promise.all(this['a'].proofs.map(proof => mongoose.model('Proof').findByIdAndDelete(proof)));
  await Promise.all(this['b'].proofs.map(proof => mongoose.model('Proof').findByIdAndDelete(proof)));
  next();
});

teamSchema.post('save', function(doc, next) {
  doc.populate('a.proofs', 'url challenged user reason')
    .populate('b.proofs', 'url challenged user reason')
    .execPopulate()
    .then(() => next());
});

teamSchema.methods = {
  addMember(group, user) {
    this[group].team.push(user);
    return this.save();
  },

  isWinner(...args) {
    if (args.length === 2) {
      return this[args[0]].score === 5 && this[args[1]].score === 5;
    }
    return this[args[0]].score === 5;
  },

  decreaseTeamScore(team) {
    this[team].score -= 1;
    return this.save();
  },

  increaseTeamScore(team) {
    this[team].score += 1;
    return this.save();
  },

  serialize() {
    return {
      id: this._id,
      teamA: this.a,
      teamB: this.b
    }
  }
}

teamSchema.statics = {
  getMembers(team) {
    return team.map(member => 
      mongoose.model('User').findById(member.id)
      .then(user => user.currentChallenge.id));
  }
}

proofSchema.methods = {
  async clearProof(fileId) {
    await proofStorage.cloudinary.uploader.destroy(fileId);
    this.url = '';
    this.id = '';
    this.challenged = false;
    this.reason = '';
    this.user.id = null;
    this.user.name = '';
    return this.save();
  },

  acceptProof() {
    this.challenged = false;
    this.reason = '';
    return this.save();
  },

  setProof(url, id, name, userId) {
    this.url = url;
    this.id = id;
    this.user.name = name;
    this.user.id = userId;
    return this.save();
  },

  challengeProof(reason) {
    this.challenged = true;
    this.reason = reason;
    return this.save();
  },

  serialize() {
    return {
      id: this._id,
      url: this.url,
      challenged: this.challenged,
      user: this.user,
      reason: this.reason
    }
  }
}

proofSchema.statics = {
  createProofs() {
    return Promise.all([1,2,3,4,5].map(i => mongoose.model('Proof').create({}).then(proof => proof._id)));
  }
}

const Team = mongoose.model('Team', teamSchema);
const Proof = mongoose.model('Proof', proofSchema);

module.exports = { Team, Proof }