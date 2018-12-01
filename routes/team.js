const express = require('express');
const router = express.Router();

const tc = require('../controllers/teamController');
const { parser } = require('../fileMiddleware');
const { authJwt } = require('../auth/strategies');

router.get('/:id', authJwt, tc.getTeams);
router.put('/updateScore', authJwt, tc.updateTeamScore);
router.get('/proof/:proofId', authJwt, tc.getProof);
router.put('/uploadProof', parser.single('proof'), authJwt, tc.uploadProof);
router.put('/challengeProof', authJwt, tc.challengeProof);

module.exports = router;