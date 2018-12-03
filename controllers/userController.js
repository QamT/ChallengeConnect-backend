const { AppError, wrapAsync, validationHandler } = require('../utils');

const User = require( '../models/user');
const Challenge = require( '../models/challenge');
const Admin = require( '../models/admin');
const { Team, Proof } = require( '../models/team');

module.exports = {

  getUser: wrapAsync(async(req, res, next) => {
    const user = await User.findOne({ _id: req.user.id });
    res.status(200).json(user.serializeDetails());
  }),

  registerUser: wrapAsync(async(req, res, next) => {
    const { username, password, firstName, lastName } = req.body;

    req.getValidationResult().then(validationHandler());

    const user = await User.createUser({ username, password, firstName, lastName });
    res.status(201).json(user.serializeDetails());
  }),

  registerUserDetails: wrapAsync(async(req, res, next) => { 
    const user = await User.findById(req.user.id);

    req.getValidationResult().then(validationHandler());

    await user.registerDetails(req);
    console.log(user.serializeDetails())
    res.status(200).json(user.serializeDetails())
  }),

  sendFriendRequest: wrapAsync(async(req, res, next) => {
    const { userId } = req.body;
   
    const user = await User.findById(req.user.id);
    const otherUser = await User.findById(userId);

    await user.pushFriendRequest(userId);
    await otherUser.sendFriendRequest(req.user.id);
    
    res.status(200).json(user.friends.friendRequested);
  }),

  acceptFriendRequest: wrapAsync(async(req, res, next) => {
    const { userId } = req.body;

    const user = await User.findById(req.user.id);
    const otherUser = await User.findById(userId);

    await user.acceptFriendRequest(userId);
    await otherUser.addFriendRequested(req.user.id);
   
    res.status(200).json({ list: user.friends.list, requests: user.friends.friendRequests });
  }),

  rejectFriendRequest: wrapAsync(async(req, res, next) => {
    const { userId } = req.body;

    const user = await User.findById(req.user.id);
    const otherUser = await User.findById(userId);

    await user.removeFriendRequests(userId);
    await otherUser.removeFriendRequested(req.user.id);

    res.status(200).json(user.friends.friendRequests);
  }),

  removeFriend: wrapAsync(async(req, res, next) => {
    const { userId } = req.body;

    const user = await User.findById(req.user.id);
    const otherUser = await User.findById(userId);

    await user.removeFriend(userId);
    await otherUser.removeFriend(req.user.id);
    
    res.status(200).json(user.friends.list);
  }),

  resetUserChallenge: wrapAsync(async(req, res, next) => {
    const { challengeId, teamId } = req.body;

    const user = await User.findById(req.user.id);
    const teams = await Team.findById(teamId);
    
    await user.resetChallenge();
    const membersA = await Promise.all(Team.getMembers(teams['a'].team));
    const membersB  = await Promise.all(Team.getMembers(teams['b'].team));
    const activeMembersA = membersA.filter(challenge => JSON.stringify(challenge) !== JSON.stringify(challengeId));
    const activeMembersB = membersB.filter(challenge => JSON.stringify(challenge) !== JSON.stringify(challengeId));

    if (!activeMembersA.length && !activeMembersB.length) {
      await Challenge.findOneAndDelete({ _id: challengeId }); 
      await Team.findOneAndDelete({ _id: teamId });
    }

    res.status(200).json('reset user challenge');
  })
}
