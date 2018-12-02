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
    const { adminId, userId, challengeId, group, teamId } = req.body;

    try { 
      const admin = await Admin.findOne({ _id: adminId });
      const user = await User.findOne({ _id: userId });
      const teams = await Team.findOne({ _id: teamId });

      admin.usersRequest = admin.usersRequest.filter(val => JSON.stringify(val) !== JSON.stringify(userId));
      await admin.save();
      if (user.currentChallenge.id) return res.json('user is already in a challenge');
      user.currentChallenge.id = challengeId;
      teams[group].team.push(user.serializeUserDetails());
      user.currentChallenge.challengeRequested.id = null;
      await user.save();
      await teams.save();

      return res.status(200).json('user was accepted for challenge');
    } catch (error) {
      return res.status(500).json(error);
    }
  },

  requestChallengeRejected: async(req, res) => {
    const { userId, adminId } = req.body;

    try {
      const adminId = await User.findOne({ _id: adminId });
      const user = await User.findOne({ _id: userId });
      
      admin.usersRequest = admin.usersRequest.filter(val => JSON.stringify(val) !== JSON.stringify(userId));
      user.currentChallenge.challengeRequested.id = null;
      await user.save();
      await admin.save();

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
      admin.proofChallenged = admin.proofChallenged.filter(proof => JSON.stringify(proof.id) !== JSON.stringify(proofId));
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

      admin.proofChallenged = admin.proofChallenged.filter(proof => JSON.stringify(proof.id) !== JSON.stringify(proofId));
      proof.challenged = false;

      await admin.save();
      await proof.save();

      return res.status(200).json('proof accepted despite challenge');
    } catch (error) {
      return res.status(500).json(error);
    }
  }
}