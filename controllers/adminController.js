const cloudinary = require('cloudinary');

const { storage } = require('../fileMiddleware');
const { User } = require( '../models/user');
const { Team, Proof } = require('../models/team');
const { Admin } = require('../models/admin');


module.exports = {

  getAdmin: async(req, res) => {
    const { adminId } = req.params.id;

    try {
      const admin = Admin.findOne({ _id: adminId });

      return res.status(200).json(admin.serialize());
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  requestChallengeAccepted: async(req, res) => {
    const { adminId, challengeId, group, teamId } = req.body;

    try {
      const user = await User.findOne({ _id: adminId });
      const teams = await team.findOne({ _id: teamId });

      user.currentChallenge.id = challengeId;
      teams[group].team.push(adminId)
      user.currentChallenge.challengeRequested.id = null;
      user.currentChallenge.challengeRequested.team = null;
      await user.save();
      await team.save();

      return res.status(200).json(user.serialize());
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  requestChallengeRejected: async(req, res) => {
    const { userId } = req.body;

    try {
      const user = await User.findOne({ _id: userId });
      
      user.currentChallenge.challengeRequested.id = null;
      user.currentChallenge.challengeRequested.team = null;
      await user.save();

      return res.status(200).json(user.serialize());
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  denyChallengedProof: async(req, res) => {
    const { proofId, adminId } = req.body

    try {
      const admin = await Admin.findOne({ _id: adminId });
      const proof = await Proof.findOne({ _id: proofId });
      const fileId = `reactapp/${proof.id}`;

      await storage.cloudinary.uploader.destroy(fileId);
      admin.proofChallenged = admin.proofChallenged.filter(proof => proof.id !== proofId);
      proof.url = '';
      proof.id = '';
      proof.challenged = false;

      await admin.save();
      await proof.save();

      return res.status(200).json('proof deleted after review');
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  acceptChallengedProof: async(req, res) => {
    const { proofId, adminId } = req.body

    try {
      const admin = await Admin.findOne({ _id: adminId });
      const proof = await Proof.findOne({ _id: proofId });

      admin.proofChallenged = admin.proofChallenged.filter(proof => proof.id !== proofId);
      proof.challenged = false;

      await admin.save();
      await proof.save();

      return res.status(200).json('proof accepted despite challenge');
    } catch (error) {
      return res.status(500).json(error);
    }
  }
}