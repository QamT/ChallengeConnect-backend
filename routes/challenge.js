const express = require('express');
const router = express.Router();

const cc = require('../controllers/challengeController');
const { authJwt } = require('../auth/strategies');

router.get('/:id', authJwt, cc.getChallenge);
router.post('/add', authJwt, cc.addChallenge);
router.post('/request', authJwt, cc.requestChallenge);
router.put('/activate', authJwt, cc.makeChallengeActive);
router.put('/complete', authJwt, cc.completeChallenge);

module.exports = router;