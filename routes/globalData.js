const express = require('express');
const router = express.Router();

const { User } = require( '../models/user');
const { Challenge } = require('../models/challenge');

router.get('/findUser/:name', async(req, res) => {
  let { name } = req.params;
  name = name.split('+');
  const firstName = name[0].charAt(0).toUpperCase() + name[0].slice(1).toLowerCase();
  const lastName = name[1].charAt(0).toUpperCase() + name[1].slice(1).toLowerCase();
  console.log(name);
  try {
    const users = await User.find({ firstName });
    console.log(users);
    const filterByLastName = users.filter(user => user.lastName.toLowerCase().includes(lastName.toLowerCase()));
    if (!filterByLastName) return res.json(null);
    const userInfo = filterByLastName.map(user => user.serializeUserDetails());
    console.log(userInfo);

    return res.json(userInfo);
  } catch (error) {
    return res.status(500).json(userInfo);
  }
  
});

router.get('/leaderboard', async(req, res) => {
  try {
    const leaders = await User.find({}).sort({'score': -1}).limit(10);
    const leaderboard = leaders.map(leader => leader.serializeLeaderInfo());

    return res.json({ leaderboard })
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get('/getChallenges', async(req, res) => {
  try {
    const allChallenges = await Challenge.find({});
    const challenges = allChallenges.map(challenge => challenge.serialize());
    return res.json({ challenges })
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;

