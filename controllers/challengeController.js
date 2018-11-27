const { User } = require('../models/user');
const { Challenge } = require('../models/challenge');
const { Team, Proof } = require('../models/team');
const { Admin } = require('../models/admin');

module.exports = {

  getChallenge: async(req, res) => {
    const { challengeId } = req.params.id;

    try {
      const challenge = await Challenge.findOne({ _id: challengeId });

      return res.status(200).json(challenge.serialize());
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  addChallenge: async(req, res) => {
    const { title, challenges } = req.body;

    try {
      const user = await User.findOne({ _id: req.user.id });

      const admin = await Admin.create({ user: req.user.id });
      let proofA = [1,2,3,4,5].reduce(async(acc, val) => {
        acc.push(await Proof.create({}));
        return acc;
      }, []);
      let proofB = [1,2,3,4,5].reduce(async(acc, val) => {
        acc.push(await Proof.create({}));
        return acc;
      }, [])
      
      const teams = await teams.create({
        a: {
          team: [],
          proof: proofA,
          score: 0
        },
        b: {
          team: [],
          proof: proofB,
          score: 0
        }
      });
      const challenge = await challenge.create({
        admin: admin._id,
        title,
        challenges,
        teams: teams._id,
      });

      user.currentChallenge.id = challenge._id;
      await user.save();
      return res.status(201).json(challenge.serialize());
    } catch (error) {
      return res.status(500).json(error)
    }
  },

  requestChallenge: async(req, res) => {
    const { challengeId, adminId } = req.body;

    try {
      const user = await User.findOne({ _id: req.user.id });
      const admin = await Admin.findOne({ _id: adminId });

      user.currentChallenge.challengeRequested.id = challengeId;
      user.currentChallenge.challengeRequested.team = team;
      admin.usersRequests.push({ id: req.user.id })
      await user.save();
      await admin.save();

      return res.status(200).json(user.serialize());
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  makeChallengeActive: async(req, res) => {
    const { challengeId } = req.body;

    try {
      const challenge = await Challenge.findOne({ _id: challengeId });

      challenge.active = true;
      await challenge.save();

      return res.status(200).json(challenge.serialize());
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  completeChallenge: async(req, res) => {
    const { challengeId } = req.body;

    try {
      const challenge = await Challenge.findOne({ _id: challengeId });

      challenge.completed = true;
      await challenge.save();

      return res.status(200).json(challenge.serialize());
    } catch (error) {
      return res.status(500).json(error);
    }
  }
}