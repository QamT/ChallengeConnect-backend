const express = require('express');
const router = express.Router();

const uc = require('../controllers/userController');
const v = require('../validations/user');
const { profileParser } = require('../fileMiddleware');
const { authJwt } = require('../auth/strategies');

router.get('/user', authJwt, uc.getUser);
router.post('/register', v.validateUser, uc.registerUser);
router.post('/profile', v.validateDetails, profileParser.single('profile'), authJwt, uc.registerUserDetails);
router.post('/friend/send', authJwt, uc.sendFriendRequest);
router.put('/friend/accept', authJwt, uc.acceptFriendRequest);
router.put('/friend/reject', authJwt, uc.rejectFriendRequest);
router.delete('/friend/remove', authJwt, uc.removeFriend);
router.delete('/reset', authJwt, uc.resetUserChallenge);

module.exports = router;