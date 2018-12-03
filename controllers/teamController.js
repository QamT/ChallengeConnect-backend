const { ObjectID } = require('mongodb');

const { AppError, wrapAsync, validationHandler } = require('../utils');
const User = require('../models/user');
const Challenge = require('../models/challenge');
const { Team, Proof } = require('../models/team');
const Admin = require('../models/admin');

module.exports = {

  getTeams: wrapAsync(async(req, res, next) => {
    const { teamId } = req.params;

    if(!ObjectID.isValid(teamId)) throw new AppError('Invalid Team Id');

    const teams = await Team.findOne({ _id: teamId });
    res.status(200).json(teams.serialize());
  }),

  uploadProof: wrapAsync(async(req, res, next) => {
    const { proofId, teamId, group } = req.body;
    const { url, public_id } = req.file;
  
    if (!req.file) throw new AppError('Must upload an image or video');
  
    const proof = await Proof.findById(proofId);
    const user = await User.findById(req.user.id);
    const team = await Team.findById(teamId);

    if (proof.url) return res.json(team.serialize());

    await proof.setProof(url, public_id.split('/')[1], user.firstName, req.user.id);
    await user.increaseScore();
    await team.increaseTeamScore(group);
    
    res.status(200).json(team.serialize());
  }),

  challengeProof: wrapAsync(async(req, res, next) => {
    const { proofId, adminId, teamId, reason } = req.body;

    req.getValidationResult().then(validationHandler());

    const admin = await Admin.findById(adminId);
    const proof = await Proof.findById(proofId);

    if (proof.challenged) return res.json(await Team.findById(teamId).then(team => team.serialize()));

    await proof.challengeProof(reason);
    await admin.pushChallenged(proof.serialize());
    const team = await Team.findById(teamId);

    res.status(200).json(team.serialize());
  })
}