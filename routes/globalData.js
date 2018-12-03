const express = require('express');
const router = express.Router();

const { wrapAsync } = require('../utils');
const v = require('../validations/global');
const User = require( '../models/user');
const Challenge = require('../models/challenge');
const { Team } = require('../models/team');

router.get('/findUser/:name', v.sanitizeName, wrapAsync(async(req, res, next) => {
  const { name } = req.params;
  const fullName = name.split('+');
  let firstName, lastName = null, filterByLastName = null;;

  if (fullName.length > 2) return res.json([]);
  firstName = fullName[0].charAt(0).toUpperCase() + fullName[0].slice(1).toLowerCase();
  if (fullName.length > 1) lastName = fullName[1].charAt(0).toUpperCase() + fullName[1].slice(1).toLowerCase();
  
  const users = await User.find().then(users => users.filter(user => user.firstName.includes(firstName)));
  if (!users.length) return res.json([]);
  let userInfo = users.map(user => user.serializeUserDetails());
 
  if (lastName) {
    filterByLastName = users.filter(user => user.lastName.includes(lastName));
    if (!filterByLastName) return res.json([]);
    userInfo = filterByLastName.map(user => user.serializeUserDetails());
  }
 
  res.json(userInfo);
}));

router.get('/leaderboard', wrapAsync(async(req, res, next) => {
  const leaders = await User.find({}).sort({ 'score': -1 }).limit(10);
  const leaderboard = leaders.map(leader => leader.serializeLeaders());
  res.json({ leaderboard });
}));

router.get('/getChallenges', wrapAsync(async(req, res, next) => {
  const allChallenges = await Challenge.find({ 'active': false });
  const teams = await Promise.all(allChallenges.map(challenge => Team.findById(challenge.teams)));
  const challenges = allChallenges.map(challenge => challenge.serialize());
  res.json({ challenges, teams: teams.map(team => team.serialize()) });
}));

module.exports = router;

