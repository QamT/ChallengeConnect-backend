const cloudinary = require('cloudinary');

const { storage } = require('../fileMiddleware');
const { Challenge } = require('../models/challenge');
const { Team, Proof } = require('../models/team');
const { Admin } = require('../models/admin');

module.exports = {

  getTeams: async(req, res) => {
    const { id: teamId } = req.params;

    try {
      const teams = await Team.findOne({ _id: teamId });

      return res.status(200).json(team.serialize());
    } catch (error) {
      res.status(500).json(error);
    }
  },

  updateTeamScore: async(req, res) => {
    const { challengeId, teamId, team } = req.body;

    try {
      const teams = await Team.findOne({ _id: teamId });

      teams[team].score = teams[team].score + 1;
      await teams.save();

      if (teams[team].score === 5) {
        const challenge = Challenge.findOne({ _id: challengeId });
        challenge.completed = true;
        await challenge.save();
        return res.json(`${team} has won`);
      }

      return res.status(200).json('score updated');
    } catch (error) {
      res.status(500).json(error);
    }
  },

  getProof: async(req, res) => {
    const { proofId } = req.body;

    try {
      const proof = await Proof.findOne({ _id: proofId });

      return res.status(200).json(proof.serialize());
    } catch (error) {
      res.status(500).json(error);
    }
  },

  uploadProof: async(req, res) => {
    const { proofId } = req.body;
    const { url, public_id } = req.file

    try {
      const proof = await Proof.findOne({ _id: proofId });

      proof.url = url;
      proof.id = public_id.split('/')[1];
      await proof.save();

      return res.status(200).json('proof uploaded');
    } catch (error) {
      res.status(500).json(error);
    }
  },

  challengeProof: async(req, res) => {
    const { proofId, adminId } = req.body;

    try {
      const admin = await Admin.findOne({ _id: adminId });
      const proof = await Proof.findOne({ _id: proofId });

      admin.proofChallenged.push(proofId);
      proof.challenged = true;
      await admin.save();
      await proof.save();

      return res.status(200).json('proof challenged');
    } catch (error) {
      res.status(500).json(error);
    }
  }
}