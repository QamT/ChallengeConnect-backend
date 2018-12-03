const express = require('express');
const router = express.Router();

const tc = require('../controllers/teamController');
const v = require('../validations/team');
const { proofParser } = require('../fileMiddleware');
const { authJwt } = require('../auth/strategies');

router.get('/:teamId', authJwt, tc.getTeams);
router.put('/uploadProof', proofParser.single('proof'), authJwt, tc.uploadProof);
router.put('/challengeProof', v.validateReason, authJwt, tc.challengeProof);

module.exports = router;