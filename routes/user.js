const express = require('express');
const router = express.Router();

const uc = require('../controllers/userController');
const { parser } = require('../fileMiddleware');
const { authJwt } = require('../auth/strategies');

router.get('/user', authJwt, uc.getUser);
router.post('/register', uc.registerUser);
router.post('/profile', parser.single('profilePic'), authJwt, uc.registerUserDetails);
router.put('/updateScore', authJwt, uc.updateScore);
router.post('/friend/send', authJwt, uc.sendFriendRequest);
router.put('/friend/accept', authJwt, uc.acceptFriendRequest);
router.put('/friend/reject', authJwt, uc.rejectFriendRequest);
router.delete('/friend/remove', authJwt, uc.removeFriend);
//reset challenge user data

module.exports = router;