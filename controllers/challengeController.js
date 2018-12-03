const { ObjectID } = require('mongodb');

const { AppError, wrapAsync, validationHandler } = require('../utils');
const User = require('../models/user');
const Challenge = require('../models/challenge');
const { Team, Proof } = require('../models/team');
const Admin = require('../models/admin');

module.exports = {

  getChallenge: wrapAsync(async(req, res, next) => {
    const { challengeId } = req.params;

    if (!ObjectID.isValid(challengeId)) throw new AppError(`Invalid Challenge Id`);
    
    const challenge = await Challenge.findById(challengeId);
    res.status(200).json(challenge.serialize());
  }),

  addChallenge: wrapAsync(async(req, res, next) => {
    const { title, challenges } = req.body;

    req.getValidationResult().then(validationHandler());

    const user = await User.findById(req.user.id);

    if (user.currentChallenge.id) {
      const challenge = await Challenge.findById(user.currentChallenge.id);
      return res.json(challenge.serialize());
    }
    if ([...new Set(challenges)].length < 5) throw new AppError('challenges must be unique');

    const admin = await Admin.create({ user: req.user.id });
    const proofA = await Proof.createProofs();
    const proofB = await Proof.createProofs();
    const teams = await Team.create({
      a: { team: [user.serializeUserDetails()], proofs: proofA },
      b: { proofs: proofB }
    });
    const challenge = await Challenge.create({
      admin: admin._id,
      title,
      challenges,
      teams: teams._id
    });
    await user.addChallenge(challenge._id);

    res.status(201).json(challenge.serialize());
  }),

  sendChallenge: wrapAsync(async(req, res, next) => {
    const { challengeId, userId } = req.body;
    const user =  await User.findById(req.user.id);
    const otherUser = await User.findById(userId);
    const challenge = await Challenge.findById(challengeId);
    const userChallenge = user.currentChallenge.id;
   
    if (!userChallenge || JSON.stringify(userChallenge) !== JSON.stringify(challengeId)) throw new AppError(`Invalid challenge request`);
    if (challenge.active) throw new AppError(`Can't send challenge request for an active challenge.`);

    await user.pushChallengeSent(userId);
    await otherUser.sendChallenge(challengeId, req.user.id);

    res.status(200).json(user.friends.challengeSent);
  }),

  requestChallenge: wrapAsync(async(req, res, next) => {
    const { challengeId, adminId, group } = req.body;

    const user = await User.findById(req.user.id);
    const challenge = await Challenge.findById(challengeId);
    const admin = await Admin.findById(adminId);

    if (challenge.active) throw new AppError(`Can't join an active challenge`);

    await user.requestChallenge(challengeId);
    const userInfo = user.serializeUserDetails();
    userInfo.group = group;
    await admin.sendRequest(userInfo);

    res.status(200).json(user.challengeRequested);
  }),

  acceptChallenge: wrapAsync(async(req, res, next) => {
    const { userId, challengeId, teamId } = req.body;

    const user = await User.findById(req.user.id);
    const otherUser = await User.findById(userId);
    const challenge = await Challenge.findById(challengeId);
    const team = await Team.findById(teamId);
    const teams = {
      a: team['a'].team.length < 5,
      b: team['b'].team.length < 5
    }
    const myTeam = teams.a ? 'a' : 'b';

    if (user.currentChallenge.id) return res.json(user.currentChallenge.id);
    if (challenge.active) throw new AppError(`Challenge has already started.`);
    if (!teams.a && !team.b) throw new AppError(`Challenge can't accept more members`);

    await user.addChallenge(challengeId);
    await otherUser.removeChallengeSent(req.user.id);
    await team.addMember(myTeam, user.serializeUserDetails());

    res.status(200).json(user.currentChallenge.id);
  }),

  rejectChallenge: wrapAsync(async(req, res, next) => {
    const { userId } = req.body;

    const user = await User.findById(req.user.id);
    const otherUser = await User.findById(userId);

    await user.removeChallengeRequest(userId);
    await otherUser.removeChallengeSent(req.user.id);

    res.status(200).json(user.challengeRequests);
  }),

  activateChallenge: wrapAsync(async(req, res, next) => {
    const { challengeId } = req.body;

    const user = await User.findById(req.user.id);
    const challenge = await Challenge.findById(challengeId);
    const teams = await Team.findById(challenge.teams);

    if (!teams['a'].team.length || !teams['b'].team.length) throw new AppError('Both teams must have at least one member to start challenge');
    
    await user.clearChallengeSent();
    await challenge.activateChallenge();

    res.status(200).json(challenge.serialize());
  }),

  startChallengeTimer: wrapAsync(async(req, res, next) => {
    const { challengeId } = req.body;

    const challenge = await Challenge.findById(challengeId);

    if (challenge.completedTime) return res.json(challenge.completedTime);
    
    await challenge.setTime();
    res.status(200).json(challenge.completedTime);
  }),

  endChallengeTimer: wrapAsync(async(req, res, next) => {
    const { challengeId } = req.body;

    const challenge = await Challenge.findById(challengeId);

    await challenge.clearTime();
    return res.status(200).json('cleared challenge timer');
  }),

  completeChallenge: wrapAsync(async(req, res, next) => {
    const { challengeId, teamId, winner } = req.body;

    const challenge = await Challenge.findById(challengeId);
    const team = await Team.findById(teamId);

    if (challenge.winner) return res.json(challenge.serialize());

    if (winner === 'both') {
      if (!team.isWinner('a', 'b')) throw new AppError('Teams have not completed all challenges');
      
      await challenge.setWinner(winner);
      await Promise.all(User.updateWinnerScore(team['a'].team));
      await Promise.all(User.updateWinnerScore(team['b'].team));

      return res.status(200).json(challenge.serialize());
    }

    if (!team.isWinner(winner)) throw new AppError('Team has not completed all the challenges');

    await challenge.setWinner(winner);
    await Promise.all(User.updateWinnerScore(team[winner].team));

    res.status(200).json(challenge.serialize());
  })
}