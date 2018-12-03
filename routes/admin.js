const express = require('express');
const router = express.Router();

const ac = require('../controllers/adminController');
const { authJwt } = require('../auth/strategies');

router.get('/:adminId', authJwt, ac.getAdmin);
router.post('/acceptUser', authJwt, ac.requestChallengeAccepted);
router.delete('/rejectUser', authJwt, ac.requestChallengeRejected);
router.put('/denyProof', authJwt, ac.denyChallengedProof);
router.put('/acceptProof', authJwt, ac.acceptChallengedProof);

module.exports = router;