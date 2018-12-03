const express = require('express');
const router = express.Router();

const cc = require('../controllers/challengeController');
const v = require('../validations/challenge');
const { authJwt } = require('../auth/strategies');

router.get('/:challengeId', authJwt, cc.getChallenge);
router.post('/add', v.validateChallenge, authJwt, cc.addChallenge);
router.post('/send', authJwt, cc.sendChallenge);
router.put('/accept', authJwt, cc.acceptChallenge);
router.put('/reject', authJwt, cc.rejectChallenge);
router.post('/request', authJwt, cc.requestChallenge);
router.put('/activate', authJwt, cc.activateChallenge);
router.put('/complete', authJwt, cc.completeChallenge);
router.put('/startTimer', authJwt, cc.startChallengeTimer);
router.put('/endTimer', authJwt, cc.endChallengeTimer);

module.exports = router;