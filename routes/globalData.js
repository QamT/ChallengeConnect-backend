const express = require('express');
const router = express.Router();

const { User } = require( '../models/user');
const { Challenge } = require('../models/challenge');

router.get('/findUser', async(req, res) => {
  const { name } = req.body;
  const firstName = name.split(' ')[0].toLowerCase();
  const lastName = name.split(' ')[1].toLowerCase();

  try {
    const user = await User.find({ firstName });
    const filterByLastName = user.filter(user => user.lastName.toLowerCase().includes(lastName));
    if (!filterByLastName) return res.json(null);

    return res.json({ results: filterByLastName });
  } catch (error) {
    return res.status(500).json(error);
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
    const challenges = allChallenges(challenge => challenge.serialize());

    return res.json({ challenges })
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;

