const { ObjectID } = require('mongodb');

const { AppError, wrapAsync } = require('../utils');
const User = require( '../models/user');
const { Team, Proof } = require('../models/team');
const Admin = require('../models/admin');

module.exports = {

  getAdmin: wrapAsync(async(req, res, next) => {
    const { adminId } = req.params;

    if (!ObjectID.isValid(adminId)) throw new AppError(`Invalid Admin Id`);

    const admin = await Admin.findById(adminId);
    res.status(200).json(admin.serialize());
  }),

  requestChallengeAccepted: wrapAsync(async(req, res, next) => {
    const { adminId, userId, challengeId, group, teamId } = req.body;

    const admin = await Admin.findById(adminId);
    const user = await User.findById(userId);
    const teams = await Team.findById(teamId);

    await admin.removeRequest(userId);

    if (user.currentChallenge.id) {
      return res.json({ message: `${user.firstName} is already in another challenge.`, admin: admin.serialize() });
    }
    if (teams[group].team.length === 5) throw new AppError(`Team ${group} is full`);

    await user.addChallenge(challengeId);
    await teams.addMember(group, user.serializeUserDetails());
    
    res.status(200).json({ admin: admin.serialize(), team: teams[group].team });
  }),

  requestChallengeRejected: wrapAsync(async(req, res, next) => {
    const { userId, adminId, challengeId } = req.body;

    const admin = await Admin.findById(adminId);
    const user = await User.findById(userId);
      
    await admin.removeRequest(userId);
    await user.removeChallengeRequested(challengeId);

    res.status(200).json(admin.serialize());
  }),

  denyChallengedProof: wrapAsync(async(req, res, next) => {
    const { proofId, adminId, userId, teamId, group } = req.body

    const admin = await Admin.findById(adminId);
    const proof = await Proof.findById(proofId);
    const user = await User.findById(userId);
    const team = await Team.findById(teamId);
    const fileId = `reactapp/${proof.id}`;

    await proof.clearProof(fileId);
    await admin.removeChallenged(proofId);
    await user.decreaseScore();
    await team.decreaseTeamScore(group);

    res.status(200).json(admin.serialize());
  }),

  acceptChallengedProof: wrapAsync(async(req, res, next) => {
    const { proofId, adminId } = req.body

    const admin = await Admin.findById(adminId);
    const proof = await Proof.findById(proofId);
   
    await admin.removeChallenged(proofId);
    await proof.acceptProof();
   
    res.status(200).json(admin.serialize());
  })
}